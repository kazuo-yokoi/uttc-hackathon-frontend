import { useState, useEffect, useCallback } from "react";
import { Tweet, fetchAllTweets } from "../api/api";

/**
 * ツイートデータの取得、状態管理（ローディング、エラー）、追加
 * @allTweets - 取得したツイートデータを保持するステート
 * @isLodading - ローディング状態を管理するステート
 * @error - エラーを管理するステート
 * @addTweet - 新規ツイートを@allTweets に追加する関数
 * @reloadtweet - 全ての投稿を取得する関数
 */
export const useTweets = () => {
  const [allTweets, setAllTweets] = useState<Tweet[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadTweets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAllTweets();
      setAllTweets(data);
    } catch (err) {
      setError("ツイートの読み込みに失敗しました。");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTweets();
  }, [loadTweets]);

  const addTweet = (newTweet: Tweet) => {
    setAllTweets((prev) => [newTweet, ...prev]);
  };

  return { allTweets, isLoading, error, addTweet, reloadTweets: loadTweets };
};
