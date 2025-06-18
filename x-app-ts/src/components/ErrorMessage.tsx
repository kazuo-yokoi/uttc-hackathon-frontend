//エラーメッセージ表示用コンポーネント
export const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-300 px-4 py-3 m-4 rounded-lg text-center">
    <p>{message}</p>
  </div>
);
