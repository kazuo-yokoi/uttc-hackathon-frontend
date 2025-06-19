import { Tweet } from "../api/api";
import { ActionButtons } from "./ActionButtons";

interface TweetCardProps {
  tweet: Tweet;
  onCardClick?: (id: number) => void;
  onUserClick: (userId: string) => void;
  onLikeToggle: (id: number) => void;
  onRepostClick: (tweet: Tweet) => void;
}
// 個別のツイート表示カード
export const TweetCard: React.FC<TweetCardProps> = ({
  tweet,
  onCardClick,
  onUserClick,
  ...actionProps
}) => {
  const isCardClickable = !!onCardClick;
  const formattedDate = new Date(tweet.created_at).toLocaleString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // ユーザー部分クリックのハンドラ
  const handleUserClick = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation(); // カード全体のクリックイベントの発火を防ぐ
    onUserClick(userId);
  };

  // カード本体クリックのハンドラ
  const handleCardClick = () => {
    if (isCardClickable) {
      onCardClick(tweet.id);
    }
  };

  // リポスト/引用の元ツイート部分をレンダリングするコンポーネント
  const OriginalTweetEmbed: React.FC<{ original: Tweet }> = ({ original }) => {
    const formattedDate = new Date(original.created_at).toLocaleString(
      "ja-JP",
      { year: "numeric", month: "short", day: "numeric" }
    );
    return (
      <div
        className="mt-2 border border-gray-700 rounded-xl overflow-hidden cursor-pointer"
        onClick={() => onCardClick && onCardClick(original.id)}
      >
        <div className="p-3">
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <img
              src={
                original.user.avatar_img ||
                `https://placehold.co/20x20/FFF/000?text=${original.user.display_name.charAt(
                  0
                )}`
              }
              alt=""
              className="w-5 h-5 rounded-full"
            />
            <span
              className="font-bold text-white hover:underline"
              onClick={(e) => handleUserClick(e, original.user_id)}
            >
              {original.user.display_name}
            </span>
            <span>@{original.user.user_name}</span>
            <span>·</span>
            <span>{formattedDate}</span>
          </div>
          {original.text && (
            <p className="mt-1 text-white whitespace-pre-wrap">
              {original.text}
            </p>
          )}
        </div>
      </div>
    );
  };
  console.log(tweet.type);
  return (
    <div
      className={`p-4 border-b border-gray-700/70 ${
        isCardClickable ? "hover:bg-gray-800/20" : ""
      }`}
    >
      {/* リポストの場合のヘッダー */}
      {tweet.type === "repost" && (
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2 ml-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path
              fillRule="evenodd"
              d="M4.854 1.146a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L4 2.707V12.5A2.5 2.5 0 0 0 6.5 15h8a.5.5 0 0 0 0-1h-8A1.5 1.5 0 0 1 5 12.5V2.707l3.146 3.147a.5.5 0 1 0 .708-.708l-4-4z"
            />
            <path
              fillRule="evenodd"
              d="M11.146 14.854a.5.5 0 0 0 .708 0l4-4a.5.5 0 0 0-.708-.708L12 13.293V3.5A2.5 2.5 0 0 0 9.5 1h-8a.5.5 0 0 0 0 1h8A1.5 1.5 0 0 1 11 3.5v9.793l-3.146-3.147a.5.5 0 0 0-.708.708l4 4z"
            />
          </svg>
          <span
            onClick={(e) => handleUserClick(e, tweet.user_id)}
            className="font-bold hover:underline cursor-pointer"
          >
            {tweet.user.display_name}さんがリポストしました
          </span>
        </div>
      )}

      <div
        className="flex space-x-4"
        onClick={handleCardClick}
        style={{ cursor: isCardClickable ? "pointer" : "default" }}
      >
        <img
          src={
            tweet.user.avatar_img ||
            `https://placehold.co/48x48/1DA1F2/FFFFFF?text=${tweet.user.display_name.charAt(
              0
            )}`
          }
          alt=""
          className="w-12 h-12 rounded-full cursor-pointer"
          onClick={(e) => handleUserClick(e, tweet.user_id)}
        />
        <div className="flex-1">
          <div className="flex items-center space-x-2 text-gray-400">
            <span
              className="font-bold text-white hover:underline cursor-pointer"
              onClick={(e) => handleUserClick(e, tweet.user_id)}
            >
              {tweet.user.display_name}
            </span>
            <span>@{tweet.user.user_name}</span>
            <span>·</span>
            <span>{formattedDate}</span>
          </div>

          {tweet.text && (
            <p className="mt-1 text-white whitespace-pre-wrap">{tweet.text}</p>
          )}

          {/* 引用またはリポストの元ツイートを表示 */}
          {tweet.original && <OriginalTweetEmbed original={tweet.original} />}

          {/* ActionButtonsコンポーネント */}
          <ActionButtons tweet={tweet} {...actionProps} />
        </div>
      </div>
    </div>
  );
};
