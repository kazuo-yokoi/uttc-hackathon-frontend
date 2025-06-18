/**
 * 各ページのヘッダー
 * @param title - ページのタイトル
 * @param onBack - 戻るボタンを押した時に発火する関数
 */
export const Header: React.FC<{ title: string; onBack?: () => void }> = ({
  title,
  onBack,
}) => (
  <header className="sticky top-0 z-10 flex items-center bg-gray-900/80 backdrop-blur-md border-b border-gray-700 h-14">
    {onBack && (
      <button
        onClick={onBack}
        className="p-3 text-white hover:bg-gray-800/50 rounded-full ml-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          fill="currentColor"
          viewBox="0 0 16 16"
        >
          <path
            fillRule="evenodd"
            d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"
          />
        </svg>
      </button>
    )}
    <h1 className="text-xl font-bold px-4">{title}</h1>
  </header>
);
