import { Box } from "@mui/material";
import { styled } from "@mui/system";

/** 중앙 박스(모달 등) */
export const CenterBox = styled(Box)(() => ({
  left: "50%",
  top: "50%",
  transform: "translate(-50%, -50%)",
  overflowY: "auto",
  maxWidth: "768px",
}));
