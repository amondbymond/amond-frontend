import {
  Box,
  Typography,
  IconButton,
  Tabs,
  Tab,
  TextField,
  Button,
  Grid,
} from "@mui/material";
import { useState, useRef, useEffect } from "react";
import { BaseModalBox, LoadingModal } from "@/component/ui/Modal";
import CloseIcon from "@mui/icons-material/Close";
import { apiCall, handleAPIError } from "@/module/utils/api";
import { 
  categoryList, 
  reasonList, 
  s3ImageUrl 
} from "@/constant/commonVariable";
import { primaryColor } from "@/constant/styles/styleTheme";
import ContentsInputSection from "./ContentsInputSection";
import { DropDownWithArr } from "@/component/ui/DropDown";
import { RowStack } from "@/component/ui/BoxStack";
import { GrayOutlinedButton } from "@/component/ui/styled/StyledButton";
import imageCompression from "browser-image-compression";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-settings-tabpanel-${index}`}
      aria-labelledby={`project-settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

interface ProjectSettingsModalProps {
  modalSwitch: boolean;
  setModalSwitch: (value: boolean) => void;
  projectData: any;
  contentSettings: any;
  setContentSettings: (value: any) => void;
  setProjectDataRefresh: (value: boolean | ((prev: boolean) => boolean)) => void;
}

