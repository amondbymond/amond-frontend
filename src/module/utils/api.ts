import { url } from "@/constant/commonVariable";
import axios, { isAxiosError, Method } from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = url;

export type apiCallType = {
  url: string;
  method: Method;
  body?: any;
  params?: any;
  headers?: any;
};

/* 기본 api Call 뼈대 **/
export const apiCall = async ({
  url,
  method,
  body,
  params,
  headers,
}: apiCallType) => {
  try {
    // Get session token from localStorage for incognito mode support
    const sessionToken = localStorage.getItem("amondSessionToken");
    
    // Merge headers with session token if available
    const mergedHeaders = {
      ...headers,
      ...(sessionToken ? { "x-session-token": sessionToken } : {})
    };
    
    const response = await axios.request({
      url,
      method,
      data: body,
      params,
      headers: mergedHeaders,
      withCredentials: true, // Explicitly set for each request
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/** API 통신 에러 */
export const handleAPIError = (e: any, failMessage: string) => {
  if (e && isAxiosError(e) && e?.response?.data?.message) {
    console.error("API Error:", e.response.data);
    // 로그인이 필요한 경우는 alert 없이 바로 로그인 페이지로 이동
    if (e?.response?.data?.message.includes("로그인")) {
      window.location.href = "/service/login";
    } else if (e?.response?.data?.message === "관리자가 아닙니다") {
      alert("접근 권한이 없습니다.");
      window.location.href = "/service";
    } else {
      alert(`${e.response.data.message}`);
    }
  } else {
    alert(`${failMessage}\n${e}`);
    throw e;
  }
};
