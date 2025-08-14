import ProjectLayout from "@/component/ui/ProjectLayout";
import { Box, Typography, Button } from "@mui/material";
import Head from "next/head";
import { useRouter } from "next/router";
import Image from "next/image";
import { withBasePath } from "@/utils/paths";

export default function ProjectIndexPage() {
  const router = useRouter();

  const handleCreateBrand = () => {
    router.push("/");
  };

  return (
    <>
      <Head>
        <title>내 컨텐츠 - amond</title>
        <meta
          name="description"
          content="주제별 트렌드에 딱 맞는 터지는 콘텐츠 기획을 쉽고 간편하게 시작해보세요!"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href={withBasePath("/favicon.ico")} />
      </Head>
      <main>
        <ProjectLayout>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100vh",
              p: 4,
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                bgcolor: "#f5f5f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 3,
              }}
            >
              <Image
                src={withBasePath("/assets/icon/instaFeed.svg")}
                alt="Empty state"
                width={60}
                height={60}
                style={{ opacity: 0.5 }}
              />
            </Box>
            
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: "#333",
                mb: 1,
              }}
            >
              생성된 피드가 없습니다
            </Typography>
            
            <Typography
              variant="body2"
              sx={{
                color: "#666",
                mb: 3,
                maxWidth: 400,
              }}
            >
              브랜드를 생성하고 AI가 자동으로 만들어주는
              <br />
              인스타그램 콘텐츠를 경험해보세요
            </Typography>
            
            <Button
              variant="contained"
              onClick={handleCreateBrand}
              sx={{
                bgcolor: "#FFA726",
                color: "#fff",
                fontWeight: 600,
                px: 4,
                py: 1.5,
                fontSize: 16,
                "&:hover": {
                  bgcolor: "#FF9800",
                },
              }}
            >
              브랜드 생성하기
            </Button>
          </Box>
        </ProjectLayout>
      </main>
    </>
  );
}