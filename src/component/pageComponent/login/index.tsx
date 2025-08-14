import {
  Box,
  Button,
  CardMedia,
  Checkbox,
  TextField,
  Typography,
} from "@mui/material";
import { FieldValues, useForm, Controller } from "react-hook-form";
import { useContext, useEffect, useState } from "react";
import LoginContext from "@/module/ContextAPI/LoginContext";
import { emailRegex, url } from "@/constant/commonVariable";
import { UseApiCallWithLoading } from "@/module/customHook/useHook";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import { BodyContainer } from "@/component/ui/BodyContainer";
import { Divider, RowStack } from "@/component/ui/BoxStack";
import { primaryColor } from "@/constant/styles/styleTheme";
import HidePasswordTextField from "@/component/ui/HidePassTextField";
import { withBasePath } from "@/utils/paths";
import { apiCall, handleAPIError } from "@/module/utils/api";

export default function LoginPage() {
  const router = useRouter();
  const { returnTo } = router.query;

  // 로그인 인풋 리스트
  const inputList = [
    {
      label: "아이디",
      keyName: "email",
      placeholder: "이메일을 입력해주세요",
      needHide: false,
    },
    {
      label: "비밀번호",
      keyName: "password",
      placeholder: "비밀번호를 입력해주세요",
      needHide: true,
    },
  ];

  const { userInfo, setUserInfo } = useContext(LoginContext);
  const [autoLogin, setAutoLogin] = useState(false);
  const { isLoading, apiCallWithLoading } = UseApiCallWithLoading();

  // 검사 결과 이동 모달
  const [goToResultNotiModal, setGoToResultNotiModal] = useState(false);

  // 로그인 상태일 경우, 로그인 페이지로 이동 방지
  useEffect(() => {
    if (router.pathname === "/login" && userInfo && !goToResultNotiModal) {
      router.push("/");
    }
  }, [userInfo, router.pathname]);

  // react-hook-form 사용
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    setError,
    clearErrors,
    watch,
  } = useForm({
    mode: "onChange",
  });

  const checkAutoLogin = () => {
    setAutoLogin((state) => !state);
  };

  const onSubmit = async (data: FieldValues) => {
    if (!isLoading) {
      const body = { ...data, autoLogin };
      try {
        const res = await apiCallWithLoading({
          url: "/auth/login/email",
          method: "post",
          body,
        });

        // Store session token for incognito mode support
        if (res.data.sessionToken) {
          localStorage.setItem("amondSessionToken", res.data.sessionToken);
          console.log("Session token stored for incognito mode");
        }
        
        setUserInfo(res.data);

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
              // Redirect directly to the project page
              router.push(`/project/${projectId}`);
              return;
            }
          } catch (e) {
            handleAPIError(e, "프로젝트 연결 실패");
          }
        }

        // Check if we have a returnTo parameter
        if (returnTo && typeof returnTo === 'string') {
          router.push(returnTo);
        } else {
          // 그 외의 경우 다른 페이지로 이동
          const prevRoute = sessionStorage.getItem("prevRoute");
          if (prevRoute === "/login/register" || prevRoute === "/login") {
            router.push("/");
          } else {
            router.push(prevRoute || "/");
          }
        }
      } catch (e) {
        if (axios.isAxiosError(e)) {
          const errorMessage = e?.response?.data?.message || e?.response?.data || '';
          if (typeof errorMessage === 'string') {
            if (errorMessage.includes("이메일")) {
              setError("email", {
                type: "manual",
                message: "이메일을 확인해주세요!",
              });
            } else if (errorMessage.includes("비밀번호")) {
              setError("password", {
                type: "manual",
                message: "비밀번호가 올바르지 않습니다!",
              });
            } else {
              alert(errorMessage);
            }
          } else {
            alert("로그인 중 오류가 발생했습니다.");
          }
        } else {
          alert("로그인 중 오류가 발생했습니다.");
        }
      }
    }
  };

  return (
    <section>
      <BodyContainer
        sx={{ pt: { xs: "60px", md: "30px" }, pb: { xs: "60px", md: "45px" } }}
      >
        <Box sx={{ maxWidth: "348px", mx: "auto" }}>
          <Typography
            align="center"
            fontSize={{ xs: 18, md: 23 }}
            fontWeight={700}
            sx={{ mb: "30px" }}
          >
            로그인
          </Typography>

          {/* 아이디/PW 입력 부분 */}
          <form onSubmit={handleSubmit(onSubmit)}>
            {inputList.map(function (each) {
              return (
                <Box key={each.label} sx={{ mt: "15px" }}>
                  <Typography fontSize={10.5} sx={{ mb: "3px" }}>
                    {each.label}
                  </Typography>

                  <Controller
                    control={control}
                    name={each.keyName}
                    defaultValue=""
                    rules={{
                      required: "필수 입력값입니다",
                      pattern:
                        each.keyName === "email"
                          ? {
                              value: emailRegex,
                              message: "유효한 이메일 형식이 아닙니다",
                            }
                          : undefined,
                    }}
                    // 일반 TextField와 PassField
                    render={({ field }) =>
                      each.needHide ? (
                        <HidePasswordTextField
                          {...field}
                          placeholder={each.placeholder}
                          error={!!errors[each.keyName]}
                          helperText={String(
                            errors[each.keyName]?.message || ""
                          )}
                        />
                      ) : (
                        <TextField
                          fullWidth
                          autoComplete="username"
                          {...field}
                          placeholder={each.placeholder}
                          error={!!errors[each.keyName]}
                          helperText={String(
                            errors[each.keyName]?.message || ""
                          )}
                          inputProps={{ maxLength: 40 }}
                        />
                      )
                    }
                  />
                </Box>
              );
            })}

            {/* 자동로그인, 비밀번호 찾기 */}
            <RowStack
              justifyContent="space-between"
              sx={{ mt: "6px", mb: "23px" }}
            >
              <RowStack spacing="4px">
                <Checkbox
                  value={autoLogin}
                  onChange={checkAutoLogin}
                  checked={autoLogin}
                />
                <Typography fontSize={{ xs: 9, md: 10 }}>
                  자동로그인
                </Typography>
              </RowStack>
              <Link href="/login/findPassword">
                <Typography fontSize={{ xs: 9, md: 10 }}>
                  비밀번호 찾기
                </Typography>
              </Link>
            </RowStack>

            <Button
              type="submit"
              fullWidth
              disabled={!isValid || isLoading}
              sx={{
                height: "30px",
              }}
            >
              로그인
            </Button>
          </form>

          <Divider sx={{ my: "21px" }} />

          <RowStack spacing="6px" justifyContent="center">
            <Typography align="center" color="#666">
              아직 아몬드 회원이 아니신가요?
            </Typography>
            <Link href="/login/register">
              <Typography align="center" color={primaryColor} fontWeight={600}>
                회원가입
              </Typography>
            </Link>
          </RowStack>

          <Link className="btnHover" href={`${url}/auth/login/kakao${returnTo ? `?returnTo=${encodeURIComponent(returnTo as string)}` : ''}`}>
            <Button
              sx={{
                width: 1,
                height: "36px",
                color: "#3A2929",
                backgroundColor: "#FEE500",
                fontSize: "12px",
                mt: "24px",
                mb: "6px",
              }}
            >
              <CardMedia
                component="img"
                alt="kakao icon"
                src={withBasePath("/assets/icon/kakaoLogin.png")}
                sx={{
                  width: "15px",
                  height: "15px",
                  mr: "6px",
                }}
              />
              카카오 계정으로 시작하기
            </Button>
          </Link>

          <Link className="btnHover" href={`${url}/auth/login/google${returnTo ? `?returnTo=${encodeURIComponent(returnTo as string)}` : ''}`}>
            <Button
              sx={{
                width: 1,
                height: "36px",
                backgroundColor: "#FFF",
                color: "#333",
                border: "1px solid #C9C9C9",
                fontSize: "12px",
              }}
            >
              <CardMedia
                component="img"
                alt="google icon"
                src={withBasePath("/assets/icon/googleLogin.png")}
                sx={{
                  width: "15px",
                  height: "15px",
                  mr: "6px",
                }}
              />
              구글 계정으로 시작하기
            </Button>
          </Link>
        </Box>
      </BodyContainer>
    </section>
  );
}
