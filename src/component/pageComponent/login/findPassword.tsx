import { Box, Button, TextField, Typography } from "@mui/material";
import { FieldValues, useForm, Controller } from "react-hook-form";
import { emailRegex, url } from "@/constant/commonVariable";
import { UseApiCallWithLoading } from "@/module/customHook/useHook";
import axios from "axios";
import { useRouter } from "next/router";
import { BodyContainer } from "@/component/ui/BodyContainer";
import { useState } from "react";
import { ConfirmModal, LoadingModal } from "@/component/ui/Modal";

export default function FindPasswordPage() {
  const router = useRouter();

  // 로그인 인풋 리스트
  const inputList = [
    {
      label: "아이디",
      keyName: "email",
      placeholder: "이메일을 입력해주세요",
    },
  ];

  const { isLoading, apiCallWithLoading } = UseApiCallWithLoading();

  const [confirmModal, setConfirmModal] = useState(false);

  // react-hook-form 사용
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setError,
  } = useForm({
    mode: "onChange",
  });

  const onSubmit = async (data: FieldValues) => {
    if (!isLoading) {
      const body = { ...data };
      try {
        await apiCallWithLoading({
          url: "/auth/findPassword",
          method: "post",
          body,
        });
        setConfirmModal(true);
      } catch (e) {
        if (axios.isAxiosError(e)) {
          if (e?.response?.data?.message.includes("이메일")) {
            setError("email", {
              type: "manual",
              message: e?.response?.data?.message,
            });
          } else if (e?.response?.data?.message.includes("계정")) {
            setError("email", {
              type: "manual",
              message: e?.response?.data?.message,
            });
          } else {
            alert(e);
          }
        } else {
          alert(e);
        }
      }
    }
  };

  const goToLogin = () => {
    router.push("/login");
  };

  return (
    <section>
      <BodyContainer
        sx={{
          pt: { xs: "80px", md: "40px" },
          pb: { xs: "80px", md: "160px" },
        }}
      >
        <Box sx={{ maxWidth: "464px", mx: "auto" }}>
          <Typography
            align="center"
            fontSize={{ xs: 24, md: 30 }}
            fontWeight={700}
            sx={{ mb: "40px" }}
          >
            비밀번호 찾기
          </Typography>

          {/* 아이디/PW 입력 부분 */}
          <form onSubmit={handleSubmit(onSubmit)}>
            {inputList.map(function (each) {
              return (
                <Box key={each.label} sx={{ mt: "20px" }}>
                  <Typography fontSize={14} sx={{ mb: "4px" }}>
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
                    render={({ field }) => (
                      <TextField
                        fullWidth
                        autoComplete="username"
                        {...field}
                        placeholder={each.placeholder}
                        error={!!errors[each.keyName]}
                        helperText={String(errors[each.keyName]?.message || "")}
                        inputProps={{ maxLength: 40 }}
                      />
                    )}
                  />
                </Box>
              );
            })}

            <Button
              type="submit"
              fullWidth
              disabled={!isValid}
              sx={{ fontSize: "16px", py: "10px", mt: "12px" }}
            >
              확인
            </Button>
          </form>
        </Box>

        {/* 확인 모달 */}
        {confirmModal && (
          <ConfirmModal
            modalSwitch={confirmModal}
            setModalSwitch={setConfirmModal}
            title="임시 비밀번호 발송"
            contents={
              "임시 비밀번호가 메일로 발송되었습니다\n로그인 후 비밀번호를 변경해주세요!"
            }
            func={goToLogin}
            disableCloseIcon
            disableOutClick
          />
        )}

        {isLoading && (
          <LoadingModal modalSwitch={isLoading} setModalSwitch={() => {}} />
        )}
      </BodyContainer>
    </section>
  );
}
