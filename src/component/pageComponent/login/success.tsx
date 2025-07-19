import { BodyContainer } from "@/component/ui/BodyContainer";
import { CenterProgress } from "@/component/ui/BoxStack";
import { apiCall, handleAPIError } from "@/module/utils/api";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function LoginSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const goToPreviousPage = async () => {
      // 약 1초 대기
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 로컬 스토리지에 projectId 로드
      const projectId = localStorage.getItem("amondProjectId");
      if (projectId) {
        try {
          const response = await apiCall({
            url: "/content/project/newUser",
            method: "put",
            body: { 
              projectId,
              imageCount: 4, // Generate 4 images as required
            },
          });

          if (response.data.message === "프로젝트 연결 성공") {
            localStorage.removeItem("amondProjectId");
          }
        } catch (e) {
          // Error handling for password change
        }
      }

      let prevRoute = sessionStorage.getItem("prevRoute");
      if (prevRoute === "/login" || prevRoute === "/login/success") {
        prevRoute = "/";
      }

      router.push(prevRoute || "/");
    };

    goToPreviousPage();
  }, []);

  return (
    <BodyContainer sx={{ pt: "30px" }}>
      <CenterProgress />
    </BodyContainer>
  );
}
