import { Tweet } from "../api/api";
import { Header } from "../components/Header";
import { TweetCard } from "../components/TweetCard";

interface UserProfilePageProps {
  userId: string;
  allTweets: Tweet[];
  onBack: () => void;
  onTweetClick: (id: number) => void;
  onUserClick: (userId: string) => void;
  onLikeToggle: (id: number) => void;
  onRepostClick: (tweet: Tweet) => void;
}
//ユーザー情報と投稿一覧ページ
export const UserProfilePage: React.FC<UserProfilePageProps> = ({
  userId,
  allTweets,
  onBack,
  onTweetClick,
  onUserClick,
  onLikeToggle,
  onRepostClick,
}) => {
  const user = allTweets.find((t) => t.user_id === userId)?.user;
  const userTweets = allTweets
    .filter((t) => t.user_id === userId)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  if (!user) {
    return (
      <div>
        <Header title="プロフィール" onBack={onBack} />
        <p className="text-center text-gray-400 p-8">
          ユーザーが見つかりません。
        </p>
      </div>
    );
  }

  return (
    <div>
      <Header title={user.display_name} onBack={onBack} />
      <main>
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-start space-x-4">
            <img
              src={
                user.avatar_img ||
                `https://placehold.co/96x96/1DA1F2/FFFFFF?text=${user.display_name.charAt(
                  0
                )}`
              }
              alt={`${user.display_name}のアバター`}
              className="w-24 h-24 rounded-full"
            />
            <div>
              <h2 className="text-2xl font-bold">{user.display_name}</h2>
              <p className="text-gray-400">@{user.user_name}</p>
            </div>
          </div>
          {user.self_introduction && (
            <p className="mt-4 text-white whitespace-pre-wrap">
              {user.self_introduction}
            </p>
          )}
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