export default function ProjectSettingsModal({
  modalSwitch,
  setModalSwitch,
  projectData,
  contentSettings,
  setContentSettings,
  setProjectDataRefresh,
}: ProjectSettingsModalProps) {
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Local state for profile editing (same as ProjectEditModal)
  const [editData, setEditData] = useState({
    name: projectData.name,
    category: projectData.category,
    url: projectData.url,
    reasonList: projectData.reasonList,
    description: projectData.description,
  });

  const [newImages, setNewImages] = useState<File[]>([]);
  const [keptImages, setKeptImages] = useState<string[]>(
    (projectData.imageList || []).filter((img: string) => !!img)
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update state when modal opens or projectData changes
  useEffect(() => {
    if (modalSwitch) {
      setEditData({
        name: projectData.name,
        category: projectData.category,
        url: projectData.url,
        reasonList: projectData.reasonList,
        description: projectData.description,
      });
      setKeptImages((projectData.imageList || []).filter((img: string) => !!img));
      setNewImages([]);
    }
  }, [modalSwitch, projectData]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleClose = () => {
    setEditData({
      name: projectData.name,
      category: projectData.category,
      url: projectData.url,
      reasonList: projectData.reasonList,
      description: projectData.description,
    });
    setNewImages([]);
    setKeptImages((projectData.imageList || []).filter((img: string) => !!img));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setModalSwitch(false);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);

    // 파일 이름으로만 중복 체크
    const filteredFiles = selectedFiles.filter(
      (file) => !newImages.some((img) => img.name === file.name)
    );

    // browser-image-compression으로 2MB 이하로 압축
    const options = {
      maxSizeMB: 2,
      useWebWorker: true,
    };
    const compressedFiles = await Promise.all(
      filteredFiles.map((file) =>
        file.size > 2 * 1024 * 1024 ? imageCompression(file, options) : file
      )
    );

    const totalFiles =
      newImages.length + keptImages.length + compressedFiles.length;
    if (totalFiles > 5) {
      alert("이미지는 최대 5장까지 업로드할 수 있습니다.");
      return;
    }
    if (compressedFiles.length < selectedFiles.length) {
      alert("이미 업로드한 이미지가 포함되어 있습니다.");
    }
    setNewImages((prev) => [...prev, ...compressedFiles]);

    // 파일 input 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (idx: number, isExisting: boolean = false) => {
    if (isExisting) {
      setKeptImages((prev) => prev.filter((_, i) => i !== idx));
    } else {
      setNewImages((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const handleSave = async () => {
    if (isLoading) return;

    if (editData.name === "") {
      alert("브랜드/상품명을 입력해주세요.");
      return;
    } else if (editData.category === "") {
      alert("카테고리를 선택해주세요.");
      return;
    } else if (editData.url === "") {
      // alert("상품/서비스 URL을 입력해주세요.");
      // return;
    } else if (editData.url !== "" && !editData.url.includes("http")) {
      alert("상품/서비스 URL이 올바르지 않습니다.");
      return;
    } else if (editData?.reasonList?.length === 0) {
      alert("SNS 운영 목적을 선택해주세요.");
      return;
    } else if (editData.description === "") {
      alert("추가 내용을 입력해주세요.");
      return;
    } else if (newImages.length + keptImages.length < 1) {
      alert("이미지를 업로드해주세요.");
      return;
    }

    try {
      setIsLoading(true);

      // 1. 삭제된 이미지 찾기
      const deletedImages = projectData.imageList.filter(
        (img: string) => !keptImages.includes(img)
      );

      // 2. 새로 추가된 이미지 처리
      let dbImageList = [...keptImages];
      if (newImages.length > 0) {
        const response = await apiCall({
          url: "/content/project/edit/image",
          method: "post",
          body: {
            imageNameList: newImages.map((image) => image.name),
          },
        });

        const { presignedUrlList, entireDirectoryList } = response.data;
        // presignedUrlList 내에 있는 url로 s3에 이미지 업로드
        await Promise.all(
          presignedUrlList.map(async (url: string, index: number) => {
            await fetch(url, {
              method: "put",
              body: newImages[index],
              headers: {
                "Content-Type": newImages[index].type,
              },
            });
          })
        );
        dbImageList = [...dbImageList, ...entireDirectoryList];
      }

      // 3. 프로젝트 정보 업데이트
      await apiCall({
        url: "/content/project",
        method: "put",
        body: {
          projectId: projectData.id,
          ...editData,
          dbImageList,
          deletedImageList: deletedImages,
        },
      });

      setModalSwitch(false);
      setProjectDataRefresh((prev: boolean) => !prev);
      
      // Dispatch custom event to refresh sidebar
      window.dispatchEvent(new Event('brand-updated'));
      
      alert("프로젝트 수정이 완료되었습니다.");
    } catch (e) {
      handleAPIError(e, "프로젝트 수정 실패");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BaseModalBox
      modalSwitch={modalSwitch}
      setModalSwitch={setModalSwitch}
      sx={{
        width: { xs: "90%", md: "700px" },
        maxHeight: "90vh",
        overflow: "auto",
      }}
    >
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h6" fontWeight={700}>
            프로젝트 설정
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="브랜드/상품 정보" />
            <Tab label="콘텐츠 스타일 설정" />
          </Tabs>
        </Box>

        {/* Tab 1: Brand/Product Information (Same as ProjectEditModal) */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Box>
              <Typography fontWeight={600} mb={1}>
                브랜드/상품명
              </Typography>
              <TextField
                fullWidth
                value={editData.name}
                onChange={(e) =>
                  setEditData({ ...editData, name: e.target.value })
                }
                placeholder="예) 아몬드 또는 amond"
              />
            </Box>

            <Box>
              <Typography fontWeight={600} mb={1}>
                카테고리
              </Typography>
              <DropDownWithArr
                selectList={categoryList}
                value={editData.category}
                onChange={(value: string | number) =>
                  setEditData({ ...editData, category: value })
                }
                initialLabel="카테고리를 선택해주세요."
              />
            </Box>

            <Box>
              <Typography fontWeight={600}>상품/서비스 URL</Typography>
              <Typography
                color={primaryColor}
                fontSize={{ xs: 13, md: 14 }}
                sx={{ mt: 0.3, mb: 1, opacity: 0.8 }}
              >
                내 콘텐츠를 표현할 수 있는 참고 링크를 알려주세요! 대표 홈페이지,
                노션, 제품의 상세페이지, 블로그 포스팅 등 다 좋아요.
              </Typography>
              <TextField
                fullWidth
                value={editData.url}
                onChange={(e) =>
                  setEditData({ ...editData, url: e.target.value })
                }
                placeholder="https://"
              />
            </Box>

            <Box>
              <RowStack mb={1} spacing="10px">
                <Typography fontWeight={600}>이미지</Typography>
                <Button
                  variant="outlined"
                  component="label"
                  disabled={newImages.length + keptImages.length >= 5}
                  sx={{
                    height: "32px",
                    fontSize: { xs: "13px", md: "14px" },
                    px: "10px",
                  }}
                >
                  이미지 업로드 (최대 5장)
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
                    multiple
                    hidden
                    onChange={handleImageChange}
                    disabled={newImages.length + keptImages.length >= 5}
                  />
                </Button>
              </RowStack>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    flexWrap: "wrap",
                    justifyContent: "center",
                  }}
                >
                  {keptImages.filter(Boolean).map((img, idx) => (
                    <Box
                      key={`existing-${idx}`}
                      sx={{
                        width: 120,
                        height: 120,
                        borderRadius: 2,
                        overflow: "hidden",
                        position: "relative",
                        border: "1px solid #eee",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#fafafa",
                      }}
                    >
                      <img
                        src={`${s3ImageUrl}/${img}`}
                        alt={`preview-${idx}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: 8,
                        }}
                      />
                      <Button
                        size="small"
                        onClick={() => handleRemoveImage(idx, true)}
                        sx={{
                          minWidth: 0,
                          width: 24,
                          height: 24,
                          position: "absolute",
                          top: 4,
                          right: 4,
                          background: "rgba(0,0,0,0.5)",
                          color: "white",
                          borderRadius: "50%",
                          p: 0,
                          zIndex: 2,
                          fontWeight: 700,
                          fontSize: 18,
                          lineHeight: 1,
                          "&:hover": {
                            background: "rgba(0,0,0,0.7)",
                          },
                        }}
                      >
                        ×
                      </Button>
                    </Box>
                  ))}
                  {newImages.map((img, idx) => (
                    <Box
                      key={`new-${idx}`}
                      sx={{
                        width: 120,
                        height: 120,
                        borderRadius: 2,
                        overflow: "hidden",
                        position: "relative",
                        border: "1px solid #eee",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#fafafa",
                      }}
                    >
                      <img
                        src={URL.createObjectURL(img)}
                        alt={`preview-${idx}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: 8,
                        }}
                      />
                      <Button
                        size="small"
                        onClick={() => handleRemoveImage(idx)}
                        sx={{
                          minWidth: 0,
                          width: 24,
                          height: 24,
                          position: "absolute",
                          top: 4,
                          right: 4,
                          background: "rgba(0,0,0,0.5)",
                          color: "white",
                          borderRadius: "50%",
                          p: 0,
                          zIndex: 2,
                          fontWeight: 700,
                          fontSize: 18,
                          lineHeight: 1,
                          "&:hover": {
                            background: "rgba(0,0,0,0.7)",
                          },
                        }}
                      >
                        ×
                      </Button>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>

            <Box>
              <Typography fontWeight={600} mb={1}>
                SNS 운영 목적
              </Typography>
              <Grid container spacing={1}>
                {reasonList.map((reason) => (
                  <Grid key={reason} size={{ xs: 6 }}>
                    <Box
                      onClick={() => {
                        const newReasonList = editData.reasonList.includes(reason)
                          ? editData.reasonList.filter(
                              (r: string) => r !== reason
                            )
                          : editData.reasonList.length >= 3
                          ? editData.reasonList
                          : [...editData.reasonList, reason];

                        if (
                          !editData.reasonList.includes(reason) &&
                          editData.reasonList.length >= 3
                        ) {
                          alert("최대 3개까지만 선택 가능합니다.");
                          return;
                        }

                        setEditData({ ...editData, reasonList: newReasonList });
                      }}
                      sx={{
                        cursor: "pointer",
                        px: 2,
                        py: 1,
                        borderRadius: "8px",
                        border: `1.5px solid ${
                          editData.reasonList.includes(reason)
                            ? primaryColor
                            : "#E6E6E6"
                        }`,
                        background: "#fff",
                        color: editData.reasonList.includes(reason)
                          ? primaryColor
                          : "#999999",
                        fontWeight: 600,
                        fontSize: 14,
                        transition: "all 0.15s",
                        userSelect: "none",
                        textAlign: "center",
                      }}
                    >
                      {reason}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Box>
              <Typography fontWeight={600} mb={1}>
                추가 내용
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={editData.description}
                onChange={(e) =>
                  setEditData({ ...editData, description: e.target.value })
                }
                placeholder="현재 학원을 운영하는 용인 지역 안에서는 꽤 좋은 반응도 들어오고 매출도 좋은데, 전국적으로 나의 영향력을 높이는 게 목표야. 내 서비스와 브랜드에 대한 영향력을 강조해줘. 그리고 내가 가진 성인,아동 스피치에 대한 전문성을 강조해줘."
                inputProps={{
                  maxLength: 1000,
                }}
              />
            </Box>

            <Box
              display="flex"
              gap={1}
              sx={{
                mt: 1,
                pt: 2,
                borderTop: "1px solid",
                borderColor: "grey.200",
              }}
            >
              <GrayOutlinedButton
                fullWidth
                variant="outlined"
                onClick={handleClose}
                sx={{
                  height: { md: "40px" },
                }}
              >
                취소
              </GrayOutlinedButton>
              <Button
                fullWidth
                variant="contained"
                onClick={handleSave}
                disabled={isLoading}
                sx={{ height: { md: "40px" } }}
              >
                {"저장하기"}
              </Button>
            </Box>
          </Box>
        </TabPanel>

        {/* Tab 2: Content Settings */}
        <TabPanel value={tabValue} index={1}>
          <ContentsInputSection
            content={contentSettings}
            onChange={setContentSettings}
            isReversed={false}
            hideAccordion={true}
          />
          
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 2, display: "block", textAlign: "center" }}
          >
            콘텐츠 설정은 다음 콘텐츠 생성 시 적용됩니다
          </Typography>
        </TabPanel>

        {isLoading && (
          <LoadingModal modalSwitch={isLoading} setModalSwitch={setIsLoading} />
        )}
      </Box>
    </BaseModalBox>
  );
}