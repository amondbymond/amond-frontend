import { createContext, useState, ReactNode, useEffect } from "react";
import { apiCall } from "../utils/api";

export type LoginContextType = {
  userInfo: UserDataType | null;
  setUserInfo: Function;
  isLoginCheck: boolean;
  setIsLoginCheck: Function;
};

export type UserDataType = {
  id: number;
  authType: string;
  grade: string;
};

const LoginContext = createContext<LoginContextType>({
  userInfo: null,
  setUserInfo: () => {},
  isLoginCheck: false,
  setIsLoginCheck: () => {},
});

export const LoginProvider = ({ children }: { children: ReactNode }) => {
  const [userInfo, setUserInfo] = useState<null | UserDataType>(null);
  const [isLoginCheck, setIsLoginCheck] = useState(false);

  useEffect(() => {
    loginCheck();
  }, []);

  const loginCheck = async () => {
    try {
      const response = await apiCall({
        url: "/auth/loginCheck",
        method: "get",
      });
      if (response.data.id) {
        setUserInfo(response.data);
      } else {
        setUserInfo(null);
      }
    } catch (e) {
      // User not logged in
    } finally {
      setIsLoginCheck(true);
    }
  };

  return (
    <LoginContext.Provider
      value={{
        userInfo,
        setUserInfo,
        isLoginCheck,
        setIsLoginCheck,
      }}
    >
      {children}
    </LoginContext.Provider>
  );
};

export default LoginContext;
