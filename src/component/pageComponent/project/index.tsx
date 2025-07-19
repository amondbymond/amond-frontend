import {
  Box,
  Typography,
  Button,
  Slider as MUISlider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  useMediaQuery,
  CardMedia,
} from "@mui/material";
import { useEffect, useState, useContext } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { BodyContainer } from "@/component/ui/BodyContainer";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import VisibilityIcon from "@mui/icons-material/Visibility";
import WebAssetIcon from "@mui/icons-material/WebAsset";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import SlickSlider from "react-slick";
import { CenterProgress, RowStack } from "@/component/ui/BoxStack";
import Image from "next/image";
import { useRouter } from "next/router";
import { apiCall, handleAPIError } from "@/module/utils/api";
import axios from "axios";
import { s3ImageUrl } from "@/constant/commonVariable";
import { BaseModalBox, LoadingModalWithVideo } from "@/component/ui/Modal";
import { motion } from "framer-motion";
import { changeDateDot } from "@/module/utils/commonFunction";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import InstagramFeedGrid from "./_parts/InstagramFeedGrid";
import ContentsInputSection from "./_parts/ContentsInputSection";
import ProjectEditModal from "./_parts/ProjectEditModal";
import ContentDetailModal from "./_parts/ContentDetailModal";
import LoginContext from "@/module/ContextAPI/LoginContext";

// 여기서 맨 처음에 request 어차피 체크하니 여부 체크하고
// 없으면 바로 생성 ㄲ. 맨 초기 유저들. 진입하자마자 생성하고 로딩하게 하면 될 듯~

