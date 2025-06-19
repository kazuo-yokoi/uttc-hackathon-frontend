import { useState } from "react";
import { Tweet } from "../api/api";

interface RepostModalProps {
  targetTweet: Tweet | null;
  onClose: () => void;
  onPost: (type: "repost" | "quote", content?: string) => Promise<void>;
}

export const RepostModal: React.FC<RepostModalProps> = ({
  targetTweet,
  onClose,
  onPost,
}) => {
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  if (!targetTweet) return null;

  // モーダル以外の部分をクリックで閉じる
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleRepost = async () => {
    setIsPosting(true);
    try {
      await onPost("repost");
      onClose();
    } finally {
      setIsPosting(false);
    }
  };

  const handleQuote = async () => {
    if (!content.trim()) return;
    setIsPosting(true);
    try {
      await onPost("quote", content);
      onClose();
    } finally {
      setIsPosting(false);
    }
  };

  // 表示する元ツイートは、自身がリポストや引用だった場合、その更に元を辿る
  const tweetToEmbed = targetTweet.original || targetTweet;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900 rounded-2xl p-4 w-full max-w-lg mx-4">
        <h2 className="text-xl font-bold mb-4">投稿を引用</h2>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full bg-gray-800 text-white p-2 rounded-lg resize-none"
          placeholder="コメントを追加..."
          rows={4}
        />
        {/* 埋め込みツイートのプレビュー */}
        <div className="mt-2 border border-gray-700 rounded-xl p-3">
          <div className="flex items-center space-x-2">
            <img
              src={
                tweetToEmbed.user.avatar_img ||
                `https://placehold.co/20x20/FFF/000?text=${tweetToEmbed.user.display_name.charAt(
                  0
                )}`
              }
              alt=""
              className="w-6 h-6 rounded-full"
            />
            <span className="font-bold">{tweetToEmbed.user.display_name}</span>
            <span className="text-gray-400">
              @{tweetToEmbed.user.user_name}
            </span>
          </div>
          <p className="mt-1 text-gray-300">{tweetToEmbed.text}</p>
        </div>

        <div className="flex justify-end space-x-4 mt-4">
          <button
            onClick={handleRepost}
            disabled={isPosting}
            className="px-4 py-2 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
          >
            リポスト
          </button>
          <button
            onClick={handleQuote}
            disabled={!content.trim() || isPosting}
            className="px-4 py-2 rounded-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50"
          >
            引用ポスト
          </button>
        </div>
      </div>
    </div>
  );
};
