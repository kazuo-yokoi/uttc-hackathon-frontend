// ローディング表示用コンポーネント
export const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center p-8">
    <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
  </div>
);
