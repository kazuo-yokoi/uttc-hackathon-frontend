import { useState, useEffect } from "react";
import { useTweets } from "./hooks/useTweets";
import {
  Tweet,
  User,
  NewPostData,
  postTweet,
  unlikeTweet,
  likeTweet,
  followUser,
  unfollowUser,
  getMyProfile,
} from "./api/api";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { ErrorMessage } from "./components/ErrorMessage";
import { RepostModal } from "./components/RepostModal";
import { HomePage } from "./pages/HomePage";
import { TweetDetailPage } from "./pages/TweetDetailPage";
import { UserProfilePage } from "./pages/UserProfilePage";
import { useAuthContext } from "./context/AuthContext";
import { ProfileContext } from "./context/ProfileContext";
import { Sidebar } from "./components/Sidebar";
import { EditProfileModal } from "./components/EditProfileModal";

type ViewState =
  | { mode: "timeline" }
  | { mode: "detail"; tweetId: number }
  | { mode: "profile"; username: string }
  | { mode: "my-profile" };

type TimelineType = "foryou" | "following";
export type SentimentFilter = "all" | "positive" | "neutral" | "negative";
interface AppContentProps {
  user: NonNullable<ReturnType<typeof useAuthContext>["user"]>; // userがnullでないことを型レベルで保証
}

