export const FollowButton: React.FC<{
  isFollowing: boolean;
  onClick: () => void;
  isHovering?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}> = ({ isFollowing, onClick, isHovering, onMouseEnter, onMouseLeave }) => {
  const baseClasses =
    "font-bold py-2 px-4 rounded-full transition-colors duration-200";
  if (isFollowing) {
    return (
      <button
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={`${baseClasses} ${
          isHovering
            ? "bg-red-600/20 text-red-500 border border-red-500"
            : "bg-transparent text-white border border-gray-500"
        }`}
      >
        {isHovering ? "フォロー解除" : "フォロー中"}
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      className={`${baseClasses} bg-white text-black hover:bg-gray-200`}
    >
      フォローする
    </button>
  );
};
