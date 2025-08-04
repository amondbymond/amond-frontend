import { createTheme } from "@mui/material/styles";
import { scale } from "./scaleConfig";

export const primaryColor = "#FF8000";
export const secondaryColor = "#F5C921";

export const secondaryRed100 = "#F96B99";
export const secondaryRed200 = "#F54381";
export const secondaryRed300 = "#F32169";
export const secondaryRed400 = "#E01073";
export const secondaryRed500 = "#C90C64";
export const secondaryRed600 = "#B00A58";
export const secondaryRed700 = "#99084C";
export const secondaryRed800 = "#820640";

export const primaryGray25 = "#F8F8F8";
export const primaryGray50 = "#F2F2F2";
export const primaryGray100 = "#E6E6E6";
export const primaryGray200 = "#CCCCCC";
export const primaryGray300 = "#B3B3B3";
export const primaryGray400 = "#999999";
export const primaryGray500 = "#808080";
export const primaryGray600 = "#666666";
export const primaryGray700 = "#4D4D4D";
export const primaryGray800 = "#333333";
export const primaryGray900 = "#1A1A1A";

// lg 최대 너비 (scaled down)
export const maxWidth = 1080; // 1440 * 0.75

// 공통으로 사용되는 px 값 (scaled down)
export const xsPx = scale(16); // 12px
export const mdPx = scale(20); // 15px

// 공통으로 사용되는 borderRadius 값 (scaled down)
export const commonBorderRadius = scale(10); // 7.5px → 8px

// 공통으로 사용되는 textField padding 값 (scaled down)
export const textFieldPadding = scale(12); // 9px

// 기본 Breakpoints 타입을 확장 시
declare module "@mui/material/styles" {
  interface BreakpointOverrides {
    xs: true;
    sm: true;
    md: true;
    lg: true;
    xl: true;
    lg2: true; // 새로운 breakpoint 추가
  }
}

