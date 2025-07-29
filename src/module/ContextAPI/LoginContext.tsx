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

  const loginCheck = async (retryCount = 0) => {
    // Reset check state to force re-verification
    setIsLoginCheck(false);
    
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
      // In incognito mode, session might take time to establish
      // Retry once after a delay
      if (retryCount === 0) {
        setTimeout(() => {
          loginCheck(1);
        }, 1000);
        return;
      }
      // User not logged in after retry
      setUserInfo(null);
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
