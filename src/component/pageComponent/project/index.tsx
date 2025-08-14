import {
  Box,
  Typography,
  Button,
  IconButton,
  useMediaQuery,
  TextField,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Switch,
  Divider,
  Chip,
  Tooltip,
} from "@mui/material";
import { useEffect, useState, useContext } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import GridViewIcon from "@mui/icons-material/GridView";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { CenterProgress } from "@/component/ui/BoxStack";
import { useRouter } from "next/router";
import { apiCall, handleAPIError } from "@/module/utils/api";
import axios from "axios";
import { IMAGES_PER_FEEDSET, CONTENT_TYPES } from "@/constant/commonVariable";
import { LoadingModalWithVideo, ConfirmModal } from "@/component/ui/Modal";
import { changeDateDot } from "@/module/utils/commonFunction";
import InstagramFeedGrid from "./_parts/InstagramFeedGrid";
import NikeFeedSetGrid from "./_parts/NikeFeedSetGrid";
import ProjectEditModal from "./_parts/ProjectEditModal";
import ContentDetailModal from "./_parts/ContentDetailModal";
import ProjectSettingsModal from "./_parts/ProjectSettingsModal";
import LoginContext from "@/module/ContextAPI/LoginContext";
import SettingsIcon from '@mui/icons-material/Settings';

// 여기서 맨 처음에 request 어차피 체크하니 여부 체크하고
// 없으면 바로 생성 ㄲ. 맨 초기 유저들. 진입하자마자 생성하고 로딩하게 하면 될 듯~

