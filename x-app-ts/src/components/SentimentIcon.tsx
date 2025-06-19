// 感情アイコンコンポーネント
export const SentimentIcon: React.FC<{ sentiment: string }> = ({
  sentiment,
}) => {
  switch (sentiment) {
    case "positive":
      return (
        <span title="ポジティブ" className="text-green-500">
          😊
        </span>
      );
    case "negative":
      return (
        <span title="ネガティブ" className="text-purple-500">
          😔
        </span>
      );
    default:
      return (
        <span title="ニュートラル" className="text-gray-500">
          😐
        </span>
      );
  }
};
