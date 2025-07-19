import { styled } from "@mui/material/styles";
import TableRow from "@mui/material/TableRow";

/** 공통적으로 쓰고 있는 TableRow  */
export default styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },

  // hide last border
  // "&:last-child td, &:last-child th": {
  //   border: 0,
  // },
}));
