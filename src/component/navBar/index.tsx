import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Box,
  Container,
  CardMedia,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import LoginContext from "@/module/ContextAPI/LoginContext";
import Link from "next/link";
import { RowStack } from "../ui/BoxStack";
import { useRouter } from "next/router";
import { BodyContainer } from "../ui/BodyContainer";
import { apiCall } from "@/module/utils/api";
import { primaryColor } from "@/constant/styles/styleTheme";
import { GrayContainedButton } from "../ui/styled/StyledButton";
import { Controller, FieldValues, useForm } from "react-hook-form";
import { passwordRegex } from "@/constant/commonVariable";
import { BaseModalBox } from "../ui/Modal";
import axios from "axios";
import HidePasswordTextField from "../ui/HidePassTextField";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PersonIcon from "@mui/icons-material/Person";
import UserSidebar from "../ui/UserSidebar";

export default function NavBar() {
  const router = useRouter();
  const { userInfo, setUserInfo } = useContext(LoginContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [passwordModal, setPasswordModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navBarHeight = { xs: "44px", md: "59px" };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // 로그아웃
  const logOut = async () => {
    try {
      await apiCall({
        url: "/auth/logout",
        method: "post",
      });
      setUserInfo(null);
      setSidebarOpen(false);
      router.push("/login");
    } catch (e) {
      alert(`로그아웃을 하는데 문제가 생겼습니다.\n${e}`);
    }
  };

  // 프로젝트 페이지로 이동
  const goToProjectPage = async () => {
    try {
      const response = await apiCall({
        url: "/content/project",
        method: "get",
      });
      if (response.data.projectId) {
        router.push(`/project/${response.data.projectId}`);
      } else {
        alert("프로젝트가 없습니다.");
      }
    } catch (e) {
      alert("프로젝트 이동 실패");
    }
  };

  return (
    <>
      <header>
        <nav>
          <Container
            maxWidth={false}
            sx={{
              backgroundColor: primaryColor,
              position: "fixed",
              zIndex: 1200,
              boxShadow: "0px 1px 2px 0px rgba(154, 255, 1, 0.12)",
              borderBottom: "0.5px solid #E1E1E1",
            }}
          >
            <BodyContainer sx={{ py: { xs: "10px", md: "10px" } }}>
              <RowStack
                justifyContent="space-between"
                sx={{ position: "relative" }}
              >
                <Box sx={{ width: { xs: "90px", md: "250px" } }} />

                {/* 로고 */}
                <Box sx={{ 
                  position: "absolute", 
                  left: "50%", 
                  transform: "translateX(-50%)",
                  zIndex: 1
                }}>
                  <Link href="/" onClick={(e) => {
                    // If we're already on the home page, dispatch custom event to reset onboarding
                    if (router.pathname === '/') {
                      e.preventDefault();
                      window.dispatchEvent(new Event('reset-to-home'));
                    }
                  }}>
                    <CardMedia
                      component="img"
                      image="/logoHorizontalWhite.png"
                      alt="company logo"
                      sx={{
                        width: { xs: "97.7px", md: "130px" },
                        height: { xs: "24px", md: "32px" },
                        cursor: "pointer",
                      }}
                    />
                  </Link>
                </Box>

                <Box sx={{ width: { xs: "90px", md: "350px" } }}>
                  <RowStack spacing="12px" justifyContent="flex-end">
                    {isMobile ? (
                      <>
                        <IconButton
                          size="large"
                          aria-label="account of current user"
                          aria-controls="menu-appbar"
                          aria-haspopup="true"
                          onClick={handleMenu}
                          color="inherit"
                          sx={{ p: 0 }}
                        >
                          <AccountCircleIcon
                            sx={{
                              color: "white",
                              fontSize: "24px",
                            }}
                          />
                        </IconButton>
                        <Menu
                          id="menu-appbar"
                          anchorEl={anchorEl}
                          anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "right",
                          }}
                          keepMounted
                          transformOrigin={{
                            vertical: "top",
                            horizontal: "right",
                          }}
                          open={Boolean(anchorEl)}
                          onClose={handleClose}
                          sx={{ px: "10px" }}
                        >
                          {userInfo?.id ? (
                            <>
                              <MenuItem
                                onClick={() => {
                                  goToProjectPage();
                                  handleClose();
                                }}
                                sx={{
                                  p: "0px 12px",
                                  fontSize: "14px",
                                  minHeight: "40px",
                                }}
                              >
                                내 캘린더
                              </MenuItem>
                              <MenuItem
                                onClick={() => {
                                  goToProjectPage();
                                  handleClose();
                                }}
                                sx={{
                                  p: "0px 12px",
                                  fontSize: "14px",
                                  minHeight: "40px",
                                }}
                              >
                                새 콘텐츠
                              </MenuItem>
                              <MenuItem
                                onClick={() => {
                                  router.push("/subscribe");
                                  handleClose();
                                }}
                                sx={{
                                  p: "0px 12px",
                                  fontSize: "14px",
                                  minHeight: "40px",
                                }}
                              >
                                구독 결제하기
                              </MenuItem>
                              <MenuItem
                                onClick={() => {
                                  window.open("https://sticky-partridge-ee9.notion.site/2172fde8bab680b1b776cb4244d60f9b", "_blank");
                                  handleClose();
                                }}
                                sx={{
                                  p: "0px 12px",
                                  fontSize: "14px",
                                  minHeight: "40px",
                                }}
                              >
                                이용약관
                              </MenuItem>
                              <MenuItem
                                onClick={() => {
                                  window.open("https://sticky-partridge-ee9.notion.site/2172fde8bab68036bd25f88124abaf02", "_blank");
                                  handleClose();
                                }}
                                sx={{
                                  p: "0px 12px",
                                  fontSize: "14px",
                                  minHeight: "40px",
                                }}
                              >
                                개인정보처리방침
                              </MenuItem>
                              <MenuItem
                                onClick={() => {
                                  setPasswordModal(true);
                                  handleClose();
                                }}
                                sx={{
                                  p: "0px 12px",
                                  fontSize: "14px",
                                  minHeight: "40px",
                                }}
                              >
                                비밀번호 변경
                              </MenuItem>
                              <MenuItem
                                onClick={() => {
                                  logOut();
                                  handleClose();
                                }}
                                sx={{
                                  p: "0px 12px",
                                  fontSize: "14px",
                                  minHeight: "40px",
                                }}
                              >
                                로그아웃
                              </MenuItem>
                            </>
                          ) : (
                            <>
                              <MenuItem
                                onClick={() => {
                                  router.push("/login");
                                  handleClose();
                                }}
                                sx={{
                                  p: "0px 12px",
                                  fontSize: "14px",
                                  minHeight: "40px",
                                }}
                              >
                                로그인
                              </MenuItem>
                              <MenuItem
                                onClick={() => {
                                  router.push("/login/register");
                                  handleClose();
                                }}
                                sx={{
                                  p: "0px 12px",
                                  fontSize: "14px",
                                  minHeight: "40px",
                                }}
                              >
                                회원가입
                              </MenuItem>
                            </>
                          )}
                        </Menu>
                      </>
                    ) : (
                      <>
                        {userInfo?.id ? (
                          <>
                            {/* Person Icon for Sidebar Toggle */}
                            <IconButton
                              onClick={toggleSidebar}
                              sx={{
                                color: "white",
                                border: "2px solid white",
                                ml: 1,
                                width: "40px",
                                height: "40px",
                                '&:hover': {
                                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                                },
                              }}
                            >
                              <PersonIcon sx={{ fontSize: "20px" }} />
                            </IconButton>
                          </>
                        ) : (
                          <>
                            <Link href="/login">
                              <Button
                                variant="contained"
                                color="primary"
                                sx={{
                                  border: "1px solid #FFF",
                                  "&:hover": {
                                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                                  },
                                }}
                              >
                                로그인
                              </Button>
                            </Link>
                            <Link href="/login/register">
                              <Button
                                variant="contained"
                                sx={{
                                  backgroundColor: "white",
                                  color: "primary.main",
                                  "&:hover": {
                                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                                  },
                                }}
                              >
                                회원가입
                              </Button>
                            </Link>
                          </>
                        )}
                      </>
                    )}
                  </RowStack>
                </Box>
              </RowStack>
            </BodyContainer>
          </Container>
        </nav>

        {/* navBar만큼 내리기 (fixed) */}
        <Box sx={{ height: navBarHeight }} />
      </header>

      {/* Toggleable UserSidebar */}
      {sidebarOpen && userInfo?.id && (
        <UserSidebar onClose={() => setSidebarOpen(false)} />
      )}

      {passwordModal && (
        <PasswordModal
          modalSwitch={passwordModal}
          setModalSwitch={setPasswordModal}
        />
      )}
    </>
  );
}

