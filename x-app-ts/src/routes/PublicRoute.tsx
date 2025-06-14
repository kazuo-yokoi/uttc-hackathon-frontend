import { Navigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { ReactElement } from "react";

const PublicRoute = ({
  children,
}: {
  children: ReactElement;
}): ReactElement => {
  const { user } = useAuthContext();

  // ログインしていたらリダイレクト、していなければ子要素を表示
  return !user ? children : <Navigate to="/" replace />;
};

export default PublicRoute;