export const MainApp: React.FC<AppContentProps> = ({ user }) => {
  const [view, setView] = useState<ViewState>({ mode: "timeline" });
  const [timelineType, setTimelineType] = useState<TimelineType>("foryou");
  const currentUserID = user!.uid;
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const {
    allTweets,
    setAllTweets,
    isLoading,
    error,
    addTweet,
    toggleLikeState,
  } = useTweets(currentUserID, timelineType);
  const [postError, setPostError] = useState<string | null>(null);
  // リポスト/引用モーダルのためのState
  const [repostModalTarget, setRepostModalTarget] = useState<Tweet | null>(
    null
  );
  const [sentimentFilter, setSentimentFilter] =
    useState<SentimentFilter>("all");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const myProfile = await getMyProfile(currentUserID);
        setCurrentUser(myProfile);
      } catch (err) {
        console.error("プロフィールの取得に失敗しました", err);
      }
    };

    fetchProfile();
  }, [currentUserID]);

  //新規投稿処理
  const handlePost = async (content: string, replyToId?: number) => {
    setPostError(null);

    const newPostData: NewPostData = {
      user_id: currentUserID,
      text: content,
      type: replyToId ? "reply" : "tweet",
      reply_to_id: replyToId || undefined,
    };

    try {
      const createdPost = await postTweet(newPostData);
      //新しく投稿したツイートにはいいねの情報がないので補完
      const newTweetWithLikeState = {
        ...createdPost,
        is_liked: false,
        likes_count: 0,
      };
      addTweet(newTweetWithLikeState);
    } catch (err: any) {
      console.error("Failed to post:", err);
      setPostError(
        "投稿に失敗しました。サーバーの接続状況やCORS設定を確認してください。"
      );
      throw err;
    }
  };

  // いいね切り替え処理
  const handleLikeToggle = async (tweetId: number) => {
    const tweet = allTweets.find((t) => t.id === tweetId);
    if (!tweet) return;

    // 1. 楽観的更新
    toggleLikeState(tweetId);

    // 2. API呼び出し
    try {
      if (tweet.is_liked) {
        await unlikeTweet(currentUserID, tweetId);
      } else {
        await likeTweet(currentUserID, tweetId);
      }
    } catch (err) {
      console.error("いいねの更新に失敗:", err);
      // 3. エラーが発生したらUIを元に戻す
      toggleLikeState(tweetId);
    }
  };

  //フォローの切り替え
  const handleFollowToggle = async (targetUser: User) => {
    const originalFollowingState = targetUser.is_following;
    const originalFollowersCount = targetUser.followers_count;

    // 1. 楽観的更新
    const updatedUser = {
      ...targetUser,
      is_following: !originalFollowingState,
      followers_count: originalFollowingState
        ? originalFollowersCount - 1
        : originalFollowersCount + 1,
    };

    setAllTweets((prev) =>
      prev.map((tweet) => {
        if (tweet.user.firebase_uid === targetUser.firebase_uid) {
          tweet.user = { ...tweet.user, ...updatedUser };
        }
        if (tweet.original?.user.firebase_uid === targetUser.firebase_uid) {
          tweet.original.user = { ...tweet.original.user, ...updatedUser };
        }
        return tweet;
      })
    );

    // 2. API呼び出し
    try {
      if (originalFollowingState) {
        await unfollowUser(currentUserID, targetUser.firebase_uid);
      } else {
        await followUser(currentUserID, targetUser.firebase_uid);
      }
    } catch (err) {
      // 3. エラーが発生したらUIを元に戻す
      console.error("Follow toggle failed", err);
      setAllTweets((prev) =>
        prev.map((tweet) => {
          if (tweet.user.firebase_uid === targetUser.firebase_uid) {
            tweet.user.is_following = originalFollowingState;
            tweet.user.followers_count = originalFollowersCount;
          }
          if (tweet.original?.user.firebase_uid === targetUser.firebase_uid) {
            tweet.original.user.is_following = originalFollowingState;
          }
          return tweet;
        })
      );
    }
  };

  // リポスト・引用投稿のハンドラ
  const handleRepostOrQuote = async (
    type: "repost" | "quote",
    content?: string
  ) => {
    if (!repostModalTarget) return;
    setPostError(null);

    // 元ツイートがリポストや引用だった場合、その更に元をIDとして使う
    const originalId = repostModalTarget.original_id || repostModalTarget.id;

    const newPostData: NewPostData = {
      user_id: currentUserID,
      type: type,
      text: content,
      original_id: originalId,
    };

    try {
      const createdPost = await postTweet(newPostData);
      addTweet(createdPost);
    } catch (err) {
      console.error("Failed to post:", err);
      setPostError("投稿に失敗しました。");
      throw err; // re-throw to be caught by modal
    }
  };

  const openRepostModal = (tweet: Tweet) => {
    setRepostModalTarget(tweet);
  };
  const handleProfileUpdate = (updatedUser: User) => {
    setCurrentUser(updatedUser);
  };

  // --- ナビゲーション関数 ---
  const navigateToTimeline = () => setView({ mode: "timeline" });
  const navigateToDetail = (tweetId: number) =>
    setView({ mode: "detail", tweetId });
  const navigateToProfile = (username: string) =>
    setView({ mode: "profile", username });

  // 日付をフォーマットするヘルパー関数
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "long",
    }).format(date);
  };

  // created_atの日付をフォーマット
  const registrationDate = formatDate(currentUser?.created_at);

  // --- 表示するコンポーネントを決定 ---
  const renderContent = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }
    if (error) {
      return <ErrorMessage message={error} />;
    }

    switch (view.mode) {
      case "timeline":
        return (
          <HomePage
            allTweets={allTweets}
            handlePost={(content) => handlePost(content)}
            postError={postError}
            onTweetClick={navigateToDetail}
            onUserClick={navigateToProfile}
            onLikeToggle={handleLikeToggle}
            onRepostClick={openRepostModal}
            sentimentFilter={sentimentFilter}
            setSentimentFilter={setSentimentFilter}
            timelineType={timelineType}
            setTimelineType={setTimelineType}
          />
        );

      case "detail":
        const selectedTweet = allTweets.find((t) => t.id === view.tweetId);
        if (!selectedTweet) {
          return (
            <ErrorMessage message="指定されたツイートが見つかりません。" />
          );
        }
        const replies = allTweets
          .filter((t) => t.reply_to_id === selectedTweet.id)
          .sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
          );

        return (
          <TweetDetailPage
            tweet={selectedTweet}
            replies={replies}
            onPostReply={(content) => handlePost(content, selectedTweet.id)}
            onBack={navigateToTimeline}
            onUserClick={navigateToProfile}
            onLikeToggle={handleLikeToggle}
            onRepostClick={openRepostModal}
          />
        );

      case "profile":
        return (
          <UserProfilePage
            username={view.username}
            currentUserID={currentUserID}
            allTweets={allTweets}
            onBack={navigateToTimeline}
            onTweetClick={navigateToDetail}
            onUserClick={navigateToProfile}
            onLikeToggle={handleLikeToggle}
            onRepostClick={openRepostModal}
            onFollowToggle={handleFollowToggle}
          />
        );

      case "my-profile":
        return (
          <div className="bg-slate-900 text-white rounded-lg overflow-hidden">
            <div className="relative">
              <div
                className="h-48 md:h-56 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${
                    currentUser?.profile_img ||
                    "https://placehold.co/1500x500/334155/E2E8F0?text=Header+Image"
                  })`,
                }}
                aria-hidden="true"
              />
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <img
                    src={
                      currentUser?.avatar_img ||
                      `https://placehold.co/96x96/1DA1F2/FFFFFF?text=${currentUser?.display_name.charAt(
                        0
                      )}`
                    }
                    alt={`${currentUser?.display_name}のアバター`}
                    className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-slate-900 -mt-16 md:-mt-20"
                  />
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="mt-4 bg-blue-500 px-4 py-2 rounded-full"
                  >
                    プロフィールを編集
                  </button>
                </div>
                <div>
                  <h2>名前: {currentUser?.display_name}</h2>
                </div>
                {currentUser?.self_introduction && (
                  <p className="mt-4 text-white whitespace-pre-wrap">
                    {currentUser.self_introduction}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 text-gray-400 text-sm">
                  {/* URL */}
                  {currentUser?.url && (
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                        />
                      </svg>
                      <a
                        href={currentUser.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        {currentUser.url.replace(/^(https?:\/\/)?(www\.)?/, "")}
                      </a>
                    </div>
                  )}

                  {/* 誕生日 */}
                  {currentUser?.birthdate && (
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 15.25a8.954 8.954 0 01-4.186 7.25M12 21a9 9 0 115.814-16.319M12 21V9m0 12a9 9 0 005.814-16.319M12 9c-2.21 0-4-1.343-4-3s1.79-3 4-3 4 1.343 4 3-1.79 3-4 3z"
                        />
                      </svg>
                      <span>誕生日: {currentUser.birthdate}</span>
                    </div>
                  )}

                  {/* 登録日 */}
                  {registrationDate && (
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>{registrationDate}から利用しています</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <ErrorMessage message="不明なページです。" />;
    }
  };

  return (
    <ProfileContext.Provider value={{ currentUser, setCurrentUser }}>
      <div className="bg-gray-900 min-h-screen font-sans text-white flex">
        {/* --- サイドバー --- */}
        {currentUser && (
          <Sidebar
            isOpen={isSidebarOpen}
            setIsOpen={setIsSidebarOpen}
            onHomeClick={() => setView({ mode: "timeline" })}
            onProfileClick={() => setView({ mode: "my-profile" })}
          />
        )}

        {/* --- メインコンテンツ --- */}
        <div className="flex-1 min-w-0">
          {/* モバイル用のメニューボタン */}
          <div className="sticky top-0 bg-gray-900/80 backdrop-blur-md p-2 lg:hidden">
            <button onClick={() => setIsSidebarOpen(true)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          <div className="max-w-2xl mx-auto border-x border-gray-700 min-h-screen">
            {renderContent()}
          </div>
        </div>
        {/* --- 各種モーダル --- */}
        {isEditModalOpen && currentUser && (
          <EditProfileModal
            user={currentUser}
            onClose={() => setIsEditModalOpen(false)}
            onSave={handleProfileUpdate}
          />
        )}
        {repostModalTarget && (
          <RepostModal
            targetTweet={repostModalTarget}
            onClose={() => setRepostModalTarget(null)}
            onPost={handleRepostOrQuote}
          />
        )}
      </div>
    </ProfileContext.Provider>
  );
};

export default MainApp;