export default function ProjectPage() {
  const isUnderMd = useMediaQuery("(max-width: 768px)");
  const router = useRouter();
  const { projectId, cr, autoGenerate, additionalInstructions } = router.query;
  const { userInfo, isLoginCheck, setUserInfo } = useContext(LoginContext);

  // 프로젝트 데이터 (브랜드/상품 정보)
  const [projectData, setProjectData] = useState<any>(null);
  const [projectEditModal, setProjectEditModal] = useState(false);
  const [projectSettingsModal, setProjectSettingsModal] = useState(false);
  const [projectDataRefresh, setProjectDataRefresh] = useState(false);


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

  const [showSafariWarning, setShowSafariWarning] = useState(false);
  
  // Modal state for content generation options
  const [showContentGenerationModal, setShowContentGenerationModal] = useState(false);
  const [modalAdditionalInstructions, setModalAdditionalInstructions] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  
  interface ImageConfig {
    contentType: string;
    snsEvent: boolean;
    imageSize: string;
    additionalText: string;
  }
  
  const [imageConfigs, setImageConfigs] = useState<ImageConfig[]>([]);

  // 예시 이벤트를 contentData에서 가져오도록 수정
  const calendarEvents =
    contentData.contentDataList?.map((content: any) => ({
      title: isUnderMd ? "발행" : "콘텐츠 발행",
      date: content.postDate.split(" ")[0],
      color: "#EFE8FF",
      content: content,
    })) || [];

  // Check for Safari incognito mode
  useEffect(() => {
    const checkSafariIncognito = () => {
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      if (isSafari) {
        // Test if cookies are blocked
        try {
          document.cookie = "test=1; SameSite=None; Secure";
          const cookieEnabled = document.cookie.includes("test=1");
          document.cookie = "test=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          
          if (!cookieEnabled) {
            console.log("[ProjectPage] Safari incognito mode detected - cookies blocked");
            setShowSafariWarning(true);
            return true;
          }
        } catch (e) {
          console.error("Cookie test failed:", e);
        }
      }
      return false;
    };
    
    checkSafariIncognito();
  }, []);

  // Authentication check - only redirect if truly not logged in
  useEffect(() => {
    // Only redirect after login check is complete and confirmed no user
    if (isLoginCheck && !userInfo && !showSafariWarning) {
      // Store the current project URL to return after login
      const currentUrl = `/project/${projectId}`;
      router.push(`/login?returnTo=${encodeURIComponent(currentUrl)}`);
    }
  }, [userInfo, isLoginCheck, router, projectId, showSafariWarning]);

  // Track if we've already triggered auto-generation
  const [hasAutoGenerated, setHasAutoGenerated] = useState(false);

  // 프로젝트 데이터 조회
  useEffect(() => {
    const getData = async () => {
      // First verify session is still valid
      try {
        const authCheck = await apiCall({
          url: "/auth/loginCheck",
          method: "get",
        });
        if (!authCheck.data.id) {
          console.log("Session invalid, clearing context and redirecting to login...");
          setUserInfo(null); // Clear stale context
          localStorage.removeItem("amondSessionToken"); // Clear session token
          const currentUrl = `/project/${projectId}`;
          router.push(`/login?returnTo=${encodeURIComponent(currentUrl)}`);
          return;
        }
      } catch (e) {
        console.log("Session check failed, clearing context and redirecting to login...");
        setUserInfo(null); // Clear stale context
        localStorage.removeItem("amondSessionToken"); // Clear session token
        const currentUrl = `/project/${projectId}`;
        router.push(`/login?returnTo=${encodeURIComponent(currentUrl)}`);
        return;
      }

      try {
        const response = await apiCall({
          url: "/content/project/detail",
          method: "get",
          params: {
            projectId,
          },
        });
        setProjectData(response.data.projectData);
        // Only automatically generate content for first-time users (when needContentRequest is true)
        // Don't auto-generate when switching between existing sessions
        if (response.data.needContentRequest && !selectedContentRequestId) {
          await makingContent(response.data.projectData);
        }
        // Handle autoGenerate flag from new feedset creation
        else if (autoGenerate === "true" && response.data.projectData && !hasAutoGenerated) {
          setHasAutoGenerated(true);
          await makingContent(response.data.projectData, additionalInstructions as string);
          // Clear the autoGenerate flag from URL
          router.replace(`/project/${projectId}`, undefined, { shallow: true });
        }
      } catch (e: any) {
        // Handle authentication errors
        if (e?.response?.data?.message?.includes("로그인")) {
          console.log("Authentication required, clearing context and redirecting to login...");
          setUserInfo(null); // Clear stale context
          const currentUrl = `/project/${projectId}`;
          router.push(`/login?returnTo=${encodeURIComponent(currentUrl)}`);
          return;
        }
        
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
  }, [projectId, projectDataRefresh, userInfo, autoGenerate]);

  // 생성된 콘텐츠 요청 조회
  useEffect(() => {
    const getContentRequest = async () => {
      try {
        // If cr parameter is provided in URL, use it directly
        if (cr) {
          setSelectedContentRequestId(Number(cr));
          return;
        }
        
        // Otherwise get the latest content request
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
  }, [projectId, userInfo, cr]);

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
            // Emit event to reload sidebar when all images are generated
            window.dispatchEvent(new Event('brand-updated'));
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


  const makingContent = async (inputProjectData?: any, extraInstructions?: string) => {
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
      for (let i = 0; i < IMAGES_PER_FEEDSET; i++) {
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
            additionalInstructions: extraInstructions || "", // Add extra instructions separately
            imageConfigs: imageConfigs, // Include image configurations from modal
          },
          projectId,
          requestType: "create",
          imageCount: IMAGES_PER_FEEDSET,
        },
      });
      const newContentRequestId = response.data.contentRequestId;
      setSelectedContentRequestId(newContentRequestId);
      
      // Navigate to the new content request URL first
      await router.push(`/project/${projectId}?cr=${newContentRequestId}`);
      
      // Then emit event to reload sidebar after navigation
      // This ensures the sidebar sees the updated currentProjectId and cr parameter
      setTimeout(() => {
        const event = new CustomEvent('brand-updated', { 
          detail: { 
            projectId: projectId as string, 
            contentRequestId: newContentRequestId 
          } 
        });
        window.dispatchEvent(event);
      }, 100);
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
      <Box
        sx={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          minHeight: "100vh",
          backgroundColor: "#fff"
        }}
      >
        <CenterProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{ 
        backgroundColor: "#fff",
        minHeight: "100vh",
        p: { xs: 1, md: 2 }
      }}
    >
      {projectData ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Header with Project Name */}
          <Box
            sx={{
              width: "100%",
              maxWidth: "800px",
              mb: 1,
              textAlign: "center",
            }}
          >
            <Typography 
              variant="h5" 
              fontWeight={700}
              sx={{ fontSize: { xs: 20, md: 24 } }}
            >
              {projectData.name}
            </Typography>
          </Box>

          {/* Main Content Grid - Centered */}
          <Box
            sx={{
              width: "100%",
              maxWidth: "800px",
            }}
          >
            <Box
              sx={{
                background: "#fff",
                borderRadius: 3,
                boxShadow: 1,
                p: { xs: 1, md: 2 },
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mb={2}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography fontWeight={700} fontSize={{ xs: 16, md: 20 }}>
                    {changeDateDot(contentData?.contentRequestInfo?.createdAt)}{" "}
                    생성
                  </Typography>
                  
                  {/* Settings Button */}
                  <Tooltip title="프로젝트 설정" placement="top">
                    <IconButton
                      onClick={() => setProjectSettingsModal(true)}
                      sx={{
                        border: "1px solid",
                        borderColor: "grey.300",
                        borderRadius: 1.5,
                        p: 0.5,
                        ml: 0.5,
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: 'primary.light',
                        },
                      }}
                      size="small"
                    >
                      <SettingsIcon sx={{ fontSize: { xs: 16, md: 18 } }} />
                    </IconButton>
                  </Tooltip>
                </Box>

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
                    <GridViewIcon
                      sx={{
                        fontSize: isUnderMd ? 18 : 22,
                        color: viewType === "feed" ? "primary.main" : "grey.600",
                      }}
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
                    <CalendarMonthIcon
                      sx={{
                        fontSize: isUnderMd ? 18 : 22,
                        color: viewType === "calendar" ? "primary.main" : "grey.600",
                      }}
                    />
                  </Box>
                </Box>
              </Box>

              {/* Image Generation Notification Box */}
              {contentData.contentDataList?.some((content: any) => !content.imageUrl) && (
                <Box
                  sx={{
                    mb: 2,
                    p: 2,
                    borderRadius: 2,
                    background: "linear-gradient(135deg, #f5f7ff 0%, #e8ecff 100%)",
                    border: "1px solid #d4d9ff",
                    position: "relative",
                  }}
                >
                  <Box display="flex" alignItems="flex-start" gap={2}>
                    <Box flex={1}>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: { xs: 14, md: 16 },
                          color: "#5865F2",
                          mb: 1,
                        }}
                      >
                        [이미지 생성 중]
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: { xs: 13, md: 14 },
                          color: "#666",
                          lineHeight: 1.6,
                        }}
                      >
                        이미지가 생성되는 동안 탭을 닫으셔도 됩니다. 
                        이미지 생성은 약 2-5분 정도 소요됩니다.
                      </Typography>
                      
                      {/* Progress indicator */}
                      <Box display="flex" alignItems="center" gap={1} mt={1.5}>
                        <CircularProgress size={16} thickness={4} sx={{ color: "#5865F2" }} />
                        <Typography fontSize={13} color="#666">
                          {contentData.contentDataList?.filter((c: any) => c.imageUrl).length || 0} / {contentData.contentDataList?.length || 0} 완료
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              )}

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
                <Box
                  sx={{
                    maxWidth: { xs: "100%", sm: "400px", md: "500px" },
                    mx: "auto",
                  }}
                >
                  {projectData?.name?.toLowerCase() === "nike" ? (
                    <NikeFeedSetGrid
                      contentDataList={contentData?.contentDataList}
                      onContentClick={(content) => {
                        setSelectedContent(content);
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
              )}
            </Box>
          </Box>
          
          {/* Action Buttons at Bottom */}
          <Box
            sx={{
              width: "100%",
              maxWidth: "800px",
              mt: 2,
              display: "flex",
              gap: 2,
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "center",
            }}
          >
            <Button
              variant="contained"
              size="large"
              sx={{
                height: { xs: 44, md: 48 },
                fontSize: { xs: 14, md: 15 },
                fontWeight: 700,
                minWidth: { xs: "100%", sm: 200 },
              }}
              onClick={() => {
                const categoryContentTypes = CONTENT_TYPES[projectData.category as keyof typeof CONTENT_TYPES] || CONTENT_TYPES['기타'];
                const defaultConfigs: ImageConfig[] = [];
                for (let i = 0; i < 4; i++) {
                  defaultConfigs.push({
                    contentType: categoryContentTypes[i] || '방향성 없음',
                    snsEvent: false,
                    imageSize: '1:1',
                    additionalText: ''
                  });
                }
                setImageConfigs(defaultConfigs);
                setModalAdditionalInstructions("");
                setSelectedImageIndex(null);
                setShowContentGenerationModal(true);
              }}
              disabled={isMakingLoading}
            >
              {isMakingLoading ? "생성 중..." : "콘텐츠 재생성하기"}
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              sx={{
                height: { xs: 44, md: 48 },
                fontSize: { xs: 14, md: 15 },
                fontWeight: 600,
                minWidth: { xs: "100%", sm: 180 },
                opacity: 0.5,
                cursor: 'not-allowed',
              }}
              onClick={() => {
                // Temporarily disabled
                alert('개별 이미지 생성 기능은 현재 준비 중입니다.');
              }}
              disabled={true}
            >
              개별 이미지 생성 (준비 중)
            </Button>
          </Box>
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

      {projectData && (
        <ProjectSettingsModal
          modalSwitch={projectSettingsModal}
          setModalSwitch={setProjectSettingsModal}
          projectData={projectData}
          contentSettings={contentSettings}
          setContentSettings={setContentSettings}
          setProjectDataRefresh={setProjectDataRefresh}
        />
      )}


      {showSafariWarning && (
        <ConfirmModal
          modalSwitch={showSafariWarning}
          setModalSwitch={setShowSafariWarning}
          title="브라우저 설정 확인"
          func={() => {
            setShowSafariWarning(false);
            // Open in a new regular window
            window.open(window.location.href, '_blank');
          }}
          contents={
            "Safari 시크릿 모드에서는 쿠키가 차단되어 로그인이 유지되지 않습니다.\n일반 브라우저 창에서 이용해주세요."
          }
          buttonLabel="새 창에서 열기"
          disableCloseIcon={false}
          disableOutClick={false}
        />
      )}

      {/* Content Generation Options Modal */}
      <Dialog 
        open={showContentGenerationModal} 
        onClose={() => {
          setShowContentGenerationModal(false);
          setSelectedImageIndex(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: 14, fontWeight: 600 }}>
          콘텐츠 생성 설정 - {projectData?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontSize: 12, mb: 1, color: 'text.secondary' }}>
              각 이미지를 클릭하여 설정을 변경하세요
            </Typography>
          </Box>
          
          {/* 2x2 Grid Preview */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gridTemplateRows: '1fr 1fr',
              gap: 2,
              mb: 3,
              maxWidth: 400,
              mx: 'auto',
            }}
          >
            {[0, 1, 2, 3].map((index) => {
              const config = imageConfigs[index];
              const isConfigured = config && (config.contentType !== '방향성 없음' || config.snsEvent || config.additionalText);
              const isSelected = selectedImageIndex === index;
              
              return (
                <Box
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  sx={{
                    aspectRatio: '1/1',
                    bgcolor: isSelected ? 'primary.light' : isConfigured ? 'grey.100' : 'grey.50',
                    border: '2px solid',
                    borderColor: isSelected ? 'primary.main' : isConfigured ? 'success.main' : 'grey.300',
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      borderColor: 'primary.main',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  {/* Image Number */}
                  <Typography
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      color: isSelected ? 'primary.main' : 'text.secondary',
                    }}
                  >
                    이미지 {index + 1}
                  </Typography>
                  
                  {/* Configuration Status */}
                  {isConfigured && (
                    <Box sx={{ textAlign: 'center', p: 1 }}>
                      <Typography sx={{ fontSize: 11, fontWeight: 500, mb: 0.5 }}>
                        {config.contentType}
                      </Typography>
                      <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>
                        {config.imageSize}
                      </Typography>
                      {config.snsEvent && (
                        <Chip label="SNS 이벤트" size="small" sx={{ fontSize: 9, height: 16, mt: 0.5 }} />
                      )}
                    </Box>
                  )}
                  
                  {/* Click to Configure */}
                  {!isConfigured && (
                    <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                      클릭하여 설정
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>
          
          {/* Configuration Panel for Selected Image */}
          {selectedImageIndex !== null && (
            <Box
              sx={{
                bgcolor: 'grey.50',
                borderRadius: 2,
                p: 2,
                mb: 2,
              }}
            >
              <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 2 }}>
                이미지 {selectedImageIndex + 1} 설정
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: { xs: '0 0 100%', sm: '0 0 48%' } }}>
                  {/* Content Type Selection */}
                  <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel sx={{ fontSize: 12 }}>콘텐츠 타입</InputLabel>
                    <Select
                      value={imageConfigs[selectedImageIndex]?.contentType || ''}
                      onChange={(e) => {
                        const newConfigs = [...imageConfigs];
                        newConfigs[selectedImageIndex] = { ...newConfigs[selectedImageIndex], contentType: e.target.value };
                        setImageConfigs(newConfigs);
                      }}
                      label="콘텐츠 타입"
                      sx={{ fontSize: 12 }}
                    >
                      <MenuItem value="방향성 없음" sx={{ fontSize: 12 }}>방향성 없음</MenuItem>
                      <Divider />
                      {(CONTENT_TYPES[projectData?.category as keyof typeof CONTENT_TYPES] || CONTENT_TYPES['기타']).map((type) => (
                        <MenuItem key={type} value={type} sx={{ fontSize: 12 }}>{type}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                
                <Box sx={{ flex: { xs: '0 0 100%', sm: '0 0 48%' } }}>
                  {/* Image Size Selection */}
                  <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel sx={{ fontSize: 12 }}>이미지 사이즈</InputLabel>
                    <Select
                      value={imageConfigs[selectedImageIndex]?.imageSize || '1:1'}
                      onChange={(e) => {
                        const newConfigs = [...imageConfigs];
                        newConfigs[selectedImageIndex] = { ...newConfigs[selectedImageIndex], imageSize: e.target.value };
                        setImageConfigs(newConfigs);
                      }}
                      label="이미지 사이즈"
                      sx={{ fontSize: 12 }}
                    >
                      <MenuItem value="1:1" sx={{ fontSize: 12 }}>1:1 (정사각형)</MenuItem>
                      <MenuItem value="2:3" sx={{ fontSize: 12 }}>2:3 (세로형)</MenuItem>
                      <MenuItem value="3:2" sx={{ fontSize: 12 }}>3:2 (가로형)</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
              
              {/* SNS Event Toggle */}
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={imageConfigs[selectedImageIndex]?.snsEvent || false}
                    onChange={(e) => {
                      const newConfigs = [...imageConfigs];
                      newConfigs[selectedImageIndex] = { ...newConfigs[selectedImageIndex], snsEvent: e.target.checked };
                      setImageConfigs(newConfigs);
                    }}
                  />
                }
                label="SNS 이벤트"
                sx={{ 
                  '& .MuiFormControlLabel-label': { fontSize: 12 },
                  mb: 2,
                  ml: 0
                }}
              />
              
              {/* Additional Text */}
              <TextField
                fullWidth
                multiline
                rows={2}
                size="small"
                placeholder="개별 요청사항"
                value={imageConfigs[selectedImageIndex]?.additionalText || ''}
                onChange={(e) => {
                  const newConfigs = [...imageConfigs];
                  newConfigs[selectedImageIndex] = { ...newConfigs[selectedImageIndex], additionalText: e.target.value };
                  setImageConfigs(newConfigs);
                }}
                sx={{ 
                  '& .MuiInputBase-root': { fontSize: 12 },
                  '& .MuiInputBase-input': { fontSize: 12 }
                }}
              />
            </Box>
          )}
          
          {/* General Additional Instructions */}
          <TextField
            fullWidth
            multiline
            rows={2}
            label="전체 추가 요청사항 (선택)"
            placeholder="4개 이미지 전체에 적용할 요청사항을 입력해주세요."
            value={modalAdditionalInstructions}
            onChange={(e) => setModalAdditionalInstructions(e.target.value)}
            sx={{
              '& .MuiInputBase-root': { fontSize: 12 },
              '& .MuiInputLabel-root': { fontSize: 12 }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setShowContentGenerationModal(false);
              setSelectedImageIndex(null);
            }}
            sx={{ fontSize: 12 }}
          >
            취소
          </Button>
          <Button 
            onClick={async () => {
              setShowContentGenerationModal(false);
              // Call makingContent with the configurations
              await makingContent(projectData, modalAdditionalInstructions);
            }}
            variant="contained"
            color="primary"
            sx={{ fontSize: 12 }}
            disabled={isMakingLoading}
          >
            생성하기
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

