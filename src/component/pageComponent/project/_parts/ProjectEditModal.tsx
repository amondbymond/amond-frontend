import { RowStack } from "@/component/ui/BoxStack";
import { DropDownWithArr } from "@/component/ui/DropDown";
import { BaseModalBox, LoadingModal } from "@/component/ui/Modal";
import { GrayOutlinedButton } from "@/component/ui/styled/StyledButton";
import {
  categoryList,
  reasonList,
  s3ImageUrl,
} from "@/constant/commonVariable";
import { primaryColor } from "@/constant/styles/styleTheme";
import { apiCall, handleAPIError } from "@/module/utils/api";
import { Box, Button, Grid, TextField, Typography } from "@mui/material";
import { useRef, useState, useEffect } from "react";
import imageCompression from "browser-image-compression";

export default function ProjectEditModal({
  modalSwitch,
  setModalSwitch,
  projectData,
  setProjectDataRefresh,
}: {
  modalSwitch: boolean;
  setModalSwitch: Function;
  projectData: any;
  setProjectDataRefresh: Function;
}) {
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
  const [isLoading, setIsLoading] = useState(false);
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

      // The backend now handles brand updates automatically

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
      disableOutClick
      sx={{ width: { xs: "330px", md: "600px" } }}
    >
      <Box sx={{ p: 3 }}>
        <Typography
          align="center"
          fontWeight={700}
          fontSize={{ xs: 20, md: 24 }}
          mb={3}
        >
          브랜드/상품 수정
        </Typography>

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
        </Box>

        <Box
          display="flex"
          gap={1}
          sx={{
            mt: 2.5,
            pt: 2.5,
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

        {isLoading && (
          <LoadingModal modalSwitch={isLoading} setModalSwitch={setIsLoading} />
        )}
      </Box>
    </BaseModalBox>
  );
}
