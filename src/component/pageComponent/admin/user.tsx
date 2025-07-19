import { RowStack } from "@/component/ui/BoxStack";
import Pagination from "@/component/ui/Pagination";
import { TableDataList } from "@/component/ui/DataList";
import StyledTableCell from "@/component/ui/styled/StyledTableCell";
import StyledTableRow from "@/component/ui/styled/StyledTableRow";
import { itemNumber } from "@/constant/commonVariable";
import { GetListPageOrderNSearch } from "@/module/customHook/useHook";
import { changeDateDash } from "@/module/utils/commonFunction";
import { Box, Typography } from "@mui/material";
import { useState } from "react";
import { AdminBodyContainerWithTitle } from "@/component/ui/BodyContainer";
import { TitleSub18 } from "@/component/ui/styled/StyledTypography";

export default function AdminUserPage() {
  // 테이블 헤더 데이터
  const headerDataList = [
    { label: "No", keyName: "id", hasOrder: true },
    { label: "로그인 유형", keyName: "authType", hasOrder: true },
    { label: "이메일", keyName: "email", hasOrder: false },
    { label: "브랜드/상품명", keyName: "name", hasOrder: true },
    { label: "카테고리", keyName: "category", hasOrder: true },
    { label: "URL", keyName: "url", hasOrder: true },
    { label: "목적", keyName: "reasonList", hasOrder: true },
    { label: "마지막 로그인", keyName: "lastLoginAt", hasOrder: true },
    { label: "가입일", keyName: "createdAt", hasOrder: true },
  ];

  // 검색
  const [searchInput, setSearchInput] = useState("");
  const searchFieldList = [{ label: "이메일", keyName: "email" }];
  const [searchField, setSearchField] = useState(searchFieldList[0].keyName);

  // 정렬
  const [currentField, setCurrentField] = useState(headerDataList[0].keyName);
  const [currentOrder, setCurrentOrder] = useState({
    label: "▼",
    keyName: "DESC",
  });

  const { page, setPage, totalNum, dataList, refreshSwitch, setRefreshSwitch } =
    GetListPageOrderNSearch({
      url: "/admin/user",
      order: currentOrder.keyName,
      orderField: currentField,
      searchField,
      searchInput,
    });

  return (
    <AdminBodyContainerWithTitle currentKeyName="user">
      <RowStack justifyContent="space-between" sx={{ mb: "12px" }}>
        <RowStack spacing="12px">
          <TitleSub18>회원 목록</TitleSub18>
        </RowStack>

        {/* <DropDownSearchUI
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          searchField={searchField}
          setSearchField={setSearchField}
          selectList={searchFieldList}
          setRefreshSwitch={setRefreshSwitch}
          width={110}
        /> */}
      </RowStack>

      <Box sx={{ mt: "12px" }}>
        {dataList?.length !== 0 ? (
          <TableDataList
            headerDataList={headerDataList}
            currentField={currentField}
            currentOrder={currentOrder}
            setCurrentField={setCurrentField}
            setCurrentOrder={setCurrentOrder}
          >
            {dataList.map(function (each: any, index) {
              return (
                <StyledTableRow key={each.id}>
                  <StyledTableCell sx={{ minWidth: "45px" }}>
                    {(page - 1) * itemNumber.adminUser + index + 1}
                  </StyledTableCell>
                  <StyledTableCell>{each.authType}</StyledTableCell>
                  <StyledTableCell>
                    {each.authType === "이메일" ? each.email : "-"}
                  </StyledTableCell>
                  <StyledTableCell>{each.name || "-"}</StyledTableCell>
                  <StyledTableCell>{each.category || "-"}</StyledTableCell>
                  <StyledTableCell>{each.url || "-"}</StyledTableCell>
                  <StyledTableCell>{each.reasonList || "-"}</StyledTableCell>
                  <StyledTableCell>
                    {changeDateDash(each.lastLoginAt)}
                  </StyledTableCell>
                  <StyledTableCell>
                    {changeDateDash(each.createdAt)}
                  </StyledTableCell>
                </StyledTableRow>
              );
            })}
          </TableDataList>
        ) : (
          <Typography>데이터가 존재하지 않습니다</Typography>
        )}

        <Pagination
          page={page}
          setPage={setPage}
          itemNumber={itemNumber.adminUser}
          totalNum={totalNum}
        />
      </Box>
    </AdminBodyContainerWithTitle>
  );
}
