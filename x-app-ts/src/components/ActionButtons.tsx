import { Tweet } from "../api/api";

interface ActionButtonsProps {
  tweet: Tweet;
  onRepostClick: (tweet: Tweet) => void;
  onLikeToggle: (tweetId: number) => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  tweet,
  onRepostClick,
  onLikeToggle,
}) => {
  // イベントの伝播を防ぐための共通ハンドラ
  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation(); // 親要素（TweetCardなど）へのクリックイベントの伝播を防ぐ
    action();
  };

  return (
    <div className="flex items-center justify-between mt-4 max-w-xs text-gray-500">
      {/* --- Reply Button --- */}
      <button className="flex items-center space-x-2 group hover:text-blue-500 transition-colors duration-200">
        <div className="p-2 rounded-full group-hover:bg-blue-500/10">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* ★ Reply Icon Path */}
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
      </button>

      {/* --- Repost Button --- */}
      <button
        onClick={(e) => handleActionClick(e, () => onRepostClick(tweet))}
        className="flex items-center space-x-2 group hover:text-green-500 transition-colors duration-200"
      >
        <div className="p-2 rounded-full group-hover:bg-green-500/10">
          <svg
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            {/* ★ Repost Icon Path */}
            <polyline points="17 1 21 5 17 9"></polyline>
            <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
            <polyline points="7 23 3 19 7 15"></polyline>
            <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
          </svg>
        </div>
      </button>

      {/* --- Like Button --- */}
      <button
        onClick={(e) => handleActionClick(e, () => onLikeToggle(tweet.id))}
        className={`flex items-center space-x-2 group transition-colors duration-200 ${
          tweet.is_liked ? "text-pink-500" : "hover:text-pink-500"
        }`}
      >
        <div
          className={`p-2 rounded-full ${
            tweet.is_liked
              ? "group-hover:bg-pink-500/20"
              : "group-hover:bg-pink-500/10"
          }`}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={tweet.is_liked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* ★ Like Icon Path */}
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </div>
        {/* いいね数が多い場合でもUIが崩れないように調整 */}
        <span className="text-sm min-w-[1rem]">
          {tweet.likes_count > 0 && tweet.likes_count}
        </span>
      </button>
    </div>
  );
};
