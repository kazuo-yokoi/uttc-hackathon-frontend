import { fireAuth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../context/ProfileContext";

export const Sidebar: React.FC<{
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onProfileClick: () => void;
  onHomeClick: () => void;
}> = ({ isOpen, setIsOpen, onProfileClick, onHomeClick }) => {
  const { currentUser } = useProfile();
  const navigate = useNavigate();
  const logout = () => {
    signOut(fireAuth);
    navigate("./login");
  };
  // サイドバーのメニュー項目がクリックされたら、モバイルビューではサイドバーを閉じる
  const handleNavigation = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <>
      {/* isOpenがtrueの時だけ表示され、クリックするとサイドバーを閉じる */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity lg:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      ></div>
      <div
        className={`fixed top-0 left-0 z-30 h-full w-64 bg-gray-900 border-r border-gray-700 p-4 flex flex-col transform transition-transform duration-300 ease-in-out 
                   lg:relative lg:translate-x-0  lg:h-screen ${
                     isOpen ? "translate-x-0" : "-translate-x-full"
                   }`}
      >
        <h1 className="text-2xl font-bold text-blue-400 mb-8">X-Clone</h1>
        <nav className="flex flex-col space-y-4 text-xl flex-grow">
          <button
            onClick={() => handleNavigation(onHomeClick)}
            className="text-left hover:text-blue-400"
          >
            ホーム
          </button>
          <button
            onClick={() => handleNavigation(onProfileClick)}
            className="text-left hover:text-blue-400"
          >
            プロフィール
          </button>
        </nav>
        {currentUser && (
          <div className="mt-auto">
            <div className="flex items-center space-x-2 mb-4">
              <img
                src={
                  currentUser.avatar_img ||
                  `https://placehold.co/48x48/1DA1F2/FFFFFF?text=${currentUser.display_name.charAt(
                    0
                  )}`
                }
                className="w-10 h-10 rounded-full"
                alt="avatar"
              />
              <div>
                <p className="font-bold">{currentUser.display_name}</p>
                <p className="text-sm text-gray-500">
                  @{currentUser.user_name}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full"
            >
              ログアウト
            </button>
          </div>
        )}
      </div>
    </>
  );
};
