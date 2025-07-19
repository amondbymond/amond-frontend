import {
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
} from "@mui/material";
import StyledTableCell from "./styled/StyledTableCell";
import StyledTableRow from "./styled/StyledTableRow";

/** 데이터 테이블 */
export function TableDataList({
  headerDataList,
  currentField,
  currentOrder,
  setCurrentOrder,
  setCurrentField,
  children,
}: {
  headerDataList: {
    label: string;
    keyName: string;
    hasOrder: boolean;
    minWidth?: number;
  }[];
  currentField: string;
  currentOrder: { label: string; keyName: string };
  setCurrentOrder: (order: { label: string; keyName: string }) => void;
  setCurrentField: (field: string) => void;
  children: React.ReactNode;
}) {
  const selectField = (each: any) => {
    if (!each.hasOrder) {
      return;
    }

    // 현재 선택된 필드와 같은 필드를 선택했을 때
    if (currentField === each.keyName) {
      if (currentOrder.keyName === "DESC") {
        setCurrentOrder({ label: "▲", keyName: "ASC" });
      } else {
        // 순서 해제
        setCurrentField(headerDataList[0].keyName);
        setCurrentOrder({ label: "▼", keyName: "DESC" });
      }
      // 다른 필드를 선택했을 때
    } else {
      setCurrentField(each.keyName);
      setCurrentOrder({ label: "▼", keyName: "DESC" });
    }
  };

  return (
    <TableContainer
      component={Paper}
      sx={{
        maxHeight: { md: "610px", xl: "955px" },
      }}
    >
      <Table stickyHeader>
        <TableHead>
          <StyledTableRow sx={{ backgroundColor: "#6AB2D8 !important" }}>
            {headerDataList.map(function (each) {
              return (
                <StyledTableCell
                  key={each.label}
                  align="center"
                  onClick={() => selectField(each)}
                  sx={{
                    cursor: "pointer",
                    minWidth: each.minWidth,
                  }}
                >
                  {each.label}{" "}
                  {currentField === each.keyName && currentOrder.label}
                </StyledTableCell>
              );
            })}
          </StyledTableRow>
        </TableHead>

        <TableBody>{children}</TableBody>
      </Table>
    </TableContainer>
  );
}
