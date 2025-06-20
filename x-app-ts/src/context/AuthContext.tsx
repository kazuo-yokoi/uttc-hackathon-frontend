// AuthContext.tsx
import {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactElement,
} from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, User } from "firebase/auth";
import { fireAuth } from "../firebase";
import { getMyProfile } from "../api/api";

// Contextの型定義
interface AuthContextType {
  user: User | null;
  loading: boolean;
}

// デフォルト値の型注釈
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Contextを使うカスタムフック
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactElement }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(fireAuth, async (currentUser) => {
      if (currentUser) {
        // --- ユーザーがログインしている場合の処理 ---
        try {
          // バックエンドに問い合わせて、プロフィール情報が存在するか確認
          await getMyProfile(currentUser.uid);
          // 成功した場合: プロフィールは存在する。何もしない。
          setUser(currentUser);
        } catch (error) {
          // 失敗した場合(404 Not Foundなど): プロフィールが存在しないとみなし、登録ページへリダイレクトさせる。
          console.log("Profile not found, redirecting to /register");
          navigate("/register", { replace: true });
          // setUserはここでは更新せず、登録ページでユーザー情報を利用できるようにする
          setUser(currentUser);
        } finally {
          setLoading(false);
        }
      } else {
        // --- ユーザーがログインしていない場合 ---
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
