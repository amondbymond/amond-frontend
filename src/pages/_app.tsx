import "@/constant/styles/globals.css";
import "@/constant/styles/pagination.css";
import "@/constant/styles/variables.css";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { Container, ThemeProvider } from "@mui/material";
import type { AppProps } from "next/app";
import { muiTheme } from "@/constant/styles/styleTheme";
import { LoginProvider } from "@/module/ContextAPI/LoginContext";
import NavBar from "@/component/navBar";
import Footer from "@/component/footer";
import { UseMainHook } from "@/module/customHook/useHook";
import FloatingKakaoButton from "@/component/ui/FloatingKakaoButton";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={muiTheme}>
      <LoginProvider>
        <AppInner Component={Component} pageProps={pageProps} />
      </LoginProvider>
    </ThemeProvider>
  );
}

function AppInner({
  Component,
  pageProps,
}: {
  Component: any;
  pageProps: any;
}) {
  UseMainHook();
  const router = useRouter();
  
  // Check if we're on a project page
  const isProjectPage = router.pathname.startsWith('/project/[projectId]');

  return (
    // 배경 설정
    <Container maxWidth={false} sx={{ p: isProjectPage ? 0 : undefined }}>
      <NavBar />
      <main>
        <Component {...pageProps} />
      </main>
      {!isProjectPage && <Footer />}
      {!isProjectPage && <FloatingKakaoButton />}
    </Container>
  );
}
