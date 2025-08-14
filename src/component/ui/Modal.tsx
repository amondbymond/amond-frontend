import {
  Box,
  Button,
  CardMedia,
  CircularProgress,
  Modal,
  Stack,
  SxProps,
  Typography,
} from "@mui/material";
import { MouseEventHandler, ReactNode } from "react";
import { RemoveScroll } from "react-remove-scroll";
import { CenterProgress, RowStack } from "./BoxStack";
import {
  GrayContainedButton,
  RedContainedButton,
  RedOutlinedButton,
} from "./styled/StyledButton";
import { CenterBox } from "./styled/StyledBox";
import { TitleSub22 } from "./styled/StyledTypography";
import { withBasePath } from "@/utils/paths";
import { primaryColor } from "@/constant/styles/styleTheme";

/* 모달 기본 **/
export function BaseModalBox({
  modalSwitch,
  setModalSwitch,
  children,
  width = { xs: "240px", md: "338px" },
  disableOutClick,
  sx,
}: {
  modalSwitch: boolean;
  setModalSwitch: Function;
  children: ReactNode;
  width?: number | string | { xs: string; md: string };
  disableOutClick?: boolean;
  sx?: SxProps;
}) {
  const modalClose = (event: React.SyntheticEvent, reason: string) => {
    if (disableOutClick && reason === "backdropClick") {
      // 모달 외부를 클릭했을 때 닫히지 않도록 함
      return;
    }
    setModalSwitch(false);
  };

  return (
    <Modal open={modalSwitch} onClose={modalClose} disableScrollLock>
      <RemoveScroll enabled={modalSwitch}>
        <CenterBox
          sx={{
            width: width,
            position: "absolute",
            boxShadow: "4px 4px 38px rgba(0, 0, 0, 0.1)",
            backgroundColor: "#FFF",
            borderRadius: "9px",
            outline: "none",
            ...sx,
            zIndex: 10000,
            maxHeight: "90vh",
          }}
        >
          {children}
        </CenterBox>
      </RemoveScroll>
    </Modal>
  );
}

/* 모달 기본(제목) **/
export function BaseModalBoxWithTitle({
  modalSwitch,
  setModalSwitch,
  title,
  children,
  func,
  width = 240,
  disabledCloseButton,
  disableOutClick,
  deleteFunc,
  sx,
}: {
  modalSwitch: boolean;
  setModalSwitch: Function;
  title: string;
  children: ReactNode;
  func?: any;
  width?: number | string;
  disabledCloseButton?: boolean;
  disableOutClick?: boolean;
  deleteFunc?: any | null;
  sx?: SxProps;
}) {
  const closeModal = () => {
    setModalSwitch(false);
  };

  return (
    <BaseModalBox
      modalSwitch={modalSwitch}
      setModalSwitch={setModalSwitch}
      width={width}
      disableOutClick={disableOutClick}
      sx={{ ...sx }}
    >
      <Box sx={{ p: { xs: "16px", md: "24px" } }}>
        <Stack direction="column" justifyContent="space-between">
          <Box>
            <TitleSub22 align="center" sx={{ mb: "20px" }}>
              {title}
            </TitleSub22>
            {children}
          </Box>

          <RowStack spacing="6px" sx={{ mt: { xs: "12px", md: "16px" } }}>
            <Button onClick={func ? func : closeModal} fullWidth>
              확인
            </Button>
            {deleteFunc && (
              <RedOutlinedButton onClick={deleteFunc} fullWidth>
                삭제
              </RedOutlinedButton>
            )}
            {!disabledCloseButton && (
              <GrayContainedButton onClick={closeModal} fullWidth>
                취소
              </GrayContainedButton>
            )}
          </RowStack>
        </Stack>
      </Box>
    </BaseModalBox>
  );
}

/* 로딩 모달 **/
export function LoadingModal({
  modalSwitch,
  setModalSwitch,
  contents,
}: {
  modalSwitch: boolean;
  setModalSwitch: Function;
  contents?: string;
}) {
  return (
    <BaseModalBox
      modalSwitch={modalSwitch}
      setModalSwitch={setModalSwitch}
      disableOutClick
    >
      <Box sx={{ px: "24px", pt: "20px", pb: "20px" }}>
        <Typography
          align="center"
          fontSize={20}
          fontWeight={600}
          sx={{ mb: "10px" }}
        >
          {contents ?? "잠시만 기다려주세요"}
        </Typography>
        <CenterProgress size={40} sx={{ pt: "10px", pb: "10px" }} />
      </Box>
    </BaseModalBox>
  );
}

