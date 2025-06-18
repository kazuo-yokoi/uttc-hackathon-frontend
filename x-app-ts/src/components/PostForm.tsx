import { useState } from "react";

// 新規投稿・返信フォーム
export const PostForm: React.FC<{
  onPost: (content: string) => Promise<void>;
  placeholder?: string;
  buttonText?: string;
}> = ({
  onPost,
  placeholder = "いまどうしてる？",
  buttonText = "ポストする",
}) => {
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isPosting) return;

    setIsPosting(true);
    try {
      await onPost(content);
      setContent("");
    } catch (error) {
      console.error("投稿に失敗しました:", error);
      // エラーメッセージは親コンポーネントで表示
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
          className="w-full bg-transparent text-white text-lg placeholder-gray-500 outline-none resize-none"
          placeholder={placeholder}
          rows={3}
        />
        <div className="flex justify-end items-center mt-2">
          <button
            type="submit"
            disabled={!content.trim() || isPosting}
            className="bg-blue-500 text-white font-bold rounded-full px-5 py-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
          >
            {isPosting ? "投稿中..." : buttonText}
          </button>
        </div>
      </form>
    </div>
  );
};
