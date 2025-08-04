import { useContext, useState } from "react";
import { Box, Button, Typography, Divider, IconButton, Fade } from "@mui/material";
import LoginContext from "@/module/ContextAPI/LoginContext";
import { useRouter } from "next/router";
import { apiCall } from "@/module/utils/api";
import CloseIcon from "@mui/icons-material/Close";
import ContactMakerModal from "./ContactMakerModal";

const TERMS_URL = "https://sticky-partridge-ee9.notion.site/2172fde8bab680b1b776cb4244d60f9b";
const PRIV_URL= "https://sticky-partridge-ee9.notion.site/2172fde8bab68036bd25f88124abaf02"

interface UserSidebarProps {
  onClose: () => void;
}

export default function UserSidebar({ onClose }: UserSidebarProps) {
  const { userInfo, setUserInfo } = useContext(LoginContext);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  // Handle guest users - show sidebar even without userInfo
  const isGuest = !userInfo?.id;
  
  // Use available fields from UserDataType or guest defaults
  const displayName = isGuest ? "게스트 사용자" : (userInfo.name || userInfo.authType || "회원");
  const displayUsername = isGuest ? "@guest" : (userInfo.email || `@user_${userInfo.id}`);

  const handleLogout = async () => {
    try {
      await apiCall({
        url: "/auth/logout",
        method: "post",
      });
    } catch (e) {
      console.error("Logout error:", e);
    }
    setUserInfo(null);
    localStorage.removeItem("amondSessionToken"); // Clear session token
    router.push("/login");
  };

  const goToProjectPage = async () => {
    // Always go to /project page
    router.push("/project");
  };

  return (
    <Fade in={true} timeout={300}>
      <Box
        sx={{
          position: "fixed",
          top: 75,
          right: 45,
          width: 210,
          bgcolor: "#fff",
          borderRadius: 3,
          boxShadow: 3,
          p: 2.25,
          display: { xs: "none", md: "block" },
          zIndex: 1200,
          transition: "all 0.3s ease-in-out",
        }}
      >
        {/* Close Button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 6,
            right: 6,
            color: "grey.500",
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* User Info */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              bgcolor: "#FFA726",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mr: 2,
            }}
          >
            <Typography fontSize={24} color="#fff">
              {/* User icon (simple) */}
              <span role="img" aria-label="user">👤</span>
            </Typography>
          </Box>
          <Box>
            <Typography fontWeight={700} fontSize={13.5}>{displayName}</Typography>
            <Typography color="grey.600" fontSize={10.5}>{displayUsername}</Typography>
          </Box>
        </Box>

        {/* Navigation Buttons - Only show for logged in users */}
        {!isGuest && (
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              color="warning"
              fullWidth
              sx={{ fontWeight: 700, borderRadius: 2 }}
              onClick={goToProjectPage}
              disabled={loading}
            >
              내 컨텐츠 보기
            </Button>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Links and Actions */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {!isGuest && (
            <Button
              variant="text"
              sx={{ justifyContent: "flex-start", color: "#333", fontWeight: 600 }}
              onClick={() => router.push("/profile")}
              disabled={loading}
            >
              프로필
            </Button>
          )}
          <Button
            variant="text"
            sx={{ justifyContent: "flex-start", color: "#333" }}
            onClick={() => router.push("/subscribe")}
            disabled={loading}
          >
            구독 결제하기
          </Button>
          <Button
            variant="text"
            sx={{ justifyContent: "flex-start", color: "#333" }}
            onClick={() => window.open(TERMS_URL, "_blank")}
          >
            이용약관
          </Button>
          <Button
            variant="text"
            sx={{ justifyContent: "flex-start", color: "#333" }}
            onClick={() => window.open(PRIV_URL, "_blank")}
          >
            개인정보처리방침
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Contact Maker Button */}
        <Button
          variant="text"
          fullWidth
          sx={{ fontWeight: 700, color: "#222", mb: 1, fontSize: 13.5 }}
          onClick={() => setContactModalOpen(true)}
        >
          제작자에게 문의하기
        </Button>

        {isGuest ? (
          <Button
            variant="contained"
            color="warning"
            fullWidth
            sx={{ fontWeight: 700 }}
            onClick={() => router.push("/login")}
          >
            로그인하기
          </Button>
        ) : (
          <Button
            variant="text"
            color="error"
            fullWidth
            sx={{ fontWeight: 700 }}
            onClick={handleLogout}
          >
            로그아웃
          </Button>
        )}
        <ContactMakerModal open={contactModalOpen} onClose={() => setContactModalOpen(false)} />
      </Box>
    </Fade>
  );
} 