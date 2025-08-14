import {
  Box,
  Button,
  CardMedia,
  Checkbox,
  TextField,
  Typography,
} from "@mui/material";
import { FieldValues, useForm, Controller } from "react-hook-form";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { emailRegex, passwordRegex, url } from "@/constant/commonVariable";
import { useRouter } from "next/router";
import { BodyContainer } from "@/component/ui/BodyContainer";
import { UseApiCallWithLoading } from "@/module/customHook/useHook";
import { Divider, RowStack } from "@/component/ui/BoxStack";
import { ConfirmModal } from "@/component/ui/Modal";
import axios from "axios";
import HidePasswordTextField from "@/component/ui/HidePassTextField";
import Link from "next/link";
import { withBasePath } from "@/utils/paths";

type CheckInputKeyType =
  | "all"
  | "termsAgreement"
  // | "payAgreement"
  | "privacyAgreement";
// | "marketingAgreement";
type CheckInputListType = {
  label: string;
  keyName: CheckInputKeyType;
  link?: string;
};

export default function RegisterPage() {
  const router = useRouter();
  // 비밀번호 & 확인
  const passWordList = [
    {
      label: "비밀번호",
      keyName: "password",
      placeholder: "비밀번호를 입력해주세요",
    },
    {
      label: "비밀번호 확인",
      keyName: "passwordCheck",
      placeholder: "비밀번호를 한 번 더 입력해주세요",
    },
  ];

  // 약관
  const [checkInput, setCheckInput] = useState({
    all: false,
    termsAgreement: false,
    // payAgreement: false,
    privacyAgreement: false,
    // marketingAgreement: false,
  });

  const checkInputList: CheckInputListType[] = [
    { label: "전체 동의", keyName: "all" },
    {
      label: "(필수) 서비스 이용약관에 동의합니다.",
      keyName: "termsAgreement",
      link: "https://www.naver.com",
    },
    {
      label: "(필수) 개인정보 처리방침에 동의합니다.",
      keyName: "privacyAgreement",
      link: "https://www.naver.com",
    },
  ];

  const { isLoading, apiCallWithLoading } = UseApiCallWithLoading();
  const [registerSuccessModal, setRegisterSuccessModal] = useState(false); // 회원 가입 완료

  // react-hook-form 사용
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

  // 체크
  const handleCheck = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    if (name === "all") {
      setCheckInput({
        all: checked,
        termsAgreement: checked,
        // payAgreement: checked,
        privacyAgreement: checked,
        // marketingAgreement: checked,
      });
    } else {
      if (!checked && checkInput.all) {
        setCheckInput({
          ...checkInput,
          all: false,
          [name]: checked,
        });
      } else {
        setCheckInput({
          ...checkInput,
          [name]: checked,
        });
      }
    }
  };

  // 제출
  const onSubmit = async (data: FieldValues) => {
    if (!isLoading) {
      const body = {
        ...data,
        // marketingAgreement: checkInput.marketingAgreement,
      };

      try {
        await apiCallWithLoading({
          url: "/auth/register/email",
          method: "post",
          body,
        });
        // 정상 가입
        setRegisterSuccessModal(true);
      } catch (e) {
        // 이메일 중복 시 에러
        if (axios.isAxiosError(e)) {
          if (e?.response?.data.message.includes("이메일")) {
            setError("email", {
              type: "manual",
              message: e?.response?.data.message,
            });
          } else {
            alert(e?.response?.data.message);
          }
        } else {
          alert(e);
        }
      }
    }
  };

  const goToLogin = () => {
    // Clear any stored data that might cause issues
    sessionStorage.removeItem("prevRoute");
    router.push("/login");
  };

  const openLink = (link: string | undefined) => {
    window.open(link);
  };

  return (
    <section>
      <BodyContainer
        sx={{ pt: { xs: "80px", md: "40px" }, pb: { xs: "80px", md: "60px" } }}
      >
        <Box sx={{ maxWidth: "464px", mx: "auto" }}>
          <Typography
            align="center"
            fontSize={{ xs: 24, md: 30 }}
            fontWeight={700}
            sx={{ mb: "40px" }}
          >
            회원가입
          </Typography>

          {/* 아이디/PW 입력 부분 */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <Typography fontSize={14} sx={{ mb: "4px" }}>
              아이디
            </Typography>
            <Controller
              name="email"
              control={control}
              defaultValue=""
              rules={{
                required: "필수 입력값입니다.",
                pattern: {
                  value: emailRegex,
                  message: "올바른 이메일 양식이 아닙니다.",
                },
              }}
              render={({ field }) => (
                <TextField
                  fullWidth
                  autoComplete="username"
                  placeholder="이메일을 입력해주세요"
                  {...field}
                  error={!!errors.email}
                  helperText={String(errors.email?.message || "")}
                  inputProps={{ maxLength: 40 }}
                />
              )}
            />

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

            <Divider sx={{ my: "30px" }} />

            {/* 이용 약관 체크 박스 */}
            {checkInputList.map(function (each) {
              return (
                <RowStack key={each.keyName} spacing="8px" sx={{ mb: "8px" }}>
                  <Checkbox
                    name={each.keyName}
                    checked={checkInput[each.keyName]}
                    onChange={handleCheck}
                  />
                  <RowStack spacing="6px">
                    <Typography
                      fontSize={14}
                      fontWeight={each.keyName === "all" ? 600 : 400}
                    >
                      {each.label}
                    </Typography>

                    {each.link && (
                      <Typography
                        onClick={() => openLink(each.link)}
                        fontSize={12}
                        fontWeight={500}
                        color="#999999"
                        sx={{ cursor: "pointer" }}
                      >
                        <u>보기</u>
                      </Typography>
                    )}
                  </RowStack>
                </RowStack>
              );
            })}

            <Button
              type="submit"
              fullWidth
              disabled={
                !isValid ||
                !checkInput.privacyAgreement ||
                // !checkInput.payAgreement ||
                !checkInput.termsAgreement
              }
              sx={{ mt: "16px", height: "40px" }}
            >
              회원가입
            </Button>
          </form>

          <Divider sx={{ mt: "30px" }} />

          <Link className="btnHover" href={`${url}/auth/login/kakao`}>
            <Button
              sx={{
                width: 1,
                height: "48px",
                color: "#3A2929",
                backgroundColor: "#FEE500",
                fontSize: "16px",
                mt: "32px",
                mb: "8px",
              }}
            >
              <CardMedia
                component="img"
                alt="kakao icon"
                src={withBasePath("/assets/icon/kakaoLogin.png")}
                sx={{
                  width: "20px",
                  height: "20px",
                  mr: "8px",
                }}
              />
              카카오 계정으로 시작하기
            </Button>
          </Link>

          <Link className="btnHover" href={`${url}/auth/login/google`}>
            <Button
              sx={{
                width: 1,
                height: "48px",
                backgroundColor: "#FFF",
                color: "#333",
                border: "1px solid #C9C9C9",
                fontSize: "16px",
              }}
            >
              <CardMedia
                component="img"
                alt="google icon"
                src={withBasePath("/assets/icon/googleLogin.png")}
                sx={{
                  width: "20px",
                  height: "20px",
                  mr: "8px",
                }}
              />
              구글 계정으로 시작하기
            </Button>
          </Link>
        </Box>
      </BodyContainer>

      {registerSuccessModal && (
        <ConfirmModal
          modalSwitch={registerSuccessModal}
          setModalSwitch={setRegisterSuccessModal}
          title="회원 가입 완료"
          contents="회원가입이 정상적으로 완료되었습니다!"
          buttonLabel="로그인 하기"
          func={goToLogin}
          disableCloseIcon
          disableOutClick
        />
      )}
    </section>
  );
}
