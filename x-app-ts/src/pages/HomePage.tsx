import { Tweet } from "../api/api";
import { Header } from "../components/Header";
import { PostForm } from "../components/PostForm";
import { ErrorMessage } from "../components/ErrorMessage";
import { TweetCard } from "../components/TweetCard";

interface HomePageProps {
  allTweets: Tweet[];
  handlePost: (content: string) => Promise<void>;
  postError: string | null;
  onTweetClick: (id: number) => void;
  onUserClick: (userId: string) => void;
  onLikeToggle: (id: number) => void;
  onRepostClick: (tweet: Tweet) => void;
}
//メインのタイムラインページ
export const HomePage: React.FC<HomePageProps> = ({
  allTweets,
  handlePost,
  postError,
  onTweetClick,
  onUserClick,
  onLikeToggle,
  onRepostClick,
}) => {
  const timelineTweets = allTweets
    .filter((t) => t.type === "tweet")
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  return (
    <div>
      <Header title="ホーム" />
      <PostForm onPost={handlePost} />
      {postError && <ErrorMessage message={postError} />}
      <main>
        {timelineTweets.length > 0 ? (
          timelineTweets.map((tweet) => (
            <TweetCard
              key={tweet.id}
              tweet={tweet}
              onCardClick={onTweetClick}
              onUserClick={onUserClick}
              onLikeToggle={onLikeToggle}
              onRepostClick={onRepostClick}
            />
          ))
        ) : (
          <p className="text-center text-gray-400 p-8">
            まだ投稿がありません。
          </p>
        )}
      </main>
    </div>
  );
};
