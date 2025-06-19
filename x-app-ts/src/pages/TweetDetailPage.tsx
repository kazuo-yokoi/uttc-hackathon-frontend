import { Tweet } from "../api/api";
import { Header } from "../components/Header";
import { TweetCard } from "../components/TweetCard";
import { PostForm } from "../components/PostForm";

interface TweetDetailPageProps {
  tweet: Tweet;
  replies: Tweet[];
  onPostReply: (content: string) => Promise<void>;
  onBack: () => void;
  onUserClick: (userId: string) => void;
  onLikeToggle: (id: number) => void;
  onRepostClick: (tweet: Tweet) => void;
}
//ツイート詳細・リプライ表示ページ
export const TweetDetailPage: React.FC<TweetDetailPageProps> = ({
  tweet,
  replies,
  onPostReply,
  onBack,
  onUserClick,
  onLikeToggle,
  onRepostClick,
}) => {
  return (
    <div>
      <Header title="ポスト" onBack={onBack} />
      <main>
        <TweetCard
          tweet={tweet}
          onUserClick={onUserClick}
          onLikeToggle={onLikeToggle}
          onRepostClick={onRepostClick}
        />
        <PostForm
          onPost={onPostReply}
          placeholder="返信をポスト"
          buttonText="返信する"
        />
        <div className="border-t border-gray-700">
          {replies.length > 0 ? (
            replies.map((reply) => (
              <TweetCard
                key={reply.id}
                tweet={reply}
                onUserClick={onUserClick}
                onLikeToggle={onLikeToggle}
                onRepostClick={onRepostClick}
              />
            ))
          ) : (
            <p className="text-center text-gray-400 p-8">
              まだリプライはありません。
            </p>
          )}
        </div>
      </main>
    </div>
  );
};
