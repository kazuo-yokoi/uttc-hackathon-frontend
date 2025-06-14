// AuthContext.tsx
import {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactElement,
} from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { fireAuth } from "../firebase";

// Contextの型定義
interface AuthContextType {
  user: User | null;
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

  useEffect(() => {
    // Firebaseのログイン状態を監視
    const unsubscribe = onAuthStateChanged(fireAuth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // クリーンアップ関数（リスナー解除）
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  } else {
    return (
      <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
    );
  }
}
