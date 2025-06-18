// *** API通信とTypeScriptの型定義 ***

export type Nullable<T> = T | null;
/**
 * ユーザー情報を表す型 (GoのUser構造体に対応)
 */
export interface User {
  firebase_uid: string;
  user_name: string;
  display_name: string;
  self_introduction?: Nullable<string>;
  updateSelfIntro?: Nullable<boolean>;
  birthdate?: Nullable<string>; // ISO8601形式の文字列で送る（例："2000-01-01T00:00:00Z"）
  updateBirthdate?: Nullable<boolean>;
  url?: Nullable<string>;
  updateURL?: Nullable<boolean>;
  profile_img?: Nullable<string>;
  updateProfileImg?: Nullable<boolean>;
  avatar_img?: Nullable<string>;
  updateAvatar?: Nullable<boolean>;
  created_at?: string; // サーバーからのレスポンス用
  updated_at?: string; // サーバーからのレスポンス用
}

/**
 * ツイート情報を表す型 (GoのTweet構造体に対応)
 */
export type TweetType = "tweet" | "reply" | "repost" | "quote";

export interface Tweet {
  id: number;
  user_id: string;
  text?: Nullable<string>;
  media_url?: Nullable<string>;
  type: TweetType;
  reply_to_id?: Nullable<number>;
  original_id?: Nullable<number>;
  quote_text?: Nullable<string>;
  is_deleted: boolean;
  created_at: string; // ISO date string
  updated_at: string;

  user: User;
  reply_to?: Nullable<Tweet>;
  original?: Nullable<Tweet>;
  likes_count: number;
  is_liked: boolean;
}

/**
 * 新規投稿時のデータ型
 */
export interface NewPostData {
  user_id: string;
  text: string;
  type: "tweet" | "reply";
  reply_to_id?: number | null;
}

//APIエンドポイント
export const API_ENDPOINT = process.env.REACT_APP_API_URL;

// --- モックデータ ---
// APIが利用できない場合やCORSエラー時に使用するサンプルデータ
const mockTweets: Tweet[] = [
  {
    id: 999,
    user_id: "",
    text: "これはモック（サンプル）のツイートです。バックエンドAPIへの接続に失敗した場合に表示されます。\n\nサーバーのCORS設定を確認してください。",
    type: "tweet",
    created_at: new Date().toISOString(),
    user: {
      firebase_uid: "",
      user_name: "dev_user",
      display_name: "開発者",
      avatar_img: "https://placehold.co/48x48/71717a/FFFFFF?text=D",
    },
    is_deleted: false,
    updated_at: "",
    likes_count: 15,
    is_liked: false,
  },
  {
    id: 998,
    user_id: "",
    text: "Reactアプリケーション自体は正常に動作しています。UIコンポーネントの確認や開発を続けることができます。",
    type: "tweet",
    created_at: new Date(Date.now() - 60000 * 15).toISOString(),
    user: {
      user_name: "react_dev",
      display_name: "React",
      avatar_img: "https://placehold.co/48x48/1DA1F2/FFFFFF?text=R",
      firebase_uid: "",
    },
    is_deleted: false,
    updated_at: "",
    likes_count: 15,
    is_liked: false,
  },
];

/**
 * すべてのツイートを取得する(配列で返す)
 * @param currentUserID 現在のユーザーID。いいね状態を判定するために使用
 */
export const fetchAllTweets = async (
  currentUserID: string
): Promise<Tweet[]> => {
  try {
    // いいね状態を取得するために current_user_id をクエリパラメータで渡す
    const response = await fetch(
      `${API_ENDPOINT}/tweet?current_user_id=${currentUserID}`
    );
    if (!response.ok) {
      throw new Error(`サーバーエラー (ステータス: ${response.status})`);
    }
    let data = await response.json();
    if (!Array.isArray(data)) {
      // APIが空の場合にnullを返すケースを考慮
      return [];
    }
    return data;
  } catch (err) {
    console.error("Failed to fetch real tweets:", err);
    // エラー時はモックデータを返す
    return mockTweets;
  }
};

/**
 * 新しいツイートを投稿する(投稿したツイートを返す)
 * @param postData - 投稿するデータ
 */
export const postTweet = async (postData: NewPostData): Promise<Tweet> => {
  const response = await fetch(`${API_ENDPOINT}/tweet`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(postData),
  });
  if (!response.ok) {
    throw new Error(`投稿に失敗しました (${response.status})`);
  }
  return response.json();
};

/**
 * いいねを追加する
 * @param userId - いいねするユーザーのID
 * @param tweetId - いいね対象のツイートID
 */
export const likeTweet = async (
  userId: string,
  tweetId: number
): Promise<void> => {
  const response = await fetch(`${API_ENDPOINT}/likes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, tweet_id: tweetId }),
  });
  if (!response.ok) {
    throw new Error("いいねに失敗しました");
  }
};

/**
 * いいねを取り消す
 * @param userId - ユーザーID
 * @param tweetId - ツイートID
 */
export const unlikeTweet = async (
  userId: string,
  tweetId: number
): Promise<void> => {
  const response = await fetch(`${API_ENDPOINT}/likes`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, tweet_id: tweetId }),
  });
  if (!response.ok) {
    throw new Error("いいねの取り消しに失敗しました");
  }
};
