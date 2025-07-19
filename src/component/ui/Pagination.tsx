import ReactPagination from "react-js-pagination";
import { Box } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect } from "react";

// query를 통해 페이지 관리
export default function Pagination({
  itemNumber,
  page,
  totalNum,
  setPage,
  isModal = false, // 모달창인지 여부 (기본값 false)
}: {
  itemNumber: number;
  page: number;
  totalNum: number;
  setPage: (newPage: number) => void;
  isModal?: boolean;
}) {
  const router = useRouter();
  const pageFromUrl = parseInt(router.query?.page as string) || 1;

  useEffect(() => {
    if (!isModal) {
      setPage(pageFromUrl);
    }
  }, [pageFromUrl]);

  const handlePageChange = (newPage: number) => {
    if (isModal) {
      setPage(newPage);
    } else {
      // 현재 URL의 쿼리 파라미터를 업데이트합니다.
      const query = { ...router.query, page: newPage.toString() };
      router.push({ pathname: router.pathname, query }, undefined, {
        shallow: true,
      });
    }
  };

  return (
    <Box sx={{ mt: "30px", display: totalNum === 0 ? "none" : "block" }}>
      <ReactPagination
        activePage={page}
        itemsCountPerPage={itemNumber}
        totalItemsCount={totalNum}
        pageRangeDisplayed={5}
        prevPageText="‹"
        firstPageText="‹‹"
        nextPageText="›"
        lastPageText="››"
        onChange={handlePageChange}
      />
    </Box>
  );
}
