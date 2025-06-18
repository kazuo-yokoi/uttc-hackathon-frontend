import { AuthProvider } from "./context/AuthContext";
import { Routes, Route } from "react-router-dom";
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";
import { MainApp } from "./MainApp";
import RegisterPage from "./pages/UserRegisterPage";
import { LoginPage, SignupPage } from "./pages/SignupAndLoginPage";

function App() {
  return (
    <AuthProvider>
      {/* ログインユーザーのみアクセス可能 */}
      <Routes>
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainApp />
            </PrivateRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PrivateRoute>
              <RegisterPage />
            </PrivateRoute>
          }
        />
        {/* 未ログインユーザーのみアクセス可能 */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignupPage />
            </PublicRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
