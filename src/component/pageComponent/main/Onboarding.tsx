import { RowStack } from "@/component/ui/BoxStack";
import { primaryColor } from "@/constant/styles/styleTheme";
import {
  Box,
  Button,
  Typography,
  IconButton,
} from "@mui/material";
import { useState, useContext, useEffect } from "react";
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
  
  // console.log("[Onboarding] Starting with userInfo:", userInfo);
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
  const [showIncognitoWarning, setShowIncognitoWarning] = useState(false);
  
  // Check if we're creating a new feed set from an existing brand
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  
  useEffect(() => {
    // Check if we're creating a new feed set from an existing brand
    const brandId = localStorage.getItem('selectedBrandId');
    const isNewFeedSet = router.query.newFeedSet === 'true';
    const autoGenerate = router.query.autoGenerate === 'true';
    
    if (brandId && isNewFeedSet) {
      // Pre-fill brand data from localStorage
      const brandName = localStorage.getItem('selectedBrandName');
      const brandCategory = localStorage.getItem('selectedBrandCategory');
      const brandUrl = localStorage.getItem('selectedBrandUrl');
      const brandDescription = localStorage.getItem('selectedBrandDescription');
      const additionalInstructions = localStorage.getItem('additionalInstructions');
      
      setBrandInput({
        name: brandName || '',
        category: brandCategory || '',
        url: brandUrl || '',
        reasonList: [],
        description: brandDescription || (additionalInstructions ? `${brandDescription}\n\n추가 요청사항: ${additionalInstructions}` : ''),
      });
      
      setSelectedBrandId(brandId);
      
      // Clear the localStorage after using it
      localStorage.removeItem('selectedBrandId');
      localStorage.removeItem('selectedBrandName');
      localStorage.removeItem('selectedBrandCategory');
      localStorage.removeItem('selectedBrandUrl');
      localStorage.removeItem('selectedBrandDescription');
      localStorage.removeItem('additionalInstructions');
      
      // If auto-generate is true, skip to image generation
      if (autoGenerate) {
        // Set default values for automatic generation
        setHasUrl(!!brandUrl);
        // Start loading immediately
        setIsLoading(true);
        // Skip directly to save without showing any steps
        setTimeout(() => {
          saveBrandInput(true); // Pass flag for auto-generation
        }, 100);
      }
    }
  }, [router.query]);

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
      // Scroll to top when showing summary
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentStep === 7) {
      saveBrandInput();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  // Handle Enter key press
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        // Don't proceed if a textarea is focused (to allow multiline input)
        const activeElement = document.activeElement;
        if (activeElement?.tagName === 'TEXTAREA') {
          return;
        }
        
        // Don't proceed if loading
        if (isLoading) {
          return;
        }
        
        event.preventDefault();
        clickNext();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentStep, brandInput, hasUrl, selectedImages, isLoading]);

  const saveBrandInput = async (autoGenerate: boolean = false, additionalData?: any) => {
    if (isLoading) return;
    
    console.log("[Onboarding] saveBrandInput called with userInfo:", userInfo);
    console.log("[Onboarding] Additional data:", additionalData);
    
    // Ensure user is logged in before creating project
    if (!userInfo) {
      console.error("[Onboarding] No userInfo when saving brand!");
      setNeedLoginonfirmModal(true);
      return;
    }
    
    try {
      setIsLoading(true);
      
      let selectedImageFiles: File[] = [];
      
      if (autoGenerate) {
        // For auto-generation, we'll send empty image list and let backend generate
        selectedImageFiles = [];
        console.log("[Onboarding] Auto-generating 4 images for brand:", brandInput.name);
      } else {
        // Get selected images in the correct order
        const allImages = [...images, ...scrapedImages];
        selectedImageFiles = allImages.filter((_, index) => {
          const imageKey = index < images.length ? `manual-${index}` : `scraped-${index - images.length}`;
          return selectedImages.has(imageKey);
        });
      }

      let response;
      
      if (selectedBrandId) {
        // Create a new feed set for existing brand
        response = await apiCall({
          url: `/brand/${selectedBrandId}/feedset`,
          method: "post",
          body: {
            imageNameList: selectedImageFiles.map((image) => image.name),
            reasonList: brandInput.reasonList,
            autoGenerate: autoGenerate,
            imageCount: autoGenerate ? 4 : selectedImageFiles.length,
          },
        });
      } else {
        // Create a new brand and project
        response = await apiCall({
          url: "/content/project",
          method: "post",
          body: {
            name: brandInput.name,
            category: brandInput.category,
            url: brandInput.url,
            reasonList: brandInput.reasonList,
            description: brandInput.description,
            imageNameList: selectedImageFiles.map((image) => image.name),
            imageCount: autoGenerate ? 4 : selectedImageFiles.length,
            autoGenerate: autoGenerate,
            ...(additionalData || {}), // Include additional brand data
          },
        });
      }

      const { projectId, presignedUrlList, userId } = response.data;
      
      // Only upload images if not auto-generating
      if (!autoGenerate && selectedImageFiles.length > 0) {
        // presignedUrlList 내에 있는 url로 s3에 이미지 업로드
        await Promise.all(
          presignedUrlList.map(async (url: string, index: number) => {
            const response = await fetch(url, {
              method: "PUT",
              body: selectedImageFiles[index],
              headers: {
                "Content-Type": selectedImageFiles[index].type || "application/octet-stream",
              },
            });
            
            if (!response.ok) {
              console.error(`Failed to upload image ${index}:`, response.status, response.statusText);
              throw new Error(`Failed to upload image ${index}`);
            }
          })
        );
      }

      if (autoGenerate) {
        // For auto-generation, trigger content generation request
        console.log("[Onboarding] Triggering content generation for project:", projectId);
        
        // Trigger content generation API
        try {
          await apiCall({
            url: "/content/request",
            method: "post",
            body: {
              projectId,
              contentSettings: {
                uploadCycle: ['1', '1', '1'], // Generate 1 set of 4 images
              },
              requestType: 'auto',
            },
          });
          console.log("[Onboarding] Content generation request sent successfully");
        } catch (error) {
          console.error("[Onboarding] Failed to trigger content generation:", error);
        }
        
        // Dispatch brand-updated event immediately
        window.dispatchEvent(new Event('brand-updated'));
        
        // Navigate to project page
        await router.push(`/project/${projectId}`);
      } else if (userInfo) {
        // Dispatch brand-updated event immediately
        window.dispatchEvent(new Event('brand-updated'));
        
        // Navigate to project page
        await router.push(`/project/${projectId}`);
      } else {
        // 로컬 스토리지에 projectId 저장
        localStorage.setItem("amondProjectId", projectId);
        setNeedLoginonfirmModal(true);
      }
    } catch (e: any) {
      // Don't redirect on authentication errors - show modal instead
      if (e?.response?.data?.message?.includes("로그인")) {
        // Check if cookies are blocked (incognito mode)
        try {
          document.cookie = "test=1; SameSite=None; Secure";
          const cookieEnabled = document.cookie.includes("test=1");
          document.cookie = "test=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          
          if (!cookieEnabled) {
            setShowIncognitoWarning(true);
            return;
          }
        } catch (cookieError) {
          console.error('Cookie test failed:', cookieError);
        }
        
        setNeedLoginonfirmModal(true);
      } else {
        handleAPIError(e, "콘텐츠 생성 실패");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // If auto-generating, only show loading modal
  if (router.query.autoGenerate === 'true' && isLoading) {
    return (
      <>
        <LoadingModalWithVideo
          modalSwitch={isLoading}
          setModalSwitch={setIsLoading}
        />
      </>
    );
  }

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
            onGenerateContent={(additionalData) => saveBrandInput(false, additionalData)}
            onBrandInputChange={setBrandInput}
            autoGenerate={router.query.autoGenerate === 'true'}
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

      {showIncognitoWarning && (
        <ConfirmModal
          modalSwitch={showIncognitoWarning}
          setModalSwitch={setShowIncognitoWarning}
          title="브라우저 설정 확인"
          func={() => {
            setShowIncognitoWarning(false);
            // Open in a new regular window
            window.open(window.location.href, '_blank');
          }}
          contents={
            "시크릿 모드에서는 쿠키가 차단되어 로그인이 유지되지 않습니다.\n일반 브라우저 창에서 이용해주세요."
          }
          buttonLabel="새 창에서 열기"
          disableCloseIcon={false}
          disableOutClick={false}
        />
      )}
    </Box>
  );
} 