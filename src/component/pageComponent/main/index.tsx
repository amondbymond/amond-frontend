import { BodyContainer } from "@/component/ui/BodyContainer";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
import { primaryColor } from "@/constant/styles/styleTheme";
import { default as Onboarding } from "./Onboarding";
import { useRouter } from "next/router";

export default function MainPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

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
          pt: { xs: "50px", md: "60px" },
          pb: { xs: "50px", md: "60px" },
          minHeight: { xs: "calc(100vh - 80px)", md: "calc(100vh - 110px)" },
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
              <StartSection setCurrentStep={setCurrentStep} />
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
    </div>
  );
}

function StartSection({
  setCurrentStep,
}: {
  setCurrentStep: (step: number) => void;
}) {
  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Box
        sx={{
          mx: "auto",
          width: { xs: "100%", md: "600px", lg2: "700px" },
          mb: { xs: "28px", md: "40px" },
          mt: { md: "24px" },
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
        fontSize={{ xs: 28, md: 48 }}
        lineHeight={1.3}
        fontWeight={700}
        align="center"
      >
        터지는 인스타 SNS 운영,
        <br />
        <span style={{ color: primaryColor }}>아몬드 하나면 끝.</span>
      </Typography>

      <Typography
        fontSize={{ xs: 16, md: 20 }}
        lineHeight={1.3}
        fontWeight={400}
        align="center"
        sx={{ mt: { xs: "18px", md: "24px" }, mb: { xs: "20px", md: "24px" } }}
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
        onClick={() => setCurrentStep(1)}
        sx={{
          fontSize: { xs: "16px", md: "18px" },
          width: { xs: "100%", md: "450px" },
          py: { xs: "7px", md: "8px" },
          mx: "auto",
        }}
      >
        지금 시작하기
      </Button>
    </Box>
  );
}
