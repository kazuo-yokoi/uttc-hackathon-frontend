import React, { useState, useEffect } from "react";
import { User, Nullable } from "./UserRegister";
import { useAuthContext } from "../context/AuthContext";
import { API_ENDPOINT } from "./api";

// --- 型定義 ---

export type TweetType = "tweet" | "reply" | "repost" | "quote";
// APIから返されるツイートの型
export interface Tweet {
  id: number;
  user_id: string;
  text?: Nullable<string>;
  media_url?: Nullable<string>;
  type: TweetType;
  reply_to_id?: Nullable<number>;
  original_id?: Nullable<number>;
  quote_text?: Nullable<string>;
  is_deleted: boolean;
  created_at: string; // ISO date string
  updated_at: string;

  user: User;
  reply_to?: Nullable<Tweet>;
  original?: Nullable<Tweet>;
}

// --- モックデータ ---
// APIが利用できない場合やCORSエラー時に使用するサンプルデータ
const mockTweets: Tweet[] = [
  {
    id: 999,
    user_id: "",
    text: "これはモック（サンプル）のツイートです。バックエンドAPIへの接続に失敗した場合に表示されます。\n\nサーバーのCORS設定を確認してください。",
    type: "tweet",
    created_at: new Date().toISOString(),
    user: {
      firebase_uid: "",
      user_name: "dev_user",
      display_name: "開発者",
      avatar_img: "https://placehold.co/48x48/71717a/FFFFFF?text=D",
    },
    is_deleted: false,
    updated_at: "",
  },
  {
    id: 998,
    text: "Reactアプリケーション自体は正常に動作しています。UIコンポーネントの確認や開発を続けることができます。",
    created_at: new Date(Date.now() - 60000 * 15).toISOString(),
    user: {
      user_name: "react_dev",
      display_name: "React",
      avatar_img: "https://placehold.co/48x48/1DA1F2/FFFFFF?text=R",
      firebase_uid: "",
    },
    user_id: "",
    type: "tweet",
    is_deleted: false,
    updated_at: "",
  },
];

// --- コンポーネント ---

/**
 * 新規ツイート投稿フォーム
 */
const CreateTweetForm: React.FC<{
  onTweetPosted: (content: string) => Promise<void>;
}> = ({ onTweetPosted }) => {
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isPosting) return;

    setIsPosting(true);
    try {
      await onTweetPosted(content);
      setContent(""); // 成功したらテキストエリアをクリア
    } catch (error) {
      // エラーは親コンポーネントで処理されるのでここでは何もしない
      console.error("投稿に失敗しました:", error);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="p-4 border-b border-gray-700">
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full bg-transparent text-white text-xl placeholder-gray-500 outline-none resize-none"
          placeholder="いまどうしてる？"
          rows={3}
        />
        <div className="flex justify-end items-center mt-2">
          <button
            type="submit"
            disabled={!content.trim() || isPosting}
            className="bg-blue-500 text-white font-bold rounded-full px-5 py-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
          >
            {isPosting ? "投稿中..." : "ポストする"}
          </button>
        </div>
      </form>
    </div>
  );
};

/**
 * 個々のツイートを表示するカードコンポーネント
 * @param tweet - 表示するツイートオブジェクト
 */
const TweetCard: React.FC<{ tweet: Tweet }> = ({ tweet }) => {
  console.log("tweet in TweetCard:", tweet);
  const formattedDate = new Date(tweet.created_at).toLocaleString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex space-x-4 p-4 border-b border-gray-700/70 transition-colors duration-300 hover:bg-gray-800/20">
      <img
        src={
          tweet.user.avatar_img ||
          `https://placehold.co/48x48/1DA1F2/FFFFFF?text=${tweet.user.display_name.charAt(
            0
          )}`
        }
        alt={`${tweet.user.display_name}のアバター`}
        className="w-12 h-12 rounded-full"
        onError={(e) => {
          e.currentTarget.src = `https://placehold.co/48x48/1DA1F2/FFFFFF?text=${tweet.user.display_name.charAt(
            0
          )}`;
        }}
      />
      <div className="flex-1">
        <div className="flex items-center space-x-2 text-gray-400">
          <span className="font-bold text-white">
            {tweet.user.display_name}
          </span>
          <span>@{tweet.user.user_name}</span>
          <span className="text-xs">·</span>
          <span className="text-xs">{formattedDate}</span>
        </div>
        <p className="mt-1 text-white whitespace-pre-wrap">{tweet.text}</p>
      </div>
    </div>
  );
};

