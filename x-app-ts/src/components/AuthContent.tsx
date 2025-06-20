import { useAuthContext } from "../context/AuthContext";
import { LoadingSpinner } from "./LoadingSpinner";
import { MainApp } from "../MainApp";

export const AuthContent: React.FC = () => {
  // 1. AuthContextからユーザー情報とローディング状態を取得
  const { user, loading: authLoading } = useAuthContext();

  // 2. 認証状態の読み込みが完了するまで、ローディング画面を表示
  if (authLoading) {
    return <LoadingSpinner />;
  }

  // 3. 認証済みだが、何らかの理由でuserオブジェクトがない場合（通常は発生しない）
  if (!user) {
    // PrivateRouteがあるため、通常この画面は表示されないが、安全のためのフォールバック
    return (
      <div className="p-4">
        ユーザー情報の取得に失敗しました。再ログインしてください。
      </div>
    );
  }

  // 4. 認証完了後、メインのアプリケーションロジックを描画
  //    userオブジェクトをpropsとして渡すことで、このコンポーネント内ではuserがnullでないことを保証します。
  return <MainApp user={user} />;
};
