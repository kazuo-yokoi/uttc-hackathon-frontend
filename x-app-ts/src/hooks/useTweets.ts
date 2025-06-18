import { useState, useEffect, useCallback } from "react";
import { Tweet, fetchAllTweets } from "../api/api";

/**
 * ツイートデータの取得、状態管理（ローディング、エラー）、追加
 * @allTweets - 取得したツイートデータを保持するステート
 * @isLodading - ローディング状態を管理するステート
 * @error - エラーを管理するステート
 * @addTweet - 新規ツイートを@allTweets に追加する関数
 * @reloadtweet - 全ての投稿を取得する関数
 * @toggleLikeState - いいね状態を楽観的に更新する関数
 */
export const useTweets = (currentUserID: string) => {
  const [allTweets, setAllTweets] = useState<Tweet[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadTweets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAllTweets(currentUserID);
      setAllTweets(data);
    } catch (err) {
      setError("ツイートの読み込みに失敗しました。");
    } finally {
      setIsLoading(false);
    }
  }, [currentUserID]);

  useEffect(() => {
    if (currentUserID) {
      loadTweets();
    }
  }, [loadTweets, currentUserID]);

  const addTweet = (newTweet: Tweet) => {
    setAllTweets((prev) => [newTweet, ...prev]);
  };

  // いいね状態を楽観的に更新する関数
  const toggleLikeState = (tweetId: number) => {
    setAllTweets((prevTweets) =>
      prevTweets.map((tweet) => {
        if (tweet.id === tweetId) {
          const wasLiked = tweet.is_liked;
          return {
            ...tweet,
            is_liked: !wasLiked,
            likes_count: wasLiked
              ? tweet.likes_count - 1
              : tweet.likes_count + 1,
          };
        }
        return tweet;
      })
    );
  };

  return {
    allTweets,
    isLoading,
    error,
    addTweet,
    reloadTweets: loadTweets,
    toggleLikeState,
  };
};
