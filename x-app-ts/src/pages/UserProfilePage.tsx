import { useState, useEffect, useMemo } from "react";
import { Tweet, User, fetchUserByUsername } from "../api/api";
import { Header } from "../components/Header";
import { TweetCard } from "../components/TweetCard";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorMessage } from "../components/ErrorMessage";
import { FollowButton } from "../components/FollowButton";
interface UserProfilePageProps {
  username: string;
  currentUserID: string;
  allTweets: Tweet[];
  onBack: () => void;
  onTweetClick: (id: number) => void;
  onUserClick: (userId: string) => void;
  onLikeToggle: (id: number) => void;
  onRepostClick: (tweet: Tweet) => void;
  onFollowToggle: (targetUser: User) => void;
}
//ユーザー情報と投稿一覧ページ
export const UserProfilePage: React.FC<UserProfilePageProps> = ({
  username,
  currentUserID,
  allTweets,
  onBack,
  onTweetClick,
  onUserClick,
  onLikeToggle,
  onRepostClick,
  onFollowToggle,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHoveringFollow, setIsHoveringFollow] = useState(false);

  const displayUser = useMemo(() => {
    // 1. APIから取得したベースのユーザー情報を定義
    const baseUser = user;

    // 2. allTweetsから、楽観的更新が反映されている可能性のあるユーザー情報を探す
    const optimisticUser = allTweets.find(
      (t) => t.user.user_name === username
    )?.user;

    if (!baseUser) {
      // APIからの読み込みがまだなら、ひとまずallTweetsの情報を表示（ちらつき防止）
      return optimisticUser || null;
    }

    // 3. 両方の情報源をマージする
    return {
      ...baseUser,
      ...optimisticUser,
    };
  }, [user, allTweets, username]); // user, allTweets, username のいずれかが変更された時だけ再計算

  useEffect(() => {
    fetchUserByUsername(username, currentUserID)
      .then(setUser)
      .finally(() => setIsLoading(false));
  }, [username, currentUserID]);

  if (isLoading) return <LoadingSpinner />;
  if (!displayUser) return <ErrorMessage message="ユーザーが見つかりません" />;

  const userTweets = allTweets
    .filter((t) => t.user.user_name === username)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  return (
    <div>
      <Header title={displayUser.display_name} onBack={onBack} />
      <main>
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-start space-x-4">
            <img
              src={
                displayUser.avatar_img ||
                `https://placehold.co/96x96/1DA1F2/FFFFFF?text=${displayUser.display_name.charAt(
                  0
                )}`
              }
              alt={`${displayUser.display_name}のアバター`}
              className="w-24 h-24 rounded-full"
            />
            {displayUser.firebase_uid !== currentUserID && (
              <FollowButton
                isFollowing={displayUser.is_following}
                onClick={() => onFollowToggle(displayUser)}
                isHovering={isHoveringFollow}
                onMouseEnter={() => setIsHoveringFollow(true)}
                onMouseLeave={() => setIsHoveringFollow(false)}
              />
            )}
            <div>
              <h2 className="text-2xl font-bold">{displayUser.display_name}</h2>
              <p className="text-gray-400">@{displayUser.user_name}</p>
            </div>
          </div>
          {displayUser.self_introduction && (
            <p className="mt-4 text-white whitespace-pre-wrap">
              {displayUser.self_introduction}
            </p>
          )}
          <div className="flex space-x-4 mt-2 text-gray-500">
            <span>
              <span className="font-bold text-white">
                {displayUser.following_count}
              </span>{" "}
              フォロー
            </span>
            <span>
              <span className="font-bold text-white">
                {displayUser.followers_count}
              </span>{" "}
              フォロワー
            </span>
          </div>
        </div>
        <div>
          {userTweets.length > 0 ? (
            userTweets.map((tweet) => (
              <TweetCard
                key={tweet.id}
                tweet={tweet}
                onCardClick={tweet.type === "tweet" ? onTweetClick : undefined}
                onUserClick={onUserClick}
                onLikeToggle={onLikeToggle}
                onRepostClick={onRepostClick}
              />
            ))
          ) : (
            <p className="text-center text-gray-400 p-8">
              このユーザーはまだ投稿していません。
            </p>
          )}
        </div>
      </main>
    </div>
  );
};
