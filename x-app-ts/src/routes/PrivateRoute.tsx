import { Navigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { ReactElement } from "react";

const PrivateRoute = ({
  children,
}: {
  children: ReactElement;
}): ReactElement => {
  const { user } = useAuthContext();

  // ログインしていたら子要素を表示、していなければリダイレクト
  return user ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
