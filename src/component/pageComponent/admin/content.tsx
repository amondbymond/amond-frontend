import { RowStack } from "@/component/ui/BoxStack";
import Pagination from "@/component/ui/Pagination";
import { TableDataList } from "@/component/ui/DataList";
import StyledTableCell from "@/component/ui/styled/StyledTableCell";
import StyledTableRow from "@/component/ui/styled/StyledTableRow";
import { itemNumber, s3ImageUrl } from "@/constant/commonVariable";
import { GetListPageOrderNSearch } from "@/module/customHook/useHook";
import { changeDateDash } from "@/module/utils/commonFunction";
import {
  Box,
  Button,
  Grid,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { AdminBodyContainerWithTitle } from "@/component/ui/BodyContainer";
import { TitleSub18 } from "@/component/ui/styled/StyledTypography";
import { BaseModalBox } from "@/component/ui/Modal";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import { apiCall } from "@/module/utils/api";

export default function AdminContentPage() {
  // 테이블 헤더 데이터
  const headerDataList = [
    { label: "No", keyName: "id", hasOrder: true },
    { label: "주제", keyName: "subject", hasOrder: true },
    { label: "캡션", keyName: "caption", hasOrder: true },
    { label: "발행일", keyName: "postDate", hasOrder: true },
    { label: "상세 보기", keyName: "detail", hasOrder: false },
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

  const [detailModal, setDetailModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);

  const { page, setPage, totalNum, dataList, refreshSwitch, setRefreshSwitch } =
    GetListPageOrderNSearch({
      url: "/admin/content",
      order: currentOrder.keyName,
      orderField: currentField,
      searchField,
      searchInput,
    });

  const openDetailModal = (content: any) => {
    setSelectedContent(content);
    setDetailModal(true);
  };

  return (
    <AdminBodyContainerWithTitle currentKeyName="content">
      <RowStack justifyContent="space-between" sx={{ mb: "12px" }}>
        <RowStack spacing="12px">
          <TitleSub18>콘텐츠 목록</TitleSub18>
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
                    {(page - 1) * itemNumber.adminContent + index + 1}
                  </StyledTableCell>
                  <StyledTableCell>{each.subject}</StyledTableCell>
                  <StyledTableCell>
                    {each.caption?.slice(0, 50)}...
                  </StyledTableCell>
                  <StyledTableCell>
                    {changeDateDash(each.postDate)}
                  </StyledTableCell>
                  <StyledTableCell>
                    <Button
                      variant="outlined"
                      onClick={() => openDetailModal(each)}
                    >
                      확인
                    </Button>
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
          itemNumber={itemNumber.adminContent}
          totalNum={totalNum}
        />

        {detailModal && (
          <DetailModal
            modalSwitch={detailModal}
            setModalSwitch={setDetailModal}
            selectedContent={selectedContent}
          />
        )}
      </Box>
    </AdminBodyContainerWithTitle>
  );
}

function DetailModal({
  modalSwitch,
  setModalSwitch,
  selectedContent,
}: {
  modalSwitch: boolean;
  setModalSwitch: Function;
  selectedContent: any;
}) {
  const imageUrl = selectedContent.imageUrl
    ? `${s3ImageUrl}/${selectedContent.imageUrl}`
    : null;

  const parseHashtags = (text: string) => {
    if (!text) return "";
    const hashtagRegex = /(#[가-힣a-zA-Z0-9_]+)/g;
    const parts = text.split(hashtagRegex);
    return parts.map((part, index) => {
      if (part.match(hashtagRegex)) {
        return (
          <span
            key={index}
            style={{
              color: "#1976d2",
              fontWeight: 400,
            }}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // PC/모바일 환경 구분
  const isTouchDevice =
    typeof window !== "undefined" &&
    ("ontouchstart" in window || navigator.maxTouchPoints > 0);


  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(selectedContent.caption);
      alert("캡션이 복사되었습니다.");
    } catch (err) {
      alert("복사에 실패했습니다.");
    }
  };

  const handleDownloadImage = async () => {
    if (!imageUrl) return;

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `image_${selectedContent.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert("이미지 다운로드에 실패했습니다.");
    }
  };

  const handleDownloadCaption = () => {
    const text = selectedContent.caption;
    const blob = new Blob([text], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `caption_${selectedContent.id}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleDownloadAll = async () => {
    if (!imageUrl) {
      handleDownloadCaption();
      return;
    }

    try {
      // 이미지 다운로드
      const response = await apiCall({
        url: `/admin/content/image`,
        method: "get",
        params: {
          key: selectedContent.imageUrl,
          fileName: `아몬드_이미지_${selectedContent.id}.png`,
        },
      });
      const imageLink = document.createElement("a");
      imageLink.href = response.data.url;
      imageLink.download = `아몬드_이미지_${selectedContent.id}.png`;
      document.body.appendChild(imageLink);
      imageLink.click();
      document.body.removeChild(imageLink);

      // 캡션 다운로드
      const captionBlob = new Blob([selectedContent.caption], {
        type: "text/plain",
      });
      const captionUrl = window.URL.createObjectURL(captionBlob);
      const captionLink = document.createElement("a");
      captionLink.href = captionUrl;
      captionLink.download = `아몬드_캡션_${selectedContent.id}.txt`;
      document.body.appendChild(captionLink);
      captionLink.click();
      window.URL.revokeObjectURL(captionUrl);
      document.body.removeChild(captionLink);
    } catch (err) {
      alert("다운로드에 실패했습니다.");
    }
  };

  return (
    <BaseModalBox
      modalSwitch={modalSwitch}
      setModalSwitch={setModalSwitch}
      sx={{
        width: { xs: "100%", md: "1000px" },
        maxWidth: { xs: "92vw", md: "1000px" },
      }}
    >
      <Grid container>
        {/* 왼쪽: 이미지 */}
        <Grid
          size={{ xs: 12, md: 6.5 }}
          sx={{
            background: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderTopLeftRadius: 12,
            borderBottomLeftRadius: { md: 12 },
            borderRadius: { xs: 0, md: "12px 0 0 12px" },
            overflow: "hidden",
            position: "relative",
            cursor: "default",
          }}

        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="콘텐츠 이미지"
              style={{
                width: "100%",
                height: "auto",
                objectFit: "contain",
                display: "block",
                margin: "0 auto",
              }}
            />
          ) : (
            <Box
              sx={{
                width: "100%",
                height: "100%",
                bgcolor: "grey.200",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "grey.500",
                fontSize: 24,
              }}
            >
              이미지 생성중...
            </Box>
          )}

        </Grid>

        {/* 오른쪽: 캡션 등 */}
        <Grid
          size={{ xs: 12, md: 5.5 }}
          sx={{
            minWidth: 0,
            p: { xs: 2, md: 3 },
            display: "flex",
            flexDirection: "column",
            gap: 2,
            bgcolor: "#fff",
            borderTopRightRadius: 12,
            borderBottomRightRadius: { md: 12 },
            borderRadius: { xs: 0, md: "0 12px 12px 0" },
            position: "relative",
          }}
        >
          <Box sx={{ flex: 1, overflowY: "auto" }}>
            {/* 다운로드/복사 버튼 추가 */}
            <RowStack
              justifyContent="flex-end"
              spacing="4px"
              sx={{ mb: { xs: "6px", md: "12px" } }}
            >
              <Tooltip title="캡션 복사">
                <IconButton onClick={handleCopyCaption} size="small">
                  <ContentCopyIcon
                    sx={{ fontSize: { xs: "16px", md: "18px" } }}
                  />
                </IconButton>
              </Tooltip>
              <Tooltip title="다운로드">
                <IconButton onClick={handleDownloadAll} size="small">
                  <DownloadIcon sx={{ fontSize: { xs: "16px", md: "18px" } }} />
                </IconButton>
              </Tooltip>
            </RowStack>

            <Typography
              fontSize={{ xs: 13, md: 14 }}
              sx={{
                whiteSpace: "pre-wrap",
                lineHeight: 1.7,
                wordBreak: "break-all",
              }}
            >
              <span style={{ fontWeight: 600 }}>{"amond"} </span>{" "}
              {parseHashtags(selectedContent.caption)}
            </Typography>
            <Typography
              color="grey.600"
              fontSize={{ md: 14 }}
              sx={{ mt: "8px" }}
            >
              {changeDateDash(selectedContent.postDate)}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </BaseModalBox>
  );
}
