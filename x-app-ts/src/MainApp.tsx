import { useState } from "react";
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
} from "./api/api";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { ErrorMessage } from "./components/ErrorMessage";
import { RepostModal } from "./components/RepostModal";
import { HomePage } from "./pages/HomePage";
import { TweetDetailPage } from "./pages/TweetDetailPage";
import { UserProfilePage } from "./pages/UserProfilePage";
import { useAuthContext } from "./context/AuthContext";

type ViewState =
  | { mode: "timeline" }
  | { mode: "detail"; tweetId: number }
  | { mode: "profile"; username: string };

type TimelineType = "foryou" | "following";
export type SentimentFilter = "all" | "positive" | "neutral" | "negative";

export const MainApp: React.FC = () => {
  const [view, setView] = useState<ViewState>({ mode: "timeline" });
  const [timelineType, setTimelineType] = useState<TimelineType>("foryou");
  const { user } = useAuthContext();
  const currentUserID = user?.uid ?? "";
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
        let userUpdated = false;
        if (tweet.user.firebase_uid === targetUser.firebase_uid) {
          tweet.user = { ...tweet.user, ...updatedUser };
          userUpdated = true;
        }
        if (tweet.original?.user.firebase_uid === targetUser.firebase_uid) {
          tweet.original.user = { ...tweet.original.user, ...updatedUser };
          userUpdated = true;
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

  // --- ナビゲーション関数 ---
  const navigateToTimeline = () => setView({ mode: "timeline" });
  const navigateToDetail = (tweetId: number) =>
    setView({ mode: "detail", tweetId });
  const navigateToProfile = (username: string) =>
    setView({ mode: "profile", username });

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

      default:
        return <ErrorMessage message="不明なページです。" />;
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen font-sans text-white">
      <div className="max-w-2xl mx-auto border-x border-gray-700">
        {renderContent()}
      </div>
      <RepostModal
        targetTweet={repostModalTarget}
        onClose={() => setRepostModalTarget(null)}
        onPost={handleRepostOrQuote}
      />
    </div>
  );
};

export default MainApp;
