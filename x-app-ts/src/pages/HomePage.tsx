import { Tweet } from "../api/api";
import { Header } from "../components/Header";
import { PostForm } from "../components/PostForm";
import { ErrorMessage } from "../components/ErrorMessage";
import { TweetCard } from "../components/TweetCard";
import { SentimentFilter } from "../MainApp";

interface HomePageProps {
  allTweets: Tweet[];
  handlePost: (content: string) => Promise<void>;
  postError: string | null;
  onTweetClick: (id: number) => void;
  onUserClick: (userId: string) => void;
  onLikeToggle: (id: number) => void;
  onRepostClick: (tweet: Tweet) => void;
  sentimentFilter: SentimentFilter;
  setSentimentFilter: (filter: SentimentFilter) => void;
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
  sentimentFilter,
  setSentimentFilter,
}) => {
  const timelineTweets = allTweets
    .filter((t) => t.type === "tweet")
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  // 感情フィルターでツイートを絞り込む
  const filteredTweets = timelineTweets.filter((tweet) => {
    if (sentimentFilter === "all") return true;
    return tweet.sentiment === sentimentFilter;
  });

  return (
    <div>
      <Header title="ホーム" />
      <PostForm onPost={handlePost} />
      {postError && <ErrorMessage message={postError} />}
      {/* 感情フィルター */}
      <div className="p-2 border-b border-gray-700 flex items-center space-x-2">
        <label htmlFor="sentiment-filter" className="text-sm text-gray-400">
          感情フィルター:
        </label>
        <select
          id="sentiment-filter"
          value={sentimentFilter}
          onChange={(e) =>
            setSentimentFilter(e.target.value as SentimentFilter)
          }
          className="bg-gray-800 text-white rounded-md p-1"
        >
          <option value="all">すべて</option>
          <option value="positive">ポジティブ😊</option>
          <option value="neutral">ニュートラル😐</option>
          <option value="negative">ネガティブ😔</option>
        </select>
      </div>
      <main>
        {filteredTweets.length > 0 ? (
          filteredTweets.map((tweet) => (
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