/* 삭제 확인 모달 **/
export function DeleteConfirmModal({
  modalSwitch,
  setModalSwitch,
  func,
}: {
  modalSwitch: boolean;
  setModalSwitch: Function;
  func?: MouseEventHandler<HTMLButtonElement>;
}) {
  const modalClose = () => {
    setModalSwitch(false);
  };

  return (
    <BaseModalBox modalSwitch={modalSwitch} setModalSwitch={setModalSwitch}>
      <Box sx={{ px: "24px", pt: "20px", pb: "20px" }}>
        <Typography
          align="center"
          fontSize={20}
          fontWeight={600}
          sx={{ mb: "10px", pr: "10px" }}
        >
          삭제 확인
        </Typography>
        <Typography sx={{ mb: "12px" }}>
          정말 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다.
        </Typography>

        <RowStack spacing="6px">
          <GrayContainedButton
            fullWidth
            onClick={modalClose}
            sx={{ height: "32px" }}
          >
            취소
          </GrayContainedButton>
          <RedContainedButton fullWidth onClick={func} sx={{ height: "32px" }}>
            삭제
          </RedContainedButton>
        </RowStack>
      </Box>
    </BaseModalBox>
  );
}

/* 일반적인 확인 모달 **/
export function ConfirmModal({
  modalSwitch,
  setModalSwitch,
  title,
  contents,
  buttonLabel = "확인",
  addCancel = false,
  disableCloseIcon = false,
  disableOutClick = false,
  func,
}: {
  modalSwitch: boolean;
  setModalSwitch: React.Dispatch<React.SetStateAction<boolean>>;
  title: string;
  contents: string;
  buttonLabel?: string;
  addCancel?: boolean;
  disableCloseIcon?: boolean;
  disableOutClick?: boolean;
  func?: Function;
}) {
  const modalClose = () => setModalSwitch(false);

  const buttonFunction = () => {
    if (func) {
      func();
    } else {
      modalClose();
    }
  };

  return (
    <div>
      <BaseModalBox
        modalSwitch={modalSwitch}
        setModalSwitch={setModalSwitch}
        disableOutClick={disableOutClick}
        sx={{ p: "24px", width: { xs: "320px", md: "360px" } }}
      >
        <Stack justifyContent="space-between" height={1}>
          <Box>
            <RowStack justifyContent="space-between">
              <Typography fontWeight={600} fontSize={{ xs: 16, md: 18 }}>
                {title}
              </Typography>

              <CardMedia
                component="img"
                onClick={modalClose}
                src={withBasePath("/assets/icon/close.svg")}
                alt="close"
                width={24}
                height={24}
                sx={{ display: disableCloseIcon ? "none" : "block" }}
              />
            </RowStack>

            <Typography color="#666666" fontSize={14} sx={{ mt: "6px" }}>
              {contents}
            </Typography>
          </Box>

          <RowStack sx={{ mt: "20px" }} spacing="8px">
            <Button fullWidth onClick={buttonFunction}>
              {buttonLabel}
            </Button>

            {addCancel && (
              <GrayContainedButton onClick={modalClose} fullWidth>
                취소
              </GrayContainedButton>
            )}
          </RowStack>
        </Stack>
      </BaseModalBox>
    </div>
  );
}

/* 로딩 모달 **/
export function LoadingModalWithVideo({
  modalSwitch,
  setModalSwitch,
}: {
  modalSwitch: boolean;
  setModalSwitch: Function;
}) {
  return (
    <BaseModalBox
      modalSwitch={modalSwitch}
      setModalSwitch={setModalSwitch}
      disableOutClick
      sx={{ width: { xs: "330px", md: "500px" } }}
    >
      <Box
        sx={{
          p: { xs: "24px 18px", md: "32px" },
          backgroundColor: "#FFF8F1",
        }}
      >
        <video
          src={withBasePath("/assets/video/loading.mp4")}
          autoPlay
          loop
          muted
          style={{ width: "100%", height: "auto", borderRadius: "20px" }}
        />
        <RowStack
          justifyContent="center"
          spacing="8px"
          sx={{ mt: { xs: "12px", md: "16px" } }}
        >
          <Typography
            color={primaryColor}
            fontSize={{ xs: "24px", md: "32px" }}
            fontWeight={700}
            align="center"
          >
            Loading...
          </Typography>
          <CircularProgress size={20} />
        </RowStack>

        <Typography align="center" sx={{ mt: { xs: "6px", md: "8px" } }}>
          {"지금 아몬드가 콘텐츠 플래닝을 만들고 있어요!\n조금만 기다려주세요!"}
        </Typography>
      </Box>
    </BaseModalBox>
  );
}
