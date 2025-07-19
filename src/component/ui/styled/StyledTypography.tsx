import { Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

/** 타이틀 타이포 */
export const TitleTypo40 = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  textAlign: "center",
  [theme.breakpoints.down("md")]: {
    fontSize: "24px", // xs 화면 크기에 대한 폰트 크기
  },
  [theme.breakpoints.up("md")]: {
    fontSize: "40px",
  },
}));

/** 타이틀 타이포 */
export const TitleTypo28 = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  [theme.breakpoints.down("md")]: {
    fontSize: "20px", // xs 화면 크기에 대한 폰트 크기
  },
  [theme.breakpoints.up("md")]: {
    fontSize: "28px",
  },
}));

/** 타이틀 타이포 */
export const TitleSub22 = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  [theme.breakpoints.down("md")]: {
    fontSize: "18px", // xs 화면 크기에 대한 폰트 크기
  },
  [theme.breakpoints.up("md")]: {
    fontSize: "22px",
  },
}));

/** 타이틀 타이포 */
export const TitleSub18 = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  [theme.breakpoints.down("md")]: {
    fontSize: "16px", // xs 화면 크기에 대한 폰트 크기
  },
  [theme.breakpoints.up("md")]: {
    fontSize: "18px",
  },
}));
