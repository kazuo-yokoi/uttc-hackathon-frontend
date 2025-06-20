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
  onUserClick: (username: string) => void;
  onLikeToggle: (id: number) => void;
  onRepostClick: (tweet: Tweet) => void;
  sentimentFilter: SentimentFilter;
  setSentimentFilter: (filter: SentimentFilter) => void;
  timelineType: "foryou" | "following";
  setTimelineType: (type: "foryou" | "following") => void;
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
  timelineType,
  setTimelineType,
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

  const TabButton: React.FC<{
    title: string;
    active: boolean;
    onClick: () => void;
  }> = ({ title, active, onClick }) => (
    <button
      onClick={onClick}
      className="w-full h-full flex justify-center items-center hover:bg-gray-800/80 transition-colors"
    >
      <div
        className={`h-full flex items-center border-b-4 ${
          active ? "border-blue-500" : "border-transparent"
        }`}
      >
        <span
          className={`font-bold ${active ? "text-white" : "text-gray-500"}`}
        >
          {title}
        </span>
      </div>
    </button>
  );

  return (
    <div>
      <Header title="ホーム" />
      {/* ★タイムライン切り替えタブ */}
      <div className="h-14 border-b border-gray-700 flex">
        <TabButton
          title="すべて"
          active={timelineType === "foryou"}
          onClick={() => setTimelineType("foryou")}
        />
        <TabButton
          title="フォロー中"
          active={timelineType === "following"}
          onClick={() => setTimelineType("following")}
        />
      </div>
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
