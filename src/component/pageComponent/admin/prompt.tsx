import { RowStack } from "@/component/ui/BoxStack";
import { BaseModalBoxWithTitle } from "@/component/ui/Modal";
import { TableDataList } from "@/component/ui/DataList";
import StyledTableCell from "@/component/ui/styled/StyledTableCell";
import StyledTableRow from "@/component/ui/styled/StyledTableRow";
import { onChangeTextField } from "@/module/utils/commonFunction";
import { Box, Button, TextField, Typography } from "@mui/material";
import { ChangeEvent, useEffect, useState } from "react";
import { AdminBodyContainerWithTitle } from "@/component/ui/BodyContainer";
import { TitleSub18 } from "@/component/ui/styled/StyledTypography";
import { apiCall, handleAPIError } from "@/module/utils/api";

export default function AdminProgramPage() {
  // 테이블 헤더 데이터
  const headerDataList = [
    { label: "No", keyName: "id", hasOrder: false },
    { label: "프롬프트", keyName: "name", hasOrder: false },
    { label: "내용", keyName: "prompt", hasOrder: false },
    { label: "필수 요소", keyName: "required", hasOrder: false },
    { label: "수정", keyName: "edit", hasOrder: false },
  ];

  const [promptData, setPromptData] = useState<any[] | null>(null);

  const [editPromptModal, setEditPromptModal] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<any | null>(null);
  const [refreshSwitch, setRefreshSwitch] = useState(false);

  useEffect(() => {
    const getPromptData = async () => {
      try {
        const response = await apiCall({
          method: "get",
          url: "/admin/prompt/getList",
        });
        setPromptData(response.data);
      } catch (error) {
        handleAPIError(error, "프롬프트 목록");
      }
    };
    getPromptData();
  }, [refreshSwitch]);

  const openEditPromptModal = (prompt: any) => {
    setSelectedPrompt(prompt);
    setEditPromptModal(true);
  };

  return (
    <AdminBodyContainerWithTitle currentKeyName="prompt">
      <RowStack justifyContent="space-between" sx={{ mb: "12px" }}>
        <TitleSub18>프롬프트 목록</TitleSub18>
      </RowStack>

      <Box>
        {promptData && promptData.length !== 0 ? (
          <TableDataList
            headerDataList={headerDataList}
            currentField={"id"}
            currentOrder={{ label: "▼", keyName: "DESC" }}
            setCurrentField={() => {}}
            setCurrentOrder={() => {}}
          >
            {promptData.map(function (each: any, index) {
              return (
                <StyledTableRow key={each.id}>
                  <StyledTableCell sx={{ minWidth: "45px" }}>
                    {index + 1}
                  </StyledTableCell>
                  <StyledTableCell sx={{ width: "100px" }}>
                    {each.name}
                  </StyledTableCell>
                  <StyledTableCell
                    sx={{
                      whiteSpace: "pre-wrap",
                      textAlign: "left",
                      pl: "30px !important",
                    }}
                  >
                    {each.prompt}
                  </StyledTableCell>
                  <StyledTableCell sx={{ width: "200px" }}>
                    {each.required}
                  </StyledTableCell>
                  <StyledTableCell>
                    <Button
                      variant="outlined"
                      onClick={() => openEditPromptModal(each)}
                    >
                      수정
                    </Button>
                  </StyledTableCell>
                </StyledTableRow>
              );
            })}
          </TableDataList>
        ) : (
          <Typography>데이터가 존재하지 않습니다</Typography>
        )}
      </Box>

      {editPromptModal && selectedPrompt && (
        <EditPromptModal
          modalSwitch={editPromptModal}
          setModalSwitch={setEditPromptModal}
          setRefreshSwitch={setRefreshSwitch}
          selectedPrompt={selectedPrompt}
        />
      )}
    </AdminBodyContainerWithTitle>
  );
}

function EditPromptModal({
  modalSwitch,
  setModalSwitch,
  setRefreshSwitch,
  selectedPrompt,
}: {
  modalSwitch: boolean;
  setModalSwitch: Function;
  setRefreshSwitch: Function;
  selectedPrompt: any;
}) {
  const [promptInput, setPromptInput] = useState(
    selectedPrompt || {
      prompt: "",
    }
  );

  const saveProgram = async () => {
    try {
      if (promptInput.name === "") {
        alert("프로그램명을 입력해주세요.");
        return;
      } else if (promptInput.prompt === "") {
        alert("프롬프트를 입력해주세요.");
        return;
      }

      if (selectedPrompt.required) {
        const requiredElements = selectedPrompt.required.split(",");
        const missingElements = requiredElements.filter(
          (element: string) => !promptInput.prompt.includes(element.trim())
        );
        if (missingElements.length > 0) {
          alert(
            `프롬프트에 다음 필수 요소가 포함되어 있지 않습니다:\n${missingElements.join(
              ", "
            )}`
          );
          return;
        }
      }

      await apiCall({
        method: "put",
        url: `/admin/prompt/${selectedPrompt.id}`,
        body: { ...promptInput },
      });
      alert("정상적으로 저장되었습니다.");
      setRefreshSwitch((prev: boolean) => !prev);
      setModalSwitch(false);
    } catch (error) {
      handleAPIError(error, "프로그램 수정");
    }
  };

  return (
    <BaseModalBoxWithTitle
      title="프롬프트 수정"
      modalSwitch={modalSwitch}
      setModalSwitch={setModalSwitch}
      width={1000}
      func={saveProgram}
    >
      <Typography fontWeight={500} sx={{ mb: "4px" }}>
        - 선택한 프롬프트 : {selectedPrompt.name}
      </Typography>

      <Typography fontWeight={500} sx={{ mb: "4px", mt: "12px" }}>
        - 프롬프트 내용 수정
      </Typography>

      <TextField
        fullWidth
        name="prompt"
        value={promptInput.prompt}
        multiline
        rows={7}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          onChangeTextField(e, promptInput, setPromptInput, false)
        }
        inputProps={{
          maxLength: 3000,
        }}
      />

      {selectedPrompt.required && (
        <Typography fontWeight={500} sx={{ mt: "12px" }}>
          *필수 요소 : {selectedPrompt.required}
        </Typography>
      )}
    </BaseModalBoxWithTitle>
  );
}
