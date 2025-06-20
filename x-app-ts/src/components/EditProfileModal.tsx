import { User } from "../api/api";
import { useState } from "react";
import { updateMyProfile } from "../api/api";
import { ErrorMessage } from "./ErrorMessage";

export const EditProfileModal: React.FC<{
  user: User;
  onClose: () => void;
  onSave: (updatedUser: User) => void;
}> = ({ user, onClose, onSave }) => {
  const [updateUser, setUpdateUser] = useState<User>(user);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    // --- バリデーション ---
    if (!updateUser.display_name.trim()) {
      setError("表示名は必須入力です。空白のみの登録はできません。");
      return; // ここで処理を中断
    }
    // 送信用のペイロード（データ本体）を準備
    const payload = {
      ...updateUser,
      // birthdateが入力されている場合（nullでない場合）、
      // Dateオブジェクトを生成して.toISOString()でISO 8601形式に変換
      birthdate: updateUser.birthdate
        ? new Date(updateUser.birthdate).toISOString()
        : null,
      //入力内容に基づき全ての内容をアップデート
      updateSelfIntro: true,
      updateBirthdate: true,
      updateURL: true,
      updateProfileImg: true,
      updateAvatar: true,
      // 送信する直前にタイムスタンプを生成
      updated_at: new Date().toISOString(),
    };

    try {
      // ここでAPIを呼び出す (実際にはAuthContextからトークンを取得)
      const updatedUser = await updateMyProfile(payload);
      onSave(updatedUser);
      onClose();
    } catch (error) {
      console.error(error);
      alert("プロフィールの更新に失敗しました。");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg text-white">
        <h2 className="text-xl font-bold mb-4">プロフィールを編集</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400">表示名</label>
            <input
              type="text"
              value={updateUser.display_name}
              onChange={(e) =>
                setUpdateUser((prev) => ({
                  ...prev,
                  display_name: e.target.value,
                }))
              }
              className="w-full bg-gray-900 p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400">自己紹介</label>
            <textarea
              value={updateUser.self_introduction ?? ""}
              onChange={(e) =>
                setUpdateUser((prev) => ({
                  ...prev,
                  self_introduction: e.target.value,
                }))
              }
              className="w-full bg-gray-900 p-2 rounded"
              rows={4}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400">誕生日</label>
            <input
              type="date"
              id="birthdate"
              name="birthdate"
              value={updateUser.birthdate ?? ""}
              onChange={(e) =>
                setUpdateUser((prev) => ({
                  ...prev,
                  birthdate: e.target.value,
                }))
              }
              className="w-full bg-gray-900 p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400">表示名</label>
            <input
              type="text"
              value={updateUser.display_name}
              onChange={(e) =>
                setUpdateUser((prev) => ({
                  ...prev,
                  display_name: e.target.value,
                }))
              }
              className="w-full bg-gray-900 p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400">ウェブサイト</label>
            <input
              type="url"
              id="url"
              name="url"
              value={updateUser.url ?? ""}
              onChange={(e) =>
                setUpdateUser((prev) => ({
                  ...prev,
                  display_name: e.target.value,
                }))
              }
              className="w-full bg-gray-900 p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400">
              プロフィール画像URL
            </label>
            <input
              type="text"
              id="profile_img"
              name="profile_img"
              value={updateUser.profile_img ?? ""}
              onChange={(e) =>
                setUpdateUser((prev) => ({
                  ...prev,
                  display_name: e.target.value,
                }))
              }
              className="w-full bg-gray-900 p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400">
              アバター画像URL
            </label>
            <input
              type="text"
              id="avatar_img"
              name="avatar_img"
              value={updateUser.avatar_img ?? ""}
              onChange={(e) =>
                setUpdateUser((prev) => ({
                  ...prev,
                  display_name: e.target.value,
                }))
              }
              className="w-full bg-gray-900 p-2 rounded"
            />
          </div>
        </div>
        {error && <ErrorMessage message={error} />}
        <div className="flex justify-end mt-6 space-x-4">
          <button onClick={onClose} className="px-4 py-2 rounded-full">
            キャンセル
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-full disabled:opacity-50"
          >
            {isSaving ? "保存中..." : "保存"}
          </button>
        </div>
      </div>
    </div>
  );
};
