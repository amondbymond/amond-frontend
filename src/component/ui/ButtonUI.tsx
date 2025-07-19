import { Button, SxProps } from "@mui/material";
import { RowStack } from "./BoxStack";

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
