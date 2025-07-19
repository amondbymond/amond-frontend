// import DatePicker from "react-datepicker";
// import { ko } from "date-fns/locale/ko";
// import { Box, Typography } from "@mui/material";
// import { RowStack } from "./BoxStack";

// export function DatePickerUI({
//   selectedDate,
//   onChangeDate,
//   needArrow,
//   ...props
// }: {
//   selectedDate: Date;
//   onChangeDate: Function;
//   needArrow?: boolean;
//   props?: any;
// }) {
//   // 이전, 다음 버튼 클릭시 하루씩 변경
//   const changeDateForDay = (arrow: "prev" | "next") => {
//     const date = new Date(selectedDate);
//     if (arrow === "prev") {
//       date.setDate(date.getDate() - 1);
//     } else {
//       date.setDate(date.getDate() + 1);
//     }
//     onChangeDate(date);
//   };

//   return (
//     <RowStack>
//       {needArrow && (
//         <RowStack
//           justifyContent="center"
//           onClick={() => changeDateForDay("prev")}
//           sx={{
//             cursor: "pointer",
//             border: "1px solid #C9C9C9",
//             borderRadius: "8px 0 0 8px",
//             height: "38px",
//             width: "32px",
//             mr: "-2px",
//           }}
//         >
//           <Typography>{"<"}</Typography>
//         </RowStack>
//       )}
//       <Box sx={{ width: "158px" }}>
//         <DatePicker
//           key={(selectedDate as any) || (selectedDate?.toISOString() as any)}
//           className={needArrow ? "DatePicker arrow" : "DatePicker"}
//           locale={ko}
//           selected={selectedDate}
//           onChange={(date) => onChangeDate(date)}
//           startDate={new Date()}
//           showYearDropdown
//           scrollableYearDropdown
//           maxDate={new Date("2099/01/01")}
//           dateFormat={"yyyy년 MM월 dd일(EE)"}
//           onChangeRaw={(e: any) => e.preventDefault()}
//           {...props}
//         />
//       </Box>

//       {needArrow && (
//         <RowStack
//           justifyContent="center"
//           onClick={() => changeDateForDay("next")}
//           sx={{
//             cursor: "pointer",
//             border: "1px solid #C9C9C9",
//             borderRadius: "0 8px 8px 0",
//             height: "38px",
//             width: "32px",
//             ml: "-2px",
//           }}
//         >
//           <Typography>{">"}</Typography>
//         </RowStack>
//       )}
//     </RowStack>
//   );
// }

// export function DateMonthPickerUI({
//   selectedDate,
//   onChangeDate,
//   ...props
// }: {
//   selectedDate: Date;
//   onChangeDate: Function;
//   props?: any;
// }) {
//   return (
//     <DatePicker
//       className="DatePicker"
//       locale={ko}
//       selected={selectedDate}
//       onChange={(date) => onChangeDate(date)}
//       showMonthYearPicker
//       dateFormat={"yyyy년 MM월"}
//       onChangeRaw={(e: any) => e.preventDefault()}
//       {...props}
//     />
//   );
// }
