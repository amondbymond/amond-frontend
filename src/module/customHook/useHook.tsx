import { useEffect, useState } from "react";
import { apiCall, apiCallType, handleAPIError } from "../utils/api";
import { UserDataType } from "../ContextAPI/LoginContext";
import { useRouter } from "next/router";
import axios from "axios";

/* App.js에서 사용할 훅 **/
export const UseMainHook = () => {
  TrackingRouteChange();
};

/** 페이지 이동 체크 */
export const TrackingRouteChange = () => {
  const router = useRouter();

  useEffect(() => {
    return () => {
      // pathname은 dynamic []식으로 반환
      sessionStorage.setItem("prevRoute", router.asPath);
    };
  }, [router.asPath]);
};

/* loading이 있는 apiCall **/
export const UseApiCallWithLoading = () => {
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태

  const apiCallWithLoading = async (options: apiCallType) => {
    setIsLoading(true); // API 호출 시작, 로딩 상태를 true로 설정
    try {
      const response = await apiCall(options);
      setIsLoading(false); // API 호출 완료, 로딩 상태를 false로 설정
      return response;
    } catch (error) {
      setIsLoading(false); // 에러가 발생해도 로딩 상태를 false로 설정
      throw error;
    }
  };

  return { isLoading, apiCallWithLoading }; // 로딩 상태와 API 호출 함수를 반환
};

/* 페이지 & 정렬, 검색이 있는 리스트 get **/
export const GetListPageOrderNSearch = ({
  url,
  order,
  orderField,
  searchField,
  searchInput,
  addParams,
}: {
  url: string;
  order: string;
  orderField: string;
  searchField: string;
  searchInput: string;
  addParams?: any;
}) => {
  const [dataList, setDataList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalNum, setTotalNum] = useState(0);
  const [refreshSwitch, setRefreshSwitch] = useState(false);

  const getListUrl = `${url}/getList/${page}`;
  const totalNumUrl = `${url}/getTotalNum`;

  // 목록 불러오기
  useEffect(() => {
    getList({
      url: getListUrl,
      method: "get",
      params: { searchInput, searchField, orderField, order, ...addParams },
    });
  }, [page, order, refreshSwitch, orderField]);

  // 전체 개수
  useEffect(() => {
    getTotalNum({
      url: totalNumUrl,
      method: "get",
      params: { searchInput, searchField, ...addParams },
    });
  }, [refreshSwitch]);

  // 목록 불러오기
  const getList = async (options: apiCallType) => {
    try {
      const response = await apiCall(options);
      setDataList(response.data);
    } catch (e) {
      handleAPIError(e, "목록 데이터");
    }
  };

  // 전체 개수 불러오기
  const getTotalNum = async (options: apiCallType) => {
    try {
      const response = await apiCall(options);
      setTotalNum(response.data.totalNum);
    } catch (e) {
      handleAPIError(e, "개수 데이터");
    }
  };

  return { page, setPage, totalNum, dataList, refreshSwitch, setRefreshSwitch };
};

/* 페이지 & 정렬, 카테고리가 있는 리스트 get **/
export const GetListPageOrderNCategory = ({
  url,
  order,
  orderField,
  category,
  categoryField,
  addParams,
}: {
  url: string;
  order: string;
  orderField: string;
  category: string;
  categoryField: string;
  addParams?: any;
}) => {
  const [dataList, setDataList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalNum, setTotalNum] = useState(0);
  const [refreshSwitch, setRefreshSwitch] = useState(false);

  const getListUrl = `${url}/getList/${page}`;
  const totalNumUrl = `${url}/getTotalNum`;

  // 목록 불러오기
  useEffect(() => {
    getList({
      url: getListUrl,
      method: "get",
      params: { category, categoryField, orderField, order, ...addParams },
    });
  }, [page, order, refreshSwitch, orderField]);

  // 전체 개수
  useEffect(() => {
    getTotalNum({
      url: totalNumUrl,
      method: "get",
      params: { category, categoryField, ...addParams },
    });
  }, [refreshSwitch]);

  // 목록 불러오기
  const getList = async (options: apiCallType) => {
    try {
      const response = await apiCall(options);
      setDataList(response.data);
    } catch (e) {
      handleAPIError(e, "목록 데이터");
    }
  };

  // 전체 개수 불러오기
  const getTotalNum = async (options: apiCallType) => {
    try {
      const response = await apiCall(options);
      setTotalNum(response.data.totalNum);
    } catch (e) {
      handleAPIError(e, "개수 데이터");
    }
  };

  return { page, setPage, totalNum, dataList, refreshSwitch, setRefreshSwitch };
};

/* 프로젝트 이동 훅 **/
export const GoToProject = () => {
  const router = useRouter();

  useEffect(() => {
    const goToProject = async () => {
      try {
        const response = await apiCall({
          url: "/content/project",
          method: "get",
        });
        if (response.data.projectId) {
          router.push(`/project/${response.data.projectId}`);
        }
      } catch (e) {
        handleAPIError(e, "프로젝트 이동 실패");
      }
    };

    goToProject();
  }, []);
};
