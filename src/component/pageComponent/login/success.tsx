import { BodyContainer } from "@/component/ui/BodyContainer";
import { CenterProgress } from "@/component/ui/BoxStack";
import { apiCall, handleAPIError } from "@/module/utils/api";
import { useRouter } from "next/router";
import { useEffect, useContext } from "react";
import LoginContext from "@/module/ContextAPI/LoginContext";

export default function LoginSuccessPage() {
  const router = useRouter();
  const { setUserInfo } = useContext(LoginContext);

  useEffect(() => {
    const goToPreviousPage = async () => {
      // Check for session token in URL (for OAuth incognito mode support)
      const urlParams = new URLSearchParams(window.location.search);
      const sessionToken = urlParams.get('sessionToken');
      const returnTo = urlParams.get('returnTo');
      
      if (sessionToken) {
        // Store session token for incognito mode
        localStorage.setItem("amondSessionToken", sessionToken);
        console.log("OAuth session token stored for incognito mode");
        
        // Fetch user info with the new session token
        try {
          const loginCheckResponse = await apiCall({
            url: "/auth/loginCheck",
            method: "get",
          });
          
          if (loginCheckResponse.data.id) {
            // Try to get full user data
            try {
              const userResponse = await apiCall({
                url: "/auth/user",
                method: "get",
              });
              setUserInfo(userResponse.data);
            } catch (userError) {
              // Fallback to basic data if user endpoint fails
              setUserInfo(loginCheckResponse.data);
            }
          }
        } catch (e) {
          console.error("Failed to fetch user info after OAuth login:", e);
        }
      }
      
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
            // Redirect to the project page after successful connection
            router.push(`/project/${projectId}`);
            return;
          }
        } catch (e) {
          // Error handling for password change
        }
      }

      let prevRoute = sessionStorage.getItem("prevRoute");
      
      if (returnTo && returnTo.startsWith('/project/')) {
        router.push(returnTo);
      } else if (prevRoute === "/login" || prevRoute === "/login/success") {
        router.push("/");
      } else {
        router.push(prevRoute || "/");
      }
    };

    goToPreviousPage();
  }, []);

  return (
    <BodyContainer sx={{ pt: "30px" }}>
      <CenterProgress />
    </BodyContainer>
  );
}
