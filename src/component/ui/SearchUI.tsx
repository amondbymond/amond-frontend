import { Button, SxProps, TextField } from "@mui/material";
import { RowStack } from "./BoxStack";
import { DropDownWithObject } from "./DropDown";
import { ChangeEvent } from "react";

/** 드롭다운 및 인풋 검색 UI */
export function DropDownSearchUI({
  searchInput,
  setSearchInput,
  searchField,
  setSearchField,
  selectList,
  setRefreshSwitch,
  width,
  sx,
}: {
  searchInput: string;
  setSearchInput: Function;
  searchField: string;
  setSearchField: Function;
  selectList: { label: string; keyName: string }[];
  setRefreshSwitch: Function;
  width?: number | string;
  sx?: SxProps;
}) {
  const onChangeSearchInput = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const searchData = () => {
    setRefreshSwitch((prev: boolean) => !prev);
  };

  return (
    <RowStack spacing="6px" sx={{ ...sx }}>
      <DropDownWithObject
        value={searchField}
        selectList={selectList}
        onChange={(value) => setSearchField(value)}
        sx={{ width: width || "auto" }}
      />
      <TextField
        value={searchInput}
        onChange={onChangeSearchInput}
        sx={{ width: "150px" }}
        inputProps={{
          maxLength: 20,
          style: { padding: "8px 12px" },
        }}
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            searchData();
          }
        }}
      />
      <Button onClick={searchData} sx={{ height: "36px" }}>
        검색
      </Button>
    </RowStack>
  );
}