/**
 * ホームタイムライン全体を表示するページコンポーネント
 */
const HomePage: React.FC = () => {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [postError, setPostError] = useState<string | null>(null);
  const { user } = useAuthContext();
  const firebaseUID = user?.uid ?? "";

  useEffect(() => {
    const fetchTweets = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_ENDPOINT}/tweet`);

        if (!response.ok) {
          // HTTPステータスが2xxでない場合はエラーを投げる
          throw new Error(`サーバーエラー (ステータス: ${response.status})`);
        }

        const data: Tweet[] = await response.json();
        const sortedData = data.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setTweets(sortedData);
      } catch (err: any) {
        // --- エラーハンドリングの修正 ---
        // APIからのfetchに失敗した場合の処理 (CORSエラーやネットワークエラーが主な原因)
        console.error("Failed to fetch real tweets:", err);
        console.warn(
          "APIへの接続に失敗しました。これは多くの場合、バックエンドサーバーのCORS(Cross-Origin Resource Sharing)設定が原因です。サーバー側でフロントエンドのオリジンを許可するように設定してください。開発を続けるために、代わりにモックデータを表示します。"
        );

        // ユーザーに状況を伝え、モックデータを表示する
        setError(
          "API接続エラー。サーバーのCORS設定を確認してください。代わりにサンプルデータを表示します。"
        );
        setTweets(mockTweets);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTweets();
  }, []); // コンポーネントのマウント時に一度だけ実行

  // --- 新規投稿ロジック ---
  const handleCreateTweet = async (content: string) => {
    setPostError(null);

    const newTweetData = {
      user_id: firebaseUID,
      text: content,
      type: "tweet",
    };

    try {
      const response = await fetch(`${API_ENDPOINT}/tweet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTweetData),
      });

      if (!response.ok) {
        throw new Error(`投稿に失敗しました (ステータス: ${response.status})`);
      }

      const createdTweet: Tweet = await response.json();

      // タイムラインの先頭に新しい投稿を追加してUIを即時更新
      setTweets((prevTweets) => [createdTweet, ...prevTweets]);
    } catch (err: any) {
      console.error("Failed to post tweet:", err);
      setPostError(
        "投稿に失敗しました。サーバーの接続状況やCORS設定を確認してください。"
      );
      // エラーを再スローしてフォームコンポーネントに伝える
      throw err;
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen font-sans text-white">
      <div className="max-w-2xl mx-auto border-x border-gray-700">
        <header className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-md border-b border-gray-700">
          <h1 className="text-xl font-bold p-4">ホーム</h1>
        </header>

        {/* --- 投稿フォーム --- */}
        <CreateTweetForm onTweetPosted={handleCreateTweet} />

        {/* 投稿エラーメッセージ */}
        {postError && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 m-4 rounded-lg text-center">
            <p>{postError}</p>
          </div>
        )}

        <main>
          {/* ローディングスピナー */}
          {isLoading && (
            <div className="flex justify-center items-center p-8">
              <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* エラーメッセージ（API接続失敗時に表示） */}
          {error && (
            <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-300 px-4 py-3 m-4 rounded-lg text-center">
              <p className="font-bold">お知らせ</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          {/* ツイートリスト */}
          {!isLoading && (
            <div>
              {tweets.length > 0 ? (
                tweets.map((tweet) => (
                  <TweetCard key={tweet.id} tweet={tweet} />
                ))
              ) : (
                <p className="text-center text-gray-400 p-8">
                  まだ投稿がありません。
                </p>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default HomePage;
