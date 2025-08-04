import { BodyContainer } from "@/component/ui/BodyContainer";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useContext } from "react";
import { Box, Button, Typography } from "@mui/material";
import { primaryColor } from "@/constant/styles/styleTheme";
import { default as Onboarding } from "./Onboarding";
import { useRouter } from "next/router";
import LoginContext from "@/module/ContextAPI/LoginContext";
import { ConfirmModal } from "@/component/ui/Modal";

export default function MainPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();
  const { userInfo, isLoginCheck } = useContext(LoginContext);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // console.log("[MainPage] Auth state:", { userInfo, isLoginCheck });

  // Listen for custom event to reset to home
  useEffect(() => {
    const handleResetToHome = () => {
      setCurrentStep(0);
    };

    // Listen for custom event
    window.addEventListener('reset-to-home', handleResetToHome);

    return () => {
      window.removeEventListener('reset-to-home', handleResetToHome);
    };
  }, []);

  return (
    <div>
      <BodyContainer
        sx={{
          pt: { xs: "38px", md: "45px" },
          pb: { xs: "38px", md: "45px" },
          minHeight: { xs: "calc(100vh - 60px)", md: "calc(100vh - 83px)" },
        }}
      >
        <AnimatePresence mode="wait">
          {currentStep === 0 ? (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <StartSection 
                setCurrentStep={setCurrentStep} 
                userInfo={userInfo}
                setShowLoginModal={setShowLoginModal}
              />
            </motion.div>
          ) : (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Onboarding onComplete={() => setCurrentStep(0)} />
            </motion.div>
          )}
        </AnimatePresence>
      </BodyContainer>
      
      {showLoginModal && (
        <ConfirmModal
          modalSwitch={showLoginModal}
          setModalSwitch={setShowLoginModal}
          title="로그인이 필요합니다"
          func={() => {
            console.log("[MainPage] Redirecting to login");
            router.push("/login");
          }}
          contents={
            "콘텐츠 생성을 위해서는 로그인이 필요합니다.\n로그인 페이지로 이동하시겠습니까?"
          }
          buttonLabel="로그인하기"
          disableCloseIcon={true}
          disableOutClick={false}
        />
      )}
    </div>
  );
}

function StartSection({
  setCurrentStep,
  userInfo,
  setShowLoginModal,
}: {
  setCurrentStep: (step: number) => void;
  userInfo: any;
  setShowLoginModal: (show: boolean) => void;
}) {
  // console.log("[StartSection] userInfo:", userInfo);
  
  const handleStart = () => {
    if (!userInfo) {
      // console.log("[StartSection] No user info, showing login modal");
      setShowLoginModal(true);
    } else {
      // console.log("[StartSection] User logged in, proceeding to onboarding");
      setCurrentStep(1);
    }
  };
  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Box
        sx={{
          mx: "auto",
          width: { xs: "100%", md: "450px", lg2: "525px" },
          mb: { xs: "21px", md: "30px" },
          mt: { md: "18px" },
        }}
      >
        <video
          src="/assets/video/intro.mp4"
          playsInline
          muted
          autoPlay
          loop
          style={{ width: "100%", height: "auto", borderRadius: "20px" }}
        />
      </Box>

      <Typography
        variant="h1"
        fontSize={{ xs: 21, md: 36 }}
        lineHeight={1.3}
        fontWeight={700}
        align="center"
      >
        터지는 인스타 SNS 운영,
        <br />
        <span style={{ color: primaryColor }}>아몬드 하나면 끝.</span>
      </Typography>

      <Typography
        fontSize={{ xs: 12, md: 15 }}
        lineHeight={1.3}
        fontWeight={400}
        align="center"
        sx={{ mt: { xs: "14px", md: "18px" }, mb: { xs: "15px", md: "18px" } }}
      >
        팔로워 증가, 매출 증진, 상품 홍보까지.
        <br />
        <span style={{ color: primaryColor }}>SNS 성장을 위한 콘텐츠</span>가
        필요하신가요?
        <br />
        <br />
        아이디어가 없어도, 시간이 없어도 괜찮아요.
        <br />
        아몬드가
        <span style={{ color: primaryColor }}> 콘텐츠 제작</span>을 도와드려요.
      </Typography>

      <Button
        onClick={handleStart}
        sx={{
          fontSize: { xs: "12px", md: "14px" },
          width: { xs: "100%", md: "338px" },
          py: { xs: "5px", md: "6px" },
          mx: "auto",
        }}
      >
        지금 시작하기
      </Button>
    </Box>
  );
}
