import { createContext, useContext } from "react";
import { User } from "../api/api";
// 認証状態を管理するためのContext
export const ProfileContext = createContext<{
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
}>({
  currentUser: null,
  setCurrentUser: () => {},
});

export const useProfile = () => useContext(ProfileContext);
