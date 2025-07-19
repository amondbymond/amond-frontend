import { RowStack } from "@/component/ui/BoxStack";
import { primaryColor } from "@/constant/styles/styleTheme";
import {
  Box,
  Button,
  Typography,
  IconButton,
} from "@mui/material";
import { useState, useContext } from "react";
import { motion } from "framer-motion";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { apiCall, handleAPIError } from "@/module/utils/api";
import {
  ConfirmModal,
  LoadingModalWithVideo,
} from "@/component/ui/Modal";
import { useRouter } from "next/router";
import { Step1, Step2, Step3, Step4, Step5, Step6, Step7 } from "./OnboardingSteps";
import LoginContext from "@/module/ContextAPI/LoginContext";

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();
  const { userInfo } = useContext(LoginContext);
  const progress = (currentStep / 6) * 100; // Updated to 6 steps (Step 7 is summary)
  const [brandInput, setBrandInput] = useState({
    name: "",
    category: "",
    url: "",
    reasonList: [],
    description: "",
  });

  const [images, setImages] = useState<File[]>([]);
  const [scrapedImages, setScrapedImages] = useState<File[]>([]);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [hasUrl, setHasUrl] = useState<boolean | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [needLoginonfirmModal, setNeedLoginonfirmModal] = useState(false);

  const clickNext = () => {
    if (currentStep === 1) {
      if (brandInput.name === "") {
        alert("브랜드 혹은 상품명을 입력해주세요.");
        return;
      }
    } else if (currentStep === 2) {
      if (brandInput.category === "") {
        alert("카테고리를 선택해주세요.");
        return;
      }
    } else if (currentStep === 3) {
      if (brandInput.reasonList.length === 0) {
        alert("이유를 선택해주세요.");
        return;
      }
    } else if (currentStep === 4) {
      // URL step validation
      if (hasUrl === null) {
        alert("링크 유무를 선택해주세요.");
        return;
      }
      if (hasUrl && brandInput.url === "") {
        alert("링크를 입력해주세요.");
        return;
      }
      if (hasUrl && brandInput.url !== "" && !brandInput.url.includes("http")) {
        alert("올바른 링크를 입력해주세요.");
        return;
      }
    } else if (currentStep === 5) {
      // Image step - no validation required, can proceed with 0 images
      // Users can proceed without selecting any images
    } else if (currentStep === 6) {
      if (brandInput.description === "") {
        alert("내용을 입력해주세요.");
        return;
      }
    }

    if (currentStep === 6) {
      // Move to summary step (Step 7)
      setCurrentStep(7);
    } else if (currentStep === 7) {
      saveBrandInput();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const saveBrandInput = async () => {
    if (isLoading) return;
    try {
      setIsLoading(true);
      
      // Get selected images in the correct order
      const allImages = [...images, ...scrapedImages];
      const selectedImageFiles = allImages.filter((_, index) => {
        const imageKey = index < images.length ? `manual-${index}` : `scraped-${index - images.length}`;
        return selectedImages.has(imageKey);
      });

      const response = await apiCall({
        url: "/content/project",
        method: "post",
        body: {
          name: brandInput.name,
          category: brandInput.category,
          url: brandInput.url,
          reasonList: brandInput.reasonList,
          description: brandInput.description,
          imageNameList: selectedImageFiles.map((image) => image.name),
          imageCount: selectedImageFiles.length,
        },
      });

      const { projectId, presignedUrlList, userId } = response.data;
      // presignedUrlList 내에 있는 url로 s3에 이미지 업로드
      await Promise.all(
        presignedUrlList.map(async (url: string, index: number) => {
          await fetch(url, {
            method: "put",
            body: selectedImageFiles[index],
            headers: {
              "Content-Type": selectedImageFiles[index].type,
            },
          });
        })
      );

      if (userId) {
        router.push(`/project/${projectId}`);
      } else {
        // 로컬 스토리지에 projectId 저장
        localStorage.setItem("amondProjectId", projectId);
        setNeedLoginonfirmModal(true);
      }
    } catch (e) {
      handleAPIError(e, "콘텐츠 생성 실패");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
      }}
    >
      <RowStack
        justifyContent="space-between"
        sx={{
          mt: { md: "30px" },
          mb: { xs: "12px", md: "24px" },
          width: { xs: 1, md: "500px" },
        }}
      >
        <Box sx={{ width: "50px" }}>
          {currentStep > 1 && currentStep !== 7 && (
            <IconButton
              onClick={() => setCurrentStep(currentStep - 1)}
              sx={{ p: 0 }}
            >
              <ArrowBackIcon />
            </IconButton>
          )}
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          {currentStep === 7 ? (
            <>
              <Typography fontWeight={700} fontSize={{ xs: 16, md: 20 }} sx={{ mb: 0.5 }}>
                브랜드 맞춤 정보를 링크 하나로 한 번에!✨
              </Typography>
              <Typography fontSize={{ xs: 12, md: 14 }} sx={{ color: "#888" }}>
                아몬드가 {userInfo ? `@user_${userInfo.id}님이` : "회원님이"} 공유해주신 링크를 통해, 맞춤 브랜드 정보를 가져왔어요.
              </Typography>
            </>
          ) : (
            <Typography fontWeight={600} fontSize={{ xs: 15, md: 18 }}>
              {`${currentStep}/6`}
            </Typography>
          )}
        </Box>
        <Box sx={{ width: "50px" }} />
      </RowStack>

      {currentStep !== 7 && (
        <Box
          sx={{
            width: "100%",
            height: "8px",
            backgroundColor: "#E0E0E0",
            borderRadius: "4px",
            overflow: "hidden",
            maxWidth: "500px",
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{
              height: "100%",
              backgroundColor: primaryColor,
              borderRadius: "4px",
            }}
          />
        </Box>
      )}

      <Box
        sx={{
          mt: "32px",
          mb: { xs: "16px", md: "24px" },
          width: { xs: 1, md: "auto" },
        }}
      >
        {currentStep === 1 && (
          <Step1 setBrandInput={setBrandInput} brandInput={brandInput} />
        )}
        {currentStep === 2 && (
          <Step2 setBrandInput={setBrandInput} brandInput={brandInput} />
        )}
        {currentStep === 3 && (
          <Step3 setBrandInput={setBrandInput} brandInput={brandInput} />
        )}
        {currentStep === 4 && (
          <Step4 
            setBrandInput={setBrandInput} 
            brandInput={brandInput}
            hasUrl={hasUrl}
            setHasUrl={setHasUrl}
          />
        )}
        {currentStep === 5 && (
          <Step5 
            hasUrl={hasUrl}
            setImages={setImages} 
            images={images}
            scrapedImages={scrapedImages}
            setScrapedImages={setScrapedImages}
            brandInput={brandInput}
            selectedImages={selectedImages}
            setSelectedImages={setSelectedImages}
          />
        )}
        {currentStep === 6 && (
          <Step6 setBrandInput={setBrandInput} brandInput={brandInput} />
        )}
        {currentStep === 7 && (
          <Step7 
            brandInput={brandInput}
            images={images}
            scrapedImages={scrapedImages}
            hasUrl={hasUrl}
            selectedImages={selectedImages}
            onGenerateContent={saveBrandInput}
            onBrandInputChange={setBrandInput}
          />
        )}
      </Box>

      {/* At the bottom of Step5, next to the navigation button */}
      {currentStep !== 7 && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 3, gap: 2 }}>
          {currentStep === 5 && (
            <Typography variant="body2" sx={{ color: primaryColor, fontWeight: 600 }}>
              최대 5장 선택 가능 ({selectedImages.size}/5)
            </Typography>
          )}
          <Button
            onClick={clickNext}
            sx={{
              fontSize: { xs: "15px", md: "18px" },
              width: { xs: "100%", md: "240px" },
              py: { xs: "6px", md: "6px" },
              mx: "auto",
            }}
          >
            {currentStep === 5 ? "다음" : currentStep === 6 ? "나의 브랜드 정보 한번 정리" : "다음"}
          </Button>
        </Box>
      )}

      {isLoading && (
        <LoadingModalWithVideo
          modalSwitch={isLoading}
          setModalSwitch={setIsLoading}
        />
      )}

      {needLoginonfirmModal && (
        <ConfirmModal
          modalSwitch={needLoginonfirmModal}
          setModalSwitch={setNeedLoginonfirmModal}
          title="로그인 페이지 이동"
          func={() => router.push("/login")}
          contents={
            "콘텐츠 생성을 위해 로그인이 필요합니다.\n로그인하시면 입력하셨던 내용들은 자동으로 저장됩니다."
          }
          buttonLabel="확인"
          disableCloseIcon={true}
          disableOutClick
        />
      )}
    </Box>
  );
} 