// MUI 전체 테마
export const muiTheme = createTheme({
  palette: {
    primary: {
      main: primaryColor,
    },
    secondary: {
      main: secondaryColor,
    },
  },
  spacing: (factor: number) => `${0.75 * 8 * factor}px`, // Default spacing * 0.75
  breakpoints: {
    values: {
      xs: 10,
      sm: 440,
      md: 768,
      lg: maxWidth, // 기준 사이즈
      lg2: 1600,
      xl: 3000,
    },
  },
  typography: {
    button: {
      textTransform: "none", // 텍스트 대문자 방지
    },
    fontFamily: [
      "Pretendard",
      "-apple-system",
      "BlinkMacSystemFont",
      "Segoe UI",
      "system-ui",
      "Roboto",
      "Helvetica Neue",
      "Arial",
      "sans-serif",
      "Apple Color Emoji",
      "Segoe UI Emoji",
      "Segoe UI Symbol",
    ].join(","),
    // Scale all typography variants
    h1: { fontSize: scale(96) },
    h2: { fontSize: scale(60) },
    h3: { fontSize: scale(48) },
    h4: { fontSize: scale(34) },
    h5: { fontSize: scale(24) },
    h6: { fontSize: scale(20) },
    subtitle1: { fontSize: scale(16) },
    subtitle2: { fontSize: scale(14) },
    body1: { fontSize: scale(16) },
    body2: { fontSize: scale(14) },
    caption: { fontSize: scale(12) },
    overline: { fontSize: scale(10) },
  },
  components: {
    MuiButton: {
      defaultProps: {
        variant: "contained",
        disableElevation: true,
        style: {
          fontFamily: [
            "Pretendard",
            "-apple-system",
            "BlinkMacSystemFont",
            "Segoe UI",
            "system-ui",
            "Roboto",
            "Helvetica Neue",
            "Arial",
            "sans-serif",
            "Apple Color Emoji",
            "Segoe UI Emoji",
            "Segoe UI Symbol",
          ].join(","),
        },
      },
      styleOverrides: {
        root: ({ theme }) => ({
          fontSize: scale(14), // 10.5px
          paddingTop: scale(6),
          paddingBottom: scale(6),
          paddingLeft: scale(16),
          paddingRight: scale(16),
          [theme.breakpoints.up("lg")]: {
            fontSize: scale(16), // 12px
            paddingTop: scale(8),
            paddingBottom: scale(8),
            paddingLeft: scale(20),
            paddingRight: scale(20),
          },
          [theme.breakpoints.up("xl")]: {
            fontSize: scale(18), // 13.5px
            paddingTop: scale(10),
            paddingBottom: scale(10),
            paddingLeft: scale(24),
            paddingRight: scale(24),
          },
        }),

        // contained 평소 상태
        containedPrimary: {
          color: "#FFF",
          borderRadius: commonBorderRadius,
          fontWeight: 600,
        },
        // outlined hover 상태
        outlinedPrimary: {
          borderRadius: commonBorderRadius,
          fontWeight: 600,
          // disabled가 아닌 hover의 경우
          "&:not(.Mui-disabled):hover": {
            backgroundColor: primaryColor,
            color: "#FFF",
            border: "none",
          },
        },
        // contained disabled 상태
        contained: {
          "&.Mui-disabled": {
            opacity: 0.3,
            backgroundColor: primaryColor,
            color: "#FFF",
            cursor: "not-allowed",
            pointerEvents: "auto", // cursor not-allowed를 위한
          },
        },
        // outlined disabled 상태
        outlined: {
          "&.Mui-disabled": {
            opacity: 0.3,
            borderColor: primaryColor,
            color: primaryColor,
            cursor: "not-allowed",
            pointerEvents: "auto",
          },
        },
      },
    },
    // 텍스트 필드
    MuiTextField: {
      styleOverrides: {
        root: ({ theme }) => ({
          "& .MuiInputBase-input": {
            fontSize: "14px", // 기본값
            padding: "12px", // xs에서의 기본 padding
            [theme.breakpoints.up("lg")]: {
              fontSize: "14px", // lg 이상일 때
              padding: textFieldPadding,
            },
            [theme.breakpoints.up("xl")]: {
              fontSize: "16px", // lg 이상에서 폰트 크기
              padding: textFieldPadding,
            },
          },

          // multiline textarea 외부 div 패딩 제거
          "& .MuiInputBase-multiline": {
            padding: "0 !important",
          },

          // multiline textarea 스타일
          "& .MuiInputBase-inputMultiline": {
            padding: "14px !important",
            [theme.breakpoints.up("lg")]: {
              padding: "16px !important",
            },
          },

          // 텍스트 필드 테두리
          "& fieldset": {
            borderWidth: "1px !important",
            borderColor: "#DDDDDD", // 기본 테두리 색상
          },
          "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
            {
              WebkitAppearance: "none",
              margin: 0,
            },
          "& input[type=number]": {
            MozAppearance: "textfield",
          },
        }),
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          marginLeft: "0px", // helperText 위치를 왼쪽으로 10px 이동
        },
      },
    },
    MuiContainer: {
      defaultProps: {
        disableGutters: true, // Container의 기본 padding 제거
      },
    },
    MuiTypography: {
      defaultProps: {
        color: "#333333", // 텍스트 기본색상
        style: {
          wordBreak: "keep-all", // 단어 단위 줄바꿈
          whiteSpace: "pre-wrap",
        },
      },
      styleOverrides: {
        root: ({ theme }) => ({
          fontSize: "14px", // 기본 폰트 크기
          [theme.breakpoints.up("lg")]: {
            fontSize: "16px", // lg 이상에서 폰트 크기
          },
          [theme.breakpoints.up("xl")]: {
            fontSize: "18px", // lg 이상에서 폰트 크기
          },
        }),
      },
    },
    MuiCheckbox: {
      defaultProps: {
        style: {
          padding: 0,
        },
      },
      styleOverrides: {
        root: {
          // 체크 박스 색상
          color: "#C1C1C1",
          "&:hover": {
            "& .MuiSvgIcon-root": {
              color: primaryColor, // 호버 시 테두리 (svg 색상)
            },
          },
          "&&:hover": {
            backgroundColor: "transparent", // 호버 시 기본 오버레이 제거
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          fontSize: "14px", // 여러 줄 text area의 폰트 사이즈도 변경할 수 있는
          padding: 0,
        },
        root: {
          borderRadius: `${commonBorderRadius} !important`,
        },
      },
    },
    MuiOutlinedInput: {
      // TextField 관련 설정
      styleOverrides: {
        root: {
          "&:hover .MuiOutlinedInput-notchedOutline": {
            // borderColor: primaryGray700, // Textfield 호버 시
          },
          // focused state
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: primaryColor, //  Textfield 포커스 시
          },
          "&.Mui-error .MuiOutlinedInput-notchedOutline": {
            borderColor: "red", // Textfield 에러 시
          },
          "&.Mui-disabled": {
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#444444", // Textfield의 disabled 일 때의 테두리 색상
            },
          },
        },
      },
    },
  },
});
