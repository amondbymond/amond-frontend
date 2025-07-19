import {
  primaryGray300,
  primaryGray400,
  secondaryRed400,
  secondaryRed500,
} from "@/constant/styles/styleTheme";
import { Button } from "@mui/material";
import { styled } from "@mui/system";

/** 레드 버튼 Contained */
export const RedContainedButton = styled(Button)(() => ({
  backgroundColor: secondaryRed400,
  ":hover": {
    backgroundColor: secondaryRed500,
  },
  "&.Mui-disabled": {
    backgroundColor: secondaryRed400,
  },
  height: "36px",
  fontSize: "14px",
}));

/** 레드 버튼 Outlined */
export const RedOutlinedButton = styled(Button)(() => ({
  border: `1px solid ${secondaryRed400}`,
  backgroundColor: "transparent",
  color: secondaryRed400,
  ":hover": {
    backgroundColor: secondaryRed400,
    color: "#FFF",
    border: "none",
  },
  height: "36px",
  fontSize: "14px",
}));

/** 회색 버튼 */
export const GrayContainedButton = styled(Button)(() => ({
  backgroundColor: primaryGray300,
  ":hover": {
    backgroundColor: `${primaryGray400} !important`,
  },
  "&.Mui-disabled": {
    backgroundColor: primaryGray300,
  },
  height: "36px",
  fontSize: "14px",
}));

/** 회색 버튼 Outlined */
export const GrayOutlinedButton = styled(Button)(() => ({
  border: `1px solid ${primaryGray300}`,
  backgroundColor: "transparent",
  color: primaryGray300,
  ":hover": {
    backgroundColor: `${primaryGray400} !important`,
    color: "#FFF",
    border: "none",
  },
  height: "36px",
  fontSize: "14px",
}));

/** 화이트 버튼 Outlined */
export const WhiteOutlinedButton = styled(Button)(() => ({
  border: `1px solid #FFF`,
  backgroundColor: "transparent",
  color: "#FFF",
  ":hover": {
    backgroundColor: "#FFF",
    color: "#191919",
    border: "none",
  },
}));
