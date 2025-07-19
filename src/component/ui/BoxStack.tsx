import { ReactNode } from "react";
import {
  Box,
  CircularProgress,
  Button,
  Stack,
  StackProps,
  SxProps,
} from "@mui/material";

type RowStackProps = StackProps & {
  children: ReactNode;
};

/** 자주 쓰는 가로 방향 및 세로 가운데 정렬 Stack */
export function RowStack({ children, ...props }: RowStackProps) {
  return (
    <Stack direction="row" alignItems="center" {...props}>
      {children}
    </Stack>
  );
}

/** 디바이더 */
export function Divider({ sx }: { sx?: SxProps }) {
  return (
    <Box
      sx={{ height: "1px", backgroundColor: "#DDDDDD", ...sx, mx: "auto" }}
    />
  );
}

/** 중앙 로딩 */
export function CenterProgress({ sx, size }: { sx?: SxProps; size?: number }) {
  return (
    <Stack
      justifyContent="center"
      alignItems="center"
      sx={{ py: "40px", ...sx }}
    >
      <CircularProgress size={size} />
    </Stack>
  );
}

/** 버튼 탭 */
export function ButtonTab({
  buttonList,
  currentTab,
  func,
  sx,
  buttonSx,
}: {
  buttonList: any[];
  currentTab: string;
  func: Function;
  sx?: SxProps;
  buttonSx?: SxProps;
}) {
  return (
    <RowStack sx={sx}>
      {buttonList.map((each, index) => (
        <Button
          key={each.keyName}
          variant={currentTab === each.keyName ? "contained" : "outlined"}
          onClick={() => func(each.keyName)}
          sx={{
            ...buttonSx,
            borderRadius:
              index === 0
                ? "8px 0 0 8px"
                : index === buttonList.length - 1
                ? "0 8px 8px 0"
                : "0",
          }}
        >
          {each.label}
        </Button>
      ))}
    </RowStack>
  );
}
