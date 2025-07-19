import React from "react";
import { alpha, FormControl, MenuItem, Select, SxProps } from "@mui/material";

/** 드롭 다운 컴포넌트
 * - selectList: { label: string, keyName: string }[] 목록을 담은 배열
 * - value: 선택된 keyName
 * - initialLabel: 초기에 표시할 라벨
 * - onChange: 선택 변경 이벤트 핸들러
 * - disabled: 선택 불가능한 경우를 위한 boolean
 * - sx: 스타일링을 위한 객체
 */
export function DropDownWithObject({
  selectList,
  value,
  initialLabel,
  onChange,
  disabled = false,
  sx,
}: {
  selectList: { label: string; keyName: string | number }[];
  value: string;
  initialLabel?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  sx?: SxProps;
}) {
  return (
    <FormControl
      disabled={disabled}
      sx={{
        backgroundColor: alpha("#FFF", 0.95),
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        minWidth: { xs: 100, md: 120 },
        borderRadius: "8px",
      }}
    >
      <Select
        value={value}
        displayEmpty // 초기 라벨이 보이도록
        onChange={(e) => onChange(e.target.value)}
        renderValue={(selected) =>
          selected ? (
            selectList.find((item) => item.keyName === selected)?.label
          ) : (
            <span style={{ color: "#C9C9C9" }}>{initialLabel}</span>
          )
        }
        MenuProps={{
          disableScrollLock: true,
          PaperProps: {
            sx: {
              maxHeight: "50vh",
            },
          },
        }}
        sx={{
          pr: "5px",
          height: { xs: 40, md: 48 },
          fontWeight: 500,
          ...sx,
        }}
      >
        {selectList.map(({ label, keyName }) => (
          <MenuItem key={keyName} value={keyName}>
            {label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

/** 드롭 다운 컴포넌트  - selectList => 목록을 담은 배열
 * 상위 컴포넌트에서 관리할 staet는 value, onChange에 주입 */
export function DropDownWithArr({
  selectList,
  value,
  initialLabel,
  onChange,
  disabled = false,
  addRender,
  sx,
}: {
  selectList: string[] | number[];
  value: string | number;
  initialLabel?: string;
  onChange: (value: string | number) => void;
  disabled?: boolean;
  addRender?: string;
  sx?: SxProps;
}) {
  return (
    <FormControl
      disabled={disabled}
      sx={{
        backgroundColor: alpha("#FFF", 0.95),
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        minWidth: { xs: 100, md: 120 },
        borderRadius: "8px",
        width: { xs: 1, md: "auto" },
      }}
    >
      <Select
        value={value}
        displayEmpty
        onChange={(e) => {
          onChange(e.target.value);
        }}
        renderValue={(selected) =>
          selected ? (
            `${selected}${addRender || ""}`
          ) : (
            <span style={{ color: "#C9C9C9" }}>{initialLabel}</span>
          )
        }
        MenuProps={{
          disableScrollLock: true,
          PaperProps: {
            sx: {
              maxHeight: "50vh",
            },
          },
        }}
        sx={{
          pr: "5px",
          height: { xs: 40, md: 48 },
          fontWeight: 500,
          ...sx,
        }}
      >
        {selectList.map(function (eachdata) {
          return (
            <MenuItem key={eachdata} value={eachdata}>
              {eachdata}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}