function PasswordModal({
  modalSwitch,
  setModalSwitch,
}: {
  modalSwitch: boolean;
  setModalSwitch: Function;
}) {
  const passWordList = [
    {
      label: "새 비밀번호",
      keyName: "password",
      placeholder: "변경할 비밀번호를 입력해주세요",
    },
    {
      label: "새 비밀번호 확인",
      keyName: "passwordCheck",
      placeholder: "변경할 비밀번호를 한 번 더 입력해주세요",
    },
  ];

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setError,
    clearErrors,
    reset,
    watch,
  } = useForm({
    mode: "onChange",
  });
  const password = useRef({});
  password.current = watch("password", "");

  // pass 유효성 이중 체크
  useEffect(() => {
    if (watch("password") && watch("passwordCheck")) {
      if (watch("password") === watch("passwordCheck")) {
        clearErrors("passwordCheck");
      } else {
        setError("passwordCheck", {
          type: "validate",
          message: "비밀번호가 일치하지 않습니다!",
        });
      }
    }
  }, [watch("password"), watch("passwordCheck")]);

  // 제출
  const onSubmit = async (data: FieldValues) => {
    const body = {
      ...data,
    };

    try {
      await apiCall({
        url: "/auth/changePassword",
        method: "put",
        body,
      });

      alert("비밀번호가 변경되었습니다.");
      setModalSwitch(false);
    } catch (e) {
      // 이메일 중복 시 에러
      if (
        axios.isAxiosError(e) &&
        e?.response?.data?.message?.includes("비밀번호")
      ) {
        setError("currentPassword", {
          type: "manual",
          message: e?.response?.data.message,
        });
      } else {
        alert(e);
      }
    }
  };

  return (
    <BaseModalBox
      modalSwitch={modalSwitch}
      setModalSwitch={setModalSwitch}
      sx={{ width: { xs: "320px", md: "400px" } }}
    >
      <Box sx={{ p: "20px" }}>
        <Typography align="center" fontSize={20} fontWeight={600}>
          비밀번호 변경
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          {passWordList.map(function (each) {
            return (
              <Box key={each.keyName} sx={{ mt: "20px" }}>
                <Typography fontSize={14} sx={{ mb: "4px" }}>
                  {each.label}
                </Typography>
                <Controller
                  name={each.keyName}
                  control={control}
                  defaultValue=""
                  rules={{
                    required: "필수 입력값입니다.",
                    pattern:
                      each.keyName === "password"
                        ? {
                            value: passwordRegex,
                            message:
                              "8~16자, 영문, 숫자, 특수문자를 사용해 주세요!",
                          }
                        : undefined,
                    validate:
                      each.keyName === "passwordCheck"
                        ? (value) =>
                            value === password.current ||
                            "비밀번호가 일치하지 않습니다"
                        : undefined,
                  }}
                  render={({ field }) => (
                    <HidePasswordTextField
                      placeholder={each.placeholder}
                      {...field}
                      error={!!errors[each.keyName]}
                      helperText={String(errors[each.keyName]?.message || "")}
                    />
                  )}
                />
              </Box>
            );
          })}

          <RowStack spacing="8px" sx={{ mt: "16px" }}>
            <GrayContainedButton
              fullWidth
              onClick={() => setModalSwitch(false)}
            >
              취소
            </GrayContainedButton>
            <Button fullWidth type="submit" disabled={!isValid}>
              확인
            </Button>
          </RowStack>
        </form>
      </Box>
    </BaseModalBox>
  );
}
