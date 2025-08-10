import { RowStack } from "@/component/ui/BoxStack";
import Pagination from "@/component/ui/Pagination";
import { TableDataList } from "@/component/ui/DataList";
import StyledTableCell from "@/component/ui/styled/StyledTableCell";
import StyledTableRow from "@/component/ui/styled/StyledTableRow";
import { itemNumber } from "@/constant/commonVariable";
import { GetListPageOrderNSearch } from "@/module/customHook/useHook";
import { changeDateDash } from "@/module/utils/commonFunction";
import { Box, Typography, Chip, Switch, FormControlLabel, Card, CardContent } from "@mui/material";
import { useState, useEffect } from "react";
import { AdminBodyContainerWithTitle } from "@/component/ui/BodyContainer";
import { TitleSub18 } from "@/component/ui/styled/StyledTypography";
import { apiCall } from "@/module/utils/api";

export default function AdminUserPage() {
  // 테이블 헤더 데이터
  const headerDataList = [
    { label: "No", keyName: "id", hasOrder: true },
    { label: "로그인 유형", keyName: "authType", hasOrder: true },
    { label: "이메일", keyName: "email", hasOrder: false },
    { label: "멤버십", keyName: "subscriptionPlan", hasOrder: true },
    { label: "가격", keyName: "subscriptionPrice", hasOrder: true },
    { label: "브랜드/상품명", keyName: "name", hasOrder: true },
    { label: "카테고리", keyName: "category", hasOrder: true },
    { label: "구독 시작일", keyName: "subscriptionStartDate", hasOrder: true },
    { label: "다음 결제일", keyName: "nextBillingDate", hasOrder: true },
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

  // 유료 회원만 보기 토글
  const [showPaidUsersOnly, setShowPaidUsersOnly] = useState(false);
  
  // 통계 데이터
  const [totalUsers, setTotalUsers] = useState(0);
  const [paidUsers, setPaidUsers] = useState(0);

  const { page, setPage, totalNum, dataList, refreshSwitch, setRefreshSwitch } =
    GetListPageOrderNSearch({
      url: showPaidUsersOnly ? "/admin/user/getPaidUsers" : "/admin/user",
      order: currentOrder.keyName,
      orderField: currentField,
      searchField,
      searchInput,
    });

  // 전체 사용자 수와 유료 사용자 수 가져오기
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [allUsersRes, paidUsersRes] = await Promise.all([
          apiCall({ url: "/admin/user/getTotalNum", method: "get" }),
          apiCall({ url: "/admin/user/getPaidUsers/getTotalNum", method: "get" })
        ]);
        setTotalUsers(allUsersRes.data.totalNum);
        setPaidUsers(paidUsersRes.data.totalNum);
      } catch (e) {
        console.error("Failed to fetch user statistics", e);
      }
    };
    fetchStats();
  }, [refreshSwitch]);

  // 멤버십 등급 표시 함수
  const getMembershipChip = (user: any) => {
    // Check admin first
    if (user.grade === 'A') {
      return <Chip label="관리자" size="small" color="error" />;
    }
    
    // Check subscription plan
    if (user.subscriptionPlan && user.subscriptionStatus === 'active') {
      switch (user.subscriptionPlan) {
        case 'pro':
          return <Chip label="Pro" size="small" color="primary" />;
        case 'business':
          return <Chip label="Business" size="small" color="secondary" />;
        case 'premium':
          return <Chip label="Premium" size="small" sx={{ bgcolor: '#FFD700', color: '#000' }} />;
        default:
          return <Chip label="Basic" size="small" variant="outlined" />;
      }
    }
    
    // No active subscription
    return <Chip label="Basic" size="small" variant="outlined" />;
  };

  return (
    <AdminBodyContainerWithTitle currentKeyName="user">
      {/* 통계 카드 섹션 */}
      <Box sx={{ mb: 3 }}>
        <RowStack spacing={2}>
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                전체 회원 수
              </Typography>
              <Typography variant="h4" component="div">
                {totalUsers}명
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                유료 회원 수
              </Typography>
              <Typography variant="h4" component="div" color="primary">
                {paidUsers}명
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {totalUsers > 0 ? `(${((paidUsers / totalUsers) * 100).toFixed(1)}%)` : ''}
              </Typography>
            </CardContent>
          </Card>
        </RowStack>
      </Box>

      <RowStack justifyContent="space-between" sx={{ mb: "12px" }}>
        <RowStack spacing="12px">
          <TitleSub18>회원 목록</TitleSub18>
          <FormControlLabel
            control={
              <Switch
                checked={showPaidUsersOnly}
                onChange={(e) => {
                  setShowPaidUsersOnly(e.target.checked);
                  setPage(1);
                }}
                color="primary"
              />
            }
            label="유료 회원만 보기"
            sx={{ ml: 2 }}
          />
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
              const isPaidUser = each.subscriptionPlan && each.subscriptionPlan !== 'basic' && each.subscriptionStatus === 'active';
              return (
                <StyledTableRow 
                  key={each.id}
                  sx={{ 
                    bgcolor: isPaidUser ? 'rgba(25, 118, 210, 0.05)' : 'inherit' 
                  }}
                >
                  <StyledTableCell sx={{ minWidth: "45px" }}>
                    {(page - 1) * itemNumber.adminUser + index + 1}
                  </StyledTableCell>
                  <StyledTableCell>{each.authType}</StyledTableCell>
                  <StyledTableCell>
                    {each.authType === "이메일" ? each.email : "-"}
                  </StyledTableCell>
                  <StyledTableCell>
                    {getMembershipChip(each)}
                  </StyledTableCell>
                  <StyledTableCell>
                    {each.subscriptionPrice ? `₩${each.subscriptionPrice.toLocaleString()}/월` : "-"}
                  </StyledTableCell>
                  <StyledTableCell>{each.name || "-"}</StyledTableCell>
                  <StyledTableCell>{each.category || "-"}</StyledTableCell>
                  <StyledTableCell>
                    {each.subscriptionStartDate ? changeDateDash(each.subscriptionStartDate) : "-"}
                  </StyledTableCell>
                  <StyledTableCell>
                    {each.nextBillingDate ? changeDateDash(each.nextBillingDate) : "-"}
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
