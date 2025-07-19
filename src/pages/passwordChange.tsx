import { Box, Button, Typography } from "@mui/material";
import { useForm, Controller, FieldValues } from "react-hook-form";
import { useRef, useEffect } from "react";
import { passwordRegex } from "@/constant/commonVariable";
import HidePasswordTextField from "@/component/ui/HidePassTextField";
import { apiCall } from "@/module/utils/api";
import axios from "axios";
import { useRouter } from "next/router";

export default function PasswordChangePage() {
  const passWordList = [
    {
      label: "현재 비밀번호",
      keyName: "currentPassword",
      placeholder: "현재 비밀번호를 입력해주세요",
    },
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

  const router = useRouter();
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

  const onSubmit = async (data: FieldValues) => {
    const body = { ...data };
    try {
      await apiCall({
        url: "/auth/changePassword",
        method: "put",
        body,
      });
      alert("비밀번호가 변경되었습니다.");
      router.push("/");
    } catch (e) {
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
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 8, mb: 8, p: 3, bgcolor: "#fff", borderRadius: 3, boxShadow: 2 }}>
      <Typography align="center" fontSize={24} fontWeight={700} mb={4}>
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
                  ...(each.keyName === "password" || each.keyName === "currentPassword"
                    ? {
                        pattern: {
                          value: passwordRegex,
                          message: "8~16자, 영문, 숫자, 특수문자를 사용해 주세요!",
                        },
                      }
                    : {}),
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
        <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
          <Button fullWidth variant="outlined" onClick={() => router.back()}>
            취소
          </Button>
          <Button fullWidth type="submit" variant="contained" disabled={!isValid}>
            확인
          </Button>
        </Box>
      </form>
    </Box>
  );
} 