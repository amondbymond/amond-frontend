import { RowStack } from "@/component/ui/BoxStack";
import { BaseModalBox, LoadingModal } from "@/component/ui/Modal";
import { s3ImageUrl } from "@/constant/commonVariable";
import { apiCall, handleAPIError } from "@/module/utils/api";
import { changeDateDash, changeDateMDDKo } from "@/module/utils/commonFunction";
import {
  Box,
  Button,
  CardMedia,
  Grid,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";

export default function ContentDetailModal({
  modalSwitch,
  setModalSwitch,
  brandName,
  content,
  setContentData,
  setSelectedContent,
  imageRatio,
  viewType,
}: {
  modalSwitch: boolean;
  setModalSwitch: Function;
  content: any;
  brandName: string;
  setContentData: Function;
  setSelectedContent: Function;
  imageRatio: string;
  viewType: "calendar" | "feed";
}) {
  const imageUrl = content.imageUrl
    ? `${s3ImageUrl}/${content.imageUrl}`
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


  // 추가 수정
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [editedCaption, setEditedCaption] = useState(content.caption || "");
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const regenerate = async (requestType: "caption" | "image" | "all") => {
    try {
      if (isLoading) return;

      if (requestType === "all" && feedback === "") {
        alert("피드백을 입력해주세요!");
        return;
      }

      if (!confirm("재생성 하시겠습니까?\n생성된 콘텐츠는 삭제됩니다!")) {
        return;
      }
      setIsLoading(true);

      const response = await apiCall({
        url: "/content/regenerate",
        method: "put",
        body: {
          contentId: content.id,
          requestType,
          feedback,
        },
      });

      if (response.data.caption) {
        syncCaptionData(response.data.caption);
      }
      if (response.data.imageUrl) {
        syncImageVideoData(response.data.imageUrl);
      }
      alert("재생성 완료!");
    } catch (e) {
      handleAPIError(e, "재생성 실패");
    } finally {
      setIsLoading(false);
      setFeedback("");
    }
  };
  // 캡션 직접 수정
  const handleSaveCaption = async () => {
    try {
      if (isLoading) return;
      setIsLoading(true);
      await apiCall({
        url: "/content/caption",
        method: "put",
        body: {
          contentId: content.id,
          caption: editedCaption,
        },
      });
      alert("캡션 저장 완료!");
      syncCaptionData(editedCaption);
      setIsEditingCaption(false);
    } catch (e) {
      handleAPIError(e, "캡션 저장 실패");
    } finally {
      setIsLoading(false);
    }
  };

  const syncCaptionData = (newCaption: string) => {
    // setContentData에서 캡션 부분만 업데이트
    setContentData((prev: any) => {
      return {
        contentRequestInfo: prev.contentRequestInfo,
        contentDataList: prev.contentDataList.map((item: any) =>
          item.id === content.id ? { ...item, caption: newCaption } : item
        ),
      };
    });
    setSelectedContent((prev: any) => {
      return {
        ...prev,
        caption: newCaption,
      };
    });
  };

  const syncImageVideoData = (newImageUrl: string) => {
    setContentData((prev: any) => {
      return {
        contentRequestInfo: prev.contentRequestInfo,
        contentDataList: prev.contentDataList.map((item: any) =>
          item.id === content.id
            ? {
                ...item,
                imageUrl: newImageUrl,
              }
            : item
        ),
      };
    });
    setSelectedContent((prev: any) => {
      return {
        ...prev,
        imageUrl: newImageUrl,
      };
    });
  };

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(content.caption);
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
      a.download = `image_${content.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert("이미지 다운로드에 실패했습니다.");
    }
  };

  const handleDownloadCaption = () => {
    const text = content.caption;
    const blob = new Blob([text], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `caption_${content.id}.txt`;
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
        url: "/content/image",
        method: "get",
        params: {
          key: content.imageUrl,
          fileName: `아몬드_이미지_${content.id}.png`,
        },
      });
      const imageLink = document.createElement("a");
      imageLink.href = response.data.url;
      imageLink.download = `아몬드_이미지_${content.id}.png`;
      document.body.appendChild(imageLink);
      imageLink.click();
      document.body.removeChild(imageLink);

      // 캡션 다운로드
      const captionBlob = new Blob([content.caption], { type: "text/plain" });
      const captionUrl = window.URL.createObjectURL(captionBlob);
      const captionLink = document.createElement("a");
      captionLink.href = captionUrl;
      captionLink.download = `아몬드_캡션_${content.id}.txt`;
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
      <Box
        sx={{
          p: viewType === "calendar" ? { xs: "32px 20px", md: "40px" } : 0,
        }}
      >
        {viewType === "calendar" && (
          <RowStack spacing="6px" sx={{ mb: { xs: "8px", md: "12px" } }}>
            <CardMedia
              component="img"
              src="/logoSymbol.png"
              sx={{
                width: { xs: "20px", md: "24px" },
                height: { xs: "20px", md: "24px" },
              }}
            />
            <Typography fontWeight={700} fontSize={{ xs: 18, md: 20 }}>
              {changeDateMDDKo(content.postDate)}자 피드
            </Typography>
          </RowStack>
        )}
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
              aspectRatio: imageRatio,
              width: "100%",
              maxWidth: "100%",
            }}
            
          >
            {imageUrl ? (
              <CardMedia
                component="img"
                src={imageUrl}
                alt="콘텐츠 이미지"
                sx={{
                  width: "100%",
                  aspectRatio: imageRatio,
                  // height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
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
                    <DownloadIcon
                      sx={{ fontSize: { xs: "16px", md: "18px" } }}
                    />
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
                <span style={{ fontWeight: 600 }}>
                  {brandName || "brandInsta"}{" "}
                </span>{" "}
                {isEditingCaption ? (
                  <TextField
                    value={editedCaption}
                    onChange={(e) => setEditedCaption(e.target.value)}
                    size="small"
                    multiline
                    fullWidth
                    sx={{ my: "4px" }}
                  />
                ) : (
                  <>
                    {parseHashtags(content.caption)}
                    <img
                      onClick={() => {
                        setIsEditingCaption(true);
                        setEditedCaption(content.caption);
                      }}
                      src="/assets/icon/edit.svg"
                      style={{
                        width: 16,
                        height: 16,
                        cursor: "pointer",
                        display: "inline-block",
                        verticalAlign: "middle",
                        marginLeft: 8,
                      }}
                    />
                  </>
                )}
              </Typography>

              {isEditingCaption && (
                <RowStack spacing="4px" sx={{ mt: "4px" }}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={handleSaveCaption}
                    sx={{ fontSize: { xs: 13, md: 14 } }}
                  >
                    저장
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setIsEditingCaption(false)}
                    sx={{ fontSize: { xs: 13, md: 14 } }}
                  >
                    취소
                  </Button>
                </RowStack>
              )}

              <Typography
                color="grey.600"
                fontSize={{ md: 14 }}
                sx={{ mt: "8px" }}
              >
                {changeDateDash(content.postDate)}
              </Typography>

              {/* 버튼 및 피드백 입력란 추가 */}
              <Box
                sx={{
                  mt: "24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <RowStack
                  spacing={{ xs: "4px", md: "5px" }}
                  onClick={() => regenerate("image")}
                  sx={{ cursor: "pointer" }}
                >
                  <CardMedia
                    component="img"
                    src="/assets/icon/retry.svg"
                    sx={{ width: 18, height: 18 }}
                  />
                  <Typography fontWeight={600} fontSize={14}>
                    이미지 다시 생성하기
                  </Typography>
                </RowStack>

                <RowStack
                  spacing={{ xs: "4px", md: "5px" }}
                  onClick={() => regenerate("caption")}
                  sx={{ cursor: "pointer" }}
                >
                  <CardMedia
                    component="img"
                    src="/assets/icon/retry.svg"
                    sx={{ width: 18, height: 18 }}
                  />
                  <Typography fontWeight={600} fontSize={14}>
                    문안(캡션) 다시 생성하기
                  </Typography>
                </RowStack>

                <Typography fontWeight={600} fontSize={14}>
                  ❇️ 구체적인 피드백이 있으신가요?
                </Typography>

                <TextField
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="문구는 좀 더 위트있는 내용으로 바꿔주고 간결한 문장으로 바꿔줘. 이미지는 좀 더 프레쉬한 가벼운 분위기의 이미지로 바꿔줘."
                  size="small"
                  multiline
                  rows={1}
                  inputProps={{
                    maxLength: 150,
                  }}
                  sx={{ mt: "4px" }}
                />
                <Button
                  onClick={() => regenerate("all")}
                  sx={{ alignSelf: "flex-end", fontSize: { xs: 13, md: 14 } }}
                >
                  콘텐츠 재생성
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {isLoading && (
        <LoadingModal modalSwitch={isLoading} setModalSwitch={setIsLoading} />
      )}
    </BaseModalBox>
  );
}
