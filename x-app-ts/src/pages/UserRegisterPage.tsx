import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { API_ENDPOINT, User } from "../api/api";
import { SuccessMessage } from "../components/SuccessMessage";
import { ErrorMessage } from "../components/ErrorMessage";

// 新規登録フォームコンポーネント
const RegisterPage: React.FC = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const firebaseUID = user?.uid ?? "";

  // フォームの入力値を管理するstate
  const [formData, setFormData] = useState<User>({
    firebase_uid: firebaseUID,
    user_name: "",
    display_name: "",
    self_introduction: null,
    birthdate: null, // ISO8601形式の文字列で送る（例："2000-01-01T00:00:00Z"）
    url: null,
    profile_img: null,
    avatar_img: null,
    created_at: "", // サーバーからのレスポンス用
    updated_at: "", // サーバーからのレスポンス用
    followers_count: 0,
    following_count: 0,
    is_following: false,
  });

  // ローディング状態とエラーメッセージを管理するstate
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 入力値が変更されたときにstateを更新するハンドラ
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // フォームが送信されたときのハンドラ
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // --- バリデーション ---
    if (!formData.user_name.trim() || !formData.display_name.trim()) {
      setError(
        "ユーザー名と表示名は必須入力です。空白のみの登録はできません。"
      );
      return; // ここで処理を中断
    }
    if (!user) {
      setError("ログイン情報が見つかりません。");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    // 送信用のペイロード（データ本体）を準備
    const payload = {
      ...formData,
      // birthdateが入力されている場合（nullでない場合）、
      // Dateオブジェクトを生成して.toISOString()でISO 8601形式に変換
      birthdate: formData.birthdate
        ? new Date(formData.birthdate).toISOString()
        : null,
      // 送信する直前にタイムスタンプを生成
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const response = await fetch(`${API_ENDPOINT}/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // サーバーからのエラーレスポンスを処理
        const errorData = await response
          .json()
          .catch(() => ({ message: "サーバーとの通信に失敗しました。" }));
        throw new Error(errorData.message || "ユーザー登録に失敗しました。");
      }

      // 成功レスポンスを処理
      const createdUser: User = await response.json();
      setSuccessMessage(
        `ようこそ、${createdUser.display_name}さん！登録が完了しました。`
      );
      console.log("Created User:", createdUser);

      // 2秒後にホームページへ遷移
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err: any) {
      setError(err.message);
      console.error("Registration failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen flex items-center justify-center font-sans text-white p-4">
      <div className="w-full max-w-2xl bg-gray-950/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 md:p-10 shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
            アカウントを作成
          </h1>
          <p className="text-gray-400 mt-2">新しい世界へようこそ</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Name and Display Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="user_name"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                ユーザー名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="user_name"
                name="user_name"
                value={formData.user_name}
                onChange={handleChange}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
                placeholder="例: user_name123"
              />
            </div>
            <div>
              <label
                htmlFor="display_name"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                表示名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="display_name"
                name="display_name"
                value={formData.display_name}
                onChange={handleChange}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
                placeholder="例: Your Name"
              />
            </div>
          </div>

          {/* Self Introduction */}
          <div>
            <label
              htmlFor="self_introduction"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              自己紹介
            </label>
            <textarea
              id="self_introduction"
              name="self_introduction"
              value={formData.self_introduction ?? ""}
              onChange={handleChange}
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
              placeholder="あなたのことを教えてください"
            ></textarea>
          </div>

          {/* Birthdate and URL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="birthdate"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                誕生日
              </label>
              <input
                type="date"
                id="birthdate"
                name="birthdate"
                value={formData.birthdate ?? ""}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
              />
            </div>
            <div>
              <label
                htmlFor="url"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                ウェブサイト
              </label>
              <input
                type="url"
                id="url"
                name="url"
                value={formData.url ?? ""}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
                placeholder="https://example.com"
              />
            </div>
          </div>

          {/* Profile and Avatar Image URLs */}
          <div>
            <label
              htmlFor="profile_img"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              プロフィール画像URL
            </label>
            <input
              type="text"
              id="profile_img"
              name="profile_img"
              value={formData.profile_img ?? ""}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
              placeholder="https://.../profile.jpg"
            />
          </div>
          <div>
            <label
              htmlFor="avatar_img"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              アバター画像URL
            </label>
            <input
              type="text"
              id="avatar_img"
              name="avatar_img"
              value={formData.avatar_img ?? ""}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
              placeholder="https://.../avatar.png"
            />
          </div>

          {/* Messages */}
          {error && <ErrorMessage message={error} />}
          {successMessage && <SuccessMessage message={successMessage} />}

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isLoading ? "登録中..." : "登録する"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
