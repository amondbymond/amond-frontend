import {
  CardMedia,
  InputAdornment,
  TextField,
  TextFieldProps,
} from "@mui/material";
import { useState, forwardRef } from "react";
import { withBasePath } from "@/utils/paths";

/** 비밀번호를 숨기기/가리기를 위한 TextField */
export const HidePasswordTextField = forwardRef<
  HTMLInputElement,
  TextFieldProps
>((props, ref) => {
  const [isHide, setIsHide] = useState(true);

  const changeHide = () => {
    setIsHide(!isHide);
  };

  return (
    <TextField
      fullWidth
      type={isHide ? "password" : ""}
      autoComplete="new-password"
      // TextField 컴포넌트로 전달받은 props를 그대로 전달합니다.
      {...props}
      // ref를 할당합니다.
      inputRef={ref}
      // password 가리기 부분
      inputProps={{ maxLength: 16 }}
      InputProps={{
        endAdornment: (
          <InputAdornment
            onClick={changeHide}
            position="end"
            sx={{ cursor: "pointer" }}
          >
            <CardMedia
              component="img"
              src={
                isHide
                  ? withBasePath("/assets/icon/eyeClose.svg")
                  : withBasePath("/assets/icon/eyeOpen.svg")
              }
              sx={{ width: "24px", height: "24px" }}
            />
          </InputAdornment>
        ),
      }}
    />
  );
});

HidePasswordTextField.displayName = "HidePasswordTextField";
export default HidePasswordTextField;
