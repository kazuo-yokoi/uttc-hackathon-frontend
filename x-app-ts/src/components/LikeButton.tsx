interface LikeButtonProps {
  isLiked: boolean;
  likeCount: number;
  onClick: (e: React.MouseEvent) => void;
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  isLiked,
  likeCount,
  onClick,
}) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 group focus:outline-none`}
  >
    <div
      className={`p-2 rounded-full transition-colors duration-200 ${
        isLiked
          ? "text-pink-500 bg-pink-500/10"
          : "text-gray-500 group-hover:bg-pink-500/10 group-hover:text-pink-500"
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={isLiked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
    </div>
    <span
      className={`text-sm ${
        isLiked ? "text-pink-500" : "text-gray-500 group-hover:text-pink-500"
      }`}
    >
      {likeCount > 0 && likeCount}
    </span>
  </button>
);
