import { useState } from "react";
import { useTweets } from "./hooks/useTweets";
import { NewPostData, postTweet } from "./api/api";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { ErrorMessage } from "./components/ErrorMessage";
import { HomePage } from "./pages/HomePage";
import { TweetDetailPage } from "./pages/TweetDetailPage";
import { UserProfilePage } from "./pages/UserProfilePage";
import { useAuthContext } from "./context/AuthContext";

type ViewState =
  | { mode: "timeline" }
  | { mode: "detail"; tweetId: number }
  | { mode: "profile"; userId: string };

export const MainApp: React.FC = () => {
  const [view, setView] = useState<ViewState>({ mode: "timeline" });
  const { allTweets, isLoading, error, addTweet } = useTweets();
  const [postError, setPostError] = useState<string | null>(null);
  const { user } = useAuthContext();

  const handlePost = async (content: string, replyToId?: number) => {
    setPostError(null);
    const currentUserID = user?.uid ?? "";

    const newPostData: NewPostData = {
      user_id: currentUserID,
      text: content,
      type: replyToId ? "reply" : "tweet",
      reply_to_id: replyToId || undefined,
    };

    try {
      const createdPost = await postTweet(newPostData);
      addTweet(createdPost);
    } catch (err: any) {
      console.error("Failed to post:", err);
      setPostError(
        "投稿に失敗しました。サーバーの接続状況やCORS設定を確認してください。"
      );
      throw err;
    }
  };

  // --- ナビゲーション関数 ---
  const navigateToTimeline = () => setView({ mode: "timeline" });
  const navigateToDetail = (tweetId: number) =>
    setView({ mode: "detail", tweetId });
  const navigateToProfile = (userId: string) =>
    setView({ mode: "profile", userId });

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
          />
        );

      case "profile":
        return (
          <UserProfilePage
            userId={view.userId}
            allTweets={allTweets}
            onBack={navigateToTimeline}
            onTweetClick={navigateToDetail}
            onUserClick={navigateToProfile}
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
    </div>
  );
};

export default MainApp;
