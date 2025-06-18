import { Tweet } from "../api/api";
import { LikeButton } from "./LikeButton";

interface TweetCardProps {
  tweet: Tweet;
  onCardClick?: (id: number) => void;
  onUserClick: (userId: string) => void;
  onLikeToggle: (id: number) => void;
}
// 個別のツイート表示カード
export const TweetCard: React.FC<TweetCardProps> = ({
  tweet,
  onCardClick,
  onUserClick,
  onLikeToggle,
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
  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // カード全体のクリックイベントの発火を防ぐ
    onUserClick(tweet.user_id);
  };

  // カード本体クリックのハンドラ
  const handleCardClick = () => {
    if (isCardClickable) {
      onCardClick(tweet.id);
    }
  };

  //いいねボタンのクリックハンドラ
  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLikeToggle(tweet.id);
  };

  return (
    <div
      className={`flex space-x-4 p-4 border-b border-gray-700/70 ${
        isCardClickable
          ? "cursor-pointer transition-colors duration-300 hover:bg-gray-800/20"
          : ""
      }`}
      onClick={handleCardClick}
    >
      <img
        src={
          tweet.user.avatar_img ||
          `https://placehold.co/48x48/1DA1F2/FFFFFF?text=${tweet.user.display_name.charAt(
            0
          )}`
        }
        alt={`${tweet.user.display_name}のアバター`}
        className="w-12 h-12 rounded-full cursor-pointer"
        onClick={handleUserClick}
        onError={(e) => {
          e.currentTarget.src = `https://placehold.co/48x48/1DA1F2/FFFFFF?text=${tweet.user.display_name.charAt(
            0
          )}`;
        }}
      />
      <div className="flex-1">
        <div className="flex items-center space-x-2 text-gray-400">
          <span
            className="font-bold text-white hover:underline cursor-pointer"
            onClick={handleUserClick}
          >
            {tweet.user.display_name}
          </span>
          <span className="cursor-pointer" onClick={handleUserClick}>
            @{tweet.user.user_name}
          </span>
          <span className="text-xs">·</span>
          <span className="text-xs">{formattedDate}</span>
        </div>
        <p className="mt-1 text-white whitespace-pre-wrap">{tweet.text}</p>
        <div className="flex items-center justify-start mt-4 space-x-12 text-gray-500">
          {/* 他のボタン（Reply, Retweet）もここに追加可能 */}
          <LikeButton
            isLiked={tweet.is_liked}
            likeCount={tweet.likes_count}
            onClick={handleLikeClick}
          />
        </div>
      </div>
    </div>
  );
};
