import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { fireAuth } from "../firebase";
import { ErrorMessage } from "../components/ErrorMessage";

const AuthForm: React.FC<{ isLogin: boolean }> = ({ isLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(fireAuth, email, password);
        navigate("/"); // ログイン成功後、ホームへ
      } else {
        await createUserWithEmailAndPassword(fireAuth, email, password);
        // 新規登録成功後、ユーザー情報登録ページへリダイレクト
        navigate("/register");
      }
    } catch (err: any) {
      setError(err.message || "エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center">
          {isLogin ? "ログイン" : "新規登録"}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="メールアドレス"
            required
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワード"
            required
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && <ErrorMessage message={error} />}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {loading ? "処理中..." : isLogin ? "ログイン" : "登録する"}
          </button>
        </form>
        <div className="text-center">
          {isLogin ? (
            <p>
              アカウントをお持ちでないですか？{" "}
              <Link to="/signup" className="text-blue-400 hover:underline">
                新規登録
              </Link>
            </p>
          ) : (
            <p>
              すでにアカウントをお持ちですか？{" "}
              <Link to="/login" className="text-blue-400 hover:underline">
                ログイン
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export const LoginPage: React.FC = () => <AuthForm isLogin={true} />;
export const SignupPage: React.FC = () => <AuthForm isLogin={false} />;