export default function ProjectPage() {
  const isUnderMd = useMediaQuery("(max-width: 768px)");
  const router = useRouter();
  const { projectId } = router.query;
  const { userInfo, isLoginCheck } = useContext(LoginContext);

  // 프로젝트 데이터 (브랜드/상품 정보)
  const [projectData, setProjectData] = useState<any>(null);
  const [projectEditModal, setProjectEditModal] = useState(false);
  const [projectDataRefresh, setProjectDataRefresh] = useState(false);

  const [isReversed, setIsReversed] = useState(false);

  // 콘텐츠 생성 관련 설정
  const [contentSettings, setContentSettings] = useState({
    trendIssueToggle: true,
    snsEventToggle: false,
    essentialKeywordToggle: false,
    competitorToggle: false,
    trendIssue: "",
    snsEvent: "",
    essentialKeyword: "",
    competitor: "",
    uploadCycle: "주 1회",
    toneMannerList: [] as string[],
    imageRatio: "4:5",
    directionList: [] as string[],
  });
  const [isMakingLoading, setIsMakingLoading] = useState(false);

  // 캘린더/피드 전환
  const [viewType, setViewType] = useState<"calendar" | "feed">("feed");
  // 콘텐츠 생성 요청 아이디
  const [selectedContentRequestId, setSelectedContentRequestId] = useState<
    number | null
  >(null);
  const [contentData, setContentData] = useState<any>({
    contentRequestInfo: null,
    contentDataList: null,
  });
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [contentDetailModal, setContentDetailModal] = useState(false);

  const [contentRequestListModal, setContentRequestListModal] = useState(false);

  // 예시 이벤트를 contentData에서 가져오도록 수정
  const calendarEvents =
    contentData.contentDataList?.map((content: any) => ({
      title: isUnderMd ? "발행" : "콘텐츠 발행",
      date: content.postDate.split(" ")[0],
      color: "#EFE8FF",
      content: content,
    })) || [];

  // Authentication check - only show message when accessed directly via URL
  useEffect(() => {
    if (isLoginCheck && !userInfo) {
      router.push("/login");
    }
  }, [userInfo, isLoginCheck, router]);

  // 프로젝트 데이터 조회
  useEffect(() => {
    const getData = async () => {
      try {
        const response = await apiCall({
          url: "/content/project/detail",
          method: "get",
          params: {
            projectId,
          },
        });
        setProjectData(response.data.projectData);
        if (response.data.needContentRequest) {
          await makingContent(response.data.projectData);
        }
      } catch (e) {
        handleAPIError(e, "프로젝트 데이터 조회 실패");
        if (axios.isAxiosError(e)) {
          if (e.response?.status === 400) {
            router.push("/");
          }
        }
      }
    };

    if (projectId && userInfo) {
      getData();
    }
  }, [projectId, projectDataRefresh, userInfo]);

  // 생성된 콘텐츠 요청 조회
  useEffect(() => {
    const getContentRequest = async () => {
      try {
        const response = await apiCall({
          url: "/content/request",
          method: "get",
          params: {
            projectId,
          },
        });
        setSelectedContentRequestId(response.data.contentRequestId);
      } catch (e) {
        handleAPIError(e, "콘텐츠 요청 조회 실패");
      }
    };

    if (projectId && userInfo) {
      getContentRequest();
    }
  }, [projectId, userInfo]);

  // 생성된 콘텐츠 데이터 조회
  useEffect(() => {
    const getContentData = async () => {
      try {
        const response = await apiCall({
          url: "/content/detail",
          method: "get",
          params: {
            contentRequestId: selectedContentRequestId,
          },
        });
        setContentData(response.data);
      } catch (e) {
        handleAPIError(e, "콘텐츠 데이터 조회 실패");
      }
    };

    if (selectedContentRequestId && userInfo) {
      getContentData();
    }
  }, [selectedContentRequestId, userInfo]);

  // 이미지 생성중인 항목이 있는지 확인하고 자동 새로고침
  useEffect(() => {
    const hasGeneratingImage = contentData.contentDataList?.some(
      (content: any) => !content.imageUrl
    );

    let intervalId: NodeJS.Timeout;

    if (hasGeneratingImage && userInfo) {
      intervalId = setInterval(async () => {
        try {
          const response = await apiCall({
            url: "/content/detail",
            method: "get",
            params: {
              contentRequestId: selectedContentRequestId,
            },
          });
          setContentData(response.data);

          // 모든 이미지가 생성되었으면 인터벌 중지
          const allImagesGenerated = response.data.contentDataList.every(
            (content: any) => content.imageUrl
          );
          if (allImagesGenerated) {
            clearInterval(intervalId);
          }
        } catch (e: any) {
          // Don't show error for rate limit during auto-refresh, just stop the interval
          if (e?.response?.status === 429) {
            clearInterval(intervalId);
          } else {
            handleAPIError(e, "콘텐츠 데이터 자동 새로고침 실패");
            clearInterval(intervalId);
          }
        }
      }, 30000); // 30초마다 새로고침 (rate limit 방지)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [contentData.contentDataList, selectedContentRequestId, userInfo]);

  const makingContent = async (inputProjectData?: any) => {
    if (isMakingLoading) return;
    try {
      setIsMakingLoading(true);
      
      // Add a small delay before making the request to help with rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create direction assignments for each content item
      const availableDirections = contentSettings.directionList.length > 0 
        ? contentSettings.directionList 
        : ["정보형", "감성전달형", "홍보중심형"];
      
      const contentDirections = [];
      for (let i = 0; i < 4; i++) {
        contentDirections.push(availableDirections[i % availableDirections.length]);
      }
      
      const response = await apiCall({
        url: "/content/request",
        method: "post",
        body: {
          projectData: inputProjectData || projectData,
          contentSettings: {
            ...contentSettings,
            trendIssue: contentSettings.trendIssueToggle
              ? contentSettings.trendIssue
              : "",
            snsEvent: contentSettings.snsEventToggle
              ? contentSettings.snsEvent
              : "",
            essentialKeyword: contentSettings.essentialKeywordToggle
              ? contentSettings.essentialKeyword
              : "",
            competitor: contentSettings.competitorToggle
              ? contentSettings.competitor
              : "",
            contentDirections, // Include direction assignments within contentSettings
          },
          projectId,
          requestType: "create",
          imageCount: 4, // Generate 4 images as required
        },
      });
      setSelectedContentRequestId(response.data.contentRequestId);
    } catch (e: any) {
      // Check if it's a rate limit error
      if (e?.response?.status === 429) {
        alert("OpenAI API 속도 제한에 도달했습니다. 잠시 후 다시 시도해주세요.");
      } else {
        handleAPIError(e, "콘텐츠 생성 실패");
      }
    } finally {
      setIsMakingLoading(false);
    }
  };

  // Show loading while checking authentication or if not logged in
  if (!isLoginCheck || !userInfo) {
    return (
      <BodyContainer
        sx={{ pt: { xs: "50px", md: "60px" }, pb: { xs: "40px", md: "40px" } }}
      >
        <CenterProgress />
      </BodyContainer>
    );
  }

  return (
    <BodyContainer
      sx={{ pt: { xs: "50px", md: "60px" }, pb: { xs: "40px", md: "40px" } }}
    >
      {projectData ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 2, md: 3.5 },
          }}
        >
          {/* 왼쪽: 콘텐츠 스타일 설정 */}
          <motion.div
            style={{
              flex: isReversed ? 7 : isUnderMd ? 12 : 5,
              minWidth: 0,
            }}
            animate={{ flex: isReversed ? 7 : isUnderMd ? 12 : 5 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
          >
            <Box
              sx={{
                p: { xs: 1.5, md: 4 },
                borderRadius: 3,
                background: "#fff",
                boxShadow: 1,
                height: "100%",
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mb={2}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography fontWeight={700} fontSize={{ xs: 18, md: 22 }}>
                    {projectData.name}
                  </Typography>
                </Box>
                <RowStack>
                  <IconButton onClick={() => setIsReversed(!isReversed)}>
                    <CardMedia
                      component="img"
                      src="/assets/icon/popup.svg"
                      alt="팝업"
                      sx={{
                        width: { xs: 18, md: 21 },
                        height: { xs: 18, md: 21 },
                      }}
                    />
                  </IconButton>
                </RowStack>
              </Box>

              {/* 제품 정보 */}
              <Accordion
                sx={{
                  mb: 3,
                  borderRadius: "8px",
                  "&:before": { display: "none" },
                  p: { xs: 0, md: 0.5 },
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography fontWeight={600} fontSize={{ xs: 16, md: 18 }}>
                    브랜드/상품 정보
                  </Typography>
                </AccordionSummary>

                <AccordionDetails>
                  <Box>
                    <Box
                      sx={{
                        width: "100%",
                        maxWidth: 400,
                        mx: "auto",
                        mb: 4,
                        borderRadius: 3,
                        position: "relative",
                        "& .slick-dots": {
                          bottom: -30,
                        },
                        "& .slick-slide": {
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          height: "400px",
                          maxHeight: "400px",
                          "& img": {
                            width: "100%",
                            height: "auto",
                            maxHeight: "400px",
                            objectFit: "contain",
                            borderRadius: "12px",
                          },
                        },
                      }}
                    >
                      {projectData?.imageList?.filter((img: string) => !!img)
                        .length > 0 ? (
                        <SlickSlider
                          dots
                          arrows
                          infinite={projectData?.imageList?.length > 1}
                          speed={500}
                          slidesToShow={1}
                          slidesToScroll={1}
                          className="product-slider"
                        >
                          {projectData?.imageList
                            ?.filter((img: string) => !!img)
                            .map((img: string, idx: number) => (
                              <Box
                                key={idx}
                                sx={{ position: "relative", width: "100%" }}
                              >
                                <img
                                  src={`${s3ImageUrl}/${img}`}
                                  alt={`제품 사진 ${idx + 1}`}
                                  style={{ width: "100%", display: "block" }}
                                />
                              </Box>
                            ))}
                        </SlickSlider>
                      ) : (
                        <Box
                          sx={{
                            width: "100%",
                            aspectRatio: "1/1",
                            bgcolor: "grey.100",
                            borderRadius: 3,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "grey.500",
                            fontSize: { xs: 14, md: 16 },
                          }}
                        >
                          제품 사진이 없습니다
                        </Box>
                      )}
                    </Box>

                    <Box sx={{ mb: 1 }}>
                      <Typography fontWeight={700} fontSize={20}>
                        브랜드/상품명
                      </Typography>
                      <Typography>{projectData.name}</Typography>
                      <Typography fontWeight={700} mt={2}>
                        상품 카테고리
                      </Typography>
                      <Typography>{projectData.category}</Typography>
                      <Typography fontWeight={700} mt={2}>
                        상품 URL
                      </Typography>
                      <Typography>{projectData.url}</Typography>

                      <Typography fontWeight={700} mt={2}>
                        SNS 운영 목적
                      </Typography>
                      <Typography>
                        {projectData.reasonList.join(", ")}
                      </Typography>
                      <Typography fontWeight={700} mt={2}>
                        추가 내용
                      </Typography>
                      <Typography>{projectData.description}</Typography>

                      <Button
                        fullWidth
                        variant="outlined"
                        sx={{ mt: "16px" }}
                        onClick={() => setProjectEditModal(true)}
                      >
                        수정하기
                      </Button>
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>

              <ContentsInputSection
                content={contentSettings}
                onChange={setContentSettings}
                isReversed={isReversed}
              />
              <Button
                fullWidth
                sx={{
                  mt: 1,
                  height: { xs: 36, md: 42 },
                  fontSize: { xs: 14, md: 16 },
                }}
                onClick={() => makingContent()}
                disabled={isMakingLoading}
              >
                {isMakingLoading ? "생성 중..." : "콘텐츠 생성하기"}
              </Button>
            </Box>
          </motion.div>

          {/* 오른쪽: 캘린더/피드 전환 */}
          <motion.div
            style={{ flex: isReversed ? 5 : 7, minWidth: 0 }}
            animate={{ flex: isReversed ? 5 : 7 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
          >
            <Box
              sx={{
                background: "#fff",
                borderRadius: 3,
                boxShadow: 1,
                p: { xs: 1.5, md: 3 },
                // height: "100%",
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mb={2}
              >
                <RowStack
                  onClick={() => setContentRequestListModal(true)}
                  spacing="6px"
                  sx={{ cursor: "pointer", "&:hover": { opacity: 0.9 } }}
                >
                  <Typography fontWeight={700} fontSize={{ xs: 16, md: 20 }}>
                    {changeDateDot(contentData?.contentRequestInfo?.createdAt)}{" "}
                    생성
                  </Typography>

                  <ExpandMoreRoundedIcon
                    sx={{
                      fontSize: isUnderMd ? 24 : 28,
                      p: isUnderMd ? 0.3 : 0.3,
                      border: "1px solid",
                      borderColor: "grey.300",
                      borderRadius: "999px",
                    }}
                  />
                </RowStack>

                <Box display="flex" gap={1}>
                  <Box
                    onClick={() => setViewType("feed")}
                    sx={{
                      border: "1.5px solid",
                      borderColor:
                        viewType === "feed" ? "primary.main" : "grey.300",
                      borderRadius: 2,
                      p: isUnderMd ? 0.5 : 1,
                      bgcolor: "transparent",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      boxShadow: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: isUnderMd ? 32 : 40,
                      height: isUnderMd ? 32 : 40,
                    }}
                  >
                    <Image
                      src="/assets/icon/instaFeed.svg"
                      alt="인스타 피드"
                      width={isUnderMd ? 18 : 22}
                      height={isUnderMd ? 18 : 22}
                    />
                  </Box>

                  <Box
                    onClick={() => setViewType("calendar")}
                    sx={{
                      border: "1.5px solid",
                      borderColor:
                        viewType === "calendar" ? "primary.main" : "grey.300",
                      borderRadius: 2,
                      p: isUnderMd ? 0.5 : 1,
                      bgcolor: "transparent",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      boxShadow: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: isUnderMd ? 32 : 40,
                      height: isUnderMd ? 32 : 40,
                    }}
                  >
                    <Image
                      src="/assets/icon/calender.svg"
                      alt="캘린더"
                      width={isUnderMd ? 18 : 22}
                      height={isUnderMd ? 18 : 22}
                    />
                  </Box>
                </Box>
              </Box>

              {viewType === "calendar" ? (
                <FullCalendar
                  plugins={[dayGridPlugin]}
                  initialView="dayGridMonth"
                  events={calendarEvents}
                  height="auto"
                  locale="ko"
                  headerToolbar={{
                    left: "prev",
                    center: "title",
                    right: "next",
                  }}
                  fixedWeekCount={false}
                  eventDisplay="background"
                  eventContent={(eventInfo) => {
                    const direction = eventInfo.event.extendedProps.content.direction;
                    const directionColors = {
                      "정보형": { bg: "#E3F2FD", border: "#2196F3", text: "#1565C0" },
                      "감성전달형": { bg: "#F3E5F5", border: "#9C27B0", text: "#7B1FA2" },
                      "홍보중심형": { bg: "#E8F5E8", border: "#4CAF50", text: "#388E3C" },
                    };
                    const colors = directionColors[direction as keyof typeof directionColors] || directionColors["정보형"];
                    
                    return (
                      <Box
                        sx={{
                          position: "relative",
                          width: "100%",
                          height: "100%",
                          overflow: "hidden",
                          borderRadius: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: colors.bg,
                          border: `1px solid ${colors.border}`,
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            backgroundColor: colors.bg,
                            opacity: 0.8,
                            transform: "scale(1.02)",
                          },
                        }}
                      >
                        <Typography
                          sx={{
                            color: colors.text,
                            fontSize: { xs: 9, md: 11 },
                            fontWeight: 700,
                            textAlign: "center",
                            lineHeight: 1.1,
                            padding: "2px 4px",
                            wordBreak: "break-word",
                            letterSpacing: "-0.02em",
                          }}
                        >
                          {direction}
                        </Typography>
                      </Box>
                    );
                  }}
                  eventClick={(info) => {
                    setSelectedContent(info.event.extendedProps.content);
                    setContentDetailModal(true);
                  }}
                />
              ) : (
                <InstagramFeedGrid
                  contentDataList={contentData?.contentDataList}
                  onContentClick={(content) => {
                    setSelectedContent(content);
                    setContentDetailModal(true);
                  }}
                />
              )}
            </Box>
          </motion.div>
        </Box>
      ) : (
        <CenterProgress />
      )}

      {projectData && (
        <ProjectEditModal
          modalSwitch={projectEditModal}
          setModalSwitch={setProjectEditModal}
          projectData={projectData}
          setProjectDataRefresh={setProjectDataRefresh}
        />
      )}

      {isMakingLoading && (
        <LoadingModalWithVideo
          modalSwitch={isMakingLoading}
          setModalSwitch={setIsMakingLoading}
        />
      )}

      {selectedContent && (
        <ContentDetailModal
          modalSwitch={contentDetailModal}
          setModalSwitch={setContentDetailModal}
          content={selectedContent}
          setSelectedContent={setSelectedContent}
          brandName={projectData?.name}
          setContentData={setContentData}
          viewType={viewType}
          imageRatio={contentData?.contentRequestInfo?.imageRatio?.replace(
            ":",
            "/"
          )}
        />
      )}

      {contentRequestListModal && projectId && (
        <ContentRequestListModal
          modalSwitch={contentRequestListModal}
          setModalSwitch={setContentRequestListModal}
          setSelectedContentRequestId={setSelectedContentRequestId}
          projectId={projectId as string}
        />
      )}
    </BodyContainer>
  );
}

function ContentRequestListModal({
  modalSwitch,
  setModalSwitch,
  setSelectedContentRequestId,
  projectId,
}: {
  modalSwitch: boolean;
  setModalSwitch: Function;
  setSelectedContentRequestId: any;
  projectId: string;
}) {
  const [contentRequestList, setContentRequestList] = useState([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    const getContentRequestList = async () => {
      try {
        const response = await apiCall({
          url: "/content/request/list",
          method: "get",
          params: { projectId },
        });
        setContentRequestList(response.data.contentRequestList);
      } catch (e) {
        handleAPIError(e, "콘텐츠 생성 목록 조회 실패");
      }
    };

    getContentRequestList();
  }, []);

  const handleSelect = (id: number) => {
    setSelectedId(id);
  };

  const handleConfirm = () => {
    if (selectedId) {
      setSelectedContentRequestId(selectedId);
      setModalSwitch(false);
    }
  };

  return (
    <BaseModalBox
      modalSwitch={modalSwitch}
      setModalSwitch={setModalSwitch}
      sx={{ width: { xs: "330px", md: "400px" } }}
    >
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Typography fontSize={{ xs: 18, md: 20 }} fontWeight={700} mb={2}>
          콘텐츠 생성 목록
        </Typography>
        <Box>
          {contentRequestList.map((item: any) => (
            <Box
              key={item.id}
              onClick={() => handleSelect(item.id)}
              sx={{
                p: "12px 14px",
                mb: "10px",
                border: "1px solid",
                borderColor:
                  selectedId === item.id ? "primary.main" : "grey.300",
                borderRadius: 1,
                cursor: "pointer",
                "&:hover": {
                  borderColor: "primary.main",
                },
              }}
            >
              <Typography fontWeight={500}>
                생성일 : {item.createdAt}
              </Typography>
              <Typography
                color="#666"
                fontSize={{ xs: 13, md: 14 }}
                sx={{ mt: "4px", mb: "2px" }}
              >
                필수 키워드 : {item.essentialKeyword}
              </Typography>
              <Typography color="#666" fontSize={{ xs: 13, md: 14 }}>
                업로드 주기 : {item.uploadCycle}
              </Typography>
            </Box>
          ))}
        </Box>

        <RowStack spacing="8px" sx={{ mt: "12px" }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setModalSwitch(false)}
          >
            취소
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={handleConfirm}
            disabled={!selectedId}
          >
            확인
          </Button>
        </RowStack>
      </Box>
    </BaseModalBox>
  );
}
