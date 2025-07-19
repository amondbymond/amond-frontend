import { primaryColor } from "@/constant/styles/styleTheme";
import {
  Box,
  Button,
  Chip,
  Grid,
  Switch,
  TextField,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
} from "@mui/material";
import MUISlider from "@mui/material/Slider";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useState } from "react";
import { RowStack } from "@/component/ui/BoxStack";

export default function ContentsInputSection({
  content,
  onChange,
  isReversed,
}: {
  content: {
    trendIssueToggle: boolean;
    snsEventToggle: boolean;
    essentialKeywordToggle: boolean;
    competitorToggle: boolean;
    trendIssue: string;
    snsEvent: string;
    essentialKeyword: string;
    competitor: string;
    uploadCycle: string;
    toneMannerList: string[];
    imageRatio: string;
    directionList: string[];
  };
  onChange: (content: any) => void;
  isReversed: boolean;
}) {
  const [accordionOpen, setAccordionOpen] = useState(false);

  const switchList = [
    {
      label: "트렌드 이슈 포함",
      key: "trendIssue",
      toggleKey: "trendIssueToggle",
      helper:
        "대선, 날씨, 유행 등 실시간 업데이트되는 시장 흐름을 콘텐츠에 반영하고 고객의 관심을 이끌어보세요.",
      placeholder: "예: 최신 트렌드 키워드",
      maxLength: 45,
    },
    {
      label: "SNS 이벤트 포함",
      key: "snsEvent",
      toggleKey: "snsEventToggle",
      helper: "팔로워를 찐팬으로 만드는 SNS 이벤트를 콘텐츠에 포함해보세요.",
      placeholder: "예: 인스타그램 팔로우 이벤트",
      maxLength: 45,
    },
    {
      label: "필수 키워드 포함",
      key: "essentialKeyword",
      toggleKey: "essentialKeywordToggle",
      helper:
        "문구에 꼭 들어갈 핵심 키워드를 2개 이상 작성해주세요. 반점(,)을 통해 2개 이상의 키워드를 작성할 수 있습니다.",
      placeholder: "예: 브랜드명, 해시태그 등",
      maxLength: 45,
    },
  ];

  const accordionSwitchList = [
    {
      label: "경쟁사 분석 반영",
      key: "competitor",
      toggleKey: "competitorToggle",
      helper:
        "경쟁사 등, 연관 산업에서 반응이 좋았던 콘텐츠 형식을 제안드려요!",
      placeholder:
        "경쟁사 등, 연관 산업에서 반응이 좋았던 콘텐츠 형식을 제안드려요!",
      maxLength: 250,
    },
  ];

  const toneList = [
    "신뢰감 있는",
    "친근/다정한",
    "위트 있는",
    "대화하는 어조",
    "고급스러운",
  ];
  const uploadList = ["주 1회", "주 2회", "주 3회"];
  const ratioList = ["1:1", "4:5", "9:16"];
  const directionList = ["정보형", "감성전달형", "홍보중심형"];

  const handleSwitchChange = (key: string, value: boolean) => {
    const newValue =
      key === "essentialKeywordToggle"
        ? content[key.replace("Toggle", "") as keyof typeof content]
        : value
        ? key === "competitorToggle"
          ? "반영"
          : "포함"
        : key === "competitorToggle"
        ? "미반영"
        : "미포함";
    onChange({
      ...content,
      [key]: value,
      [key.replace("Toggle", "") as keyof typeof content]: newValue,
    });
  };

  const handleUploadChange = (value: string) => {
    onChange({
      ...content,
      uploadCycle: value,
    });
  };

  const handleToneChange = (value: string[]) => {
    if (value.length > 3) {
      alert("최대 3개까지만 선택 가능합니다.");
      return;
    }
    onChange({
      ...content,
      toneMannerList: value,
    });
  };

  const handleRatioChange = (value: string) => {
    onChange({
      ...content,
      imageRatio: value,
    });
  };



  const handleDirectionChange = (value: string[]) => {
    onChange({
      ...content,
      directionList: value,
    });
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 2.5 },
        borderRadius: 2,
        border: "1px solid",
        borderColor: "grey.200",
        mb: { xs: 2, md: 3 },
      }}
    >
      <RowStack
        justifyContent="space-between"
        onClick={() => setAccordionOpen(!accordionOpen)}
        mb={2}
        sx={{ cursor: "pointer" }}
      >
        <Typography fontWeight={600} fontSize={{ xs: 16, md: 18 }}>
          콘텐츠 스타일 설정
        </Typography>

        <ExpandMoreIcon
          sx={{
            color: "rgba(0, 0, 0, 0.54)",
            fontSize: 24,
            // 회전 애니메이션
            transition: "transform 0.15s ease-in-out",
            transform: accordionOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </RowStack>
      {switchList.map(
        ({ label, key, toggleKey, helper, placeholder, maxLength }) => (
          <Box key={key} display="flex" flexDirection="column" mb={1}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography fontWeight={600}>{label}</Typography>
              <Switch
                checked={content[toggleKey as keyof typeof content] as boolean}
                onChange={(e) =>
                  handleSwitchChange(toggleKey, e.target.checked)
                }
              />
            </Box>

            {isReversed && (
              <Typography
                color={primaryColor}
                fontSize={{ xs: 13, md: 14 }}
                sx={{ mt: -0.3, mb: 0.5, opacity: 0.7 }}
              >
                {helper}
              </Typography>
            )}

            {/* 필수 키워드에 대해서는 TextField 유지 */}
            {key === "essentialKeyword" &&
              content[toggleKey as keyof typeof content] && (
                <Box>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder={placeholder}
                    sx={{ mb: 0.5 }}
                    value={content[key as keyof typeof content] as string}
                    onChange={(e) => {
                      if (e.target.value.length <= maxLength) {
                        onChange({
                          ...content,
                          [key]: e.target.value,
                        });
                      }
                    }}
                    inputProps={{
                      maxLength: maxLength,
                    }}
                  />
                </Box>
              )}
          </Box>
        )
      )}

      <Accordion
        expanded={accordionOpen}
        onChange={() => setAccordionOpen(!accordionOpen)}
        sx={{
          mt: "0px !important",
          py: 0,
          borderRadius: 0,
          borderColor: "grey.200",
          boxShadow: "none",
          "&:before": { display: "none" },
        }}
      >
        <AccordionSummary
          // expandIcon={<ExpandMoreIcon />}
          sx={{
            px: 0,
            py: 0,
            "& .MuiAccordionSummary-content": {
              margin: "0px 0",
            },
            "& .MuiAccordionSummary-content.Mui-expanded": {
              margin: "0px 0",
            },
            minHeight: "0px !important",
          }}
        >
          {/* <Typography fontWeight={600} fontSize={{ xs: 15, md: 17 }}>
            + 상세 설정
          </Typography> */}
        </AccordionSummary>
        <AccordionDetails sx={{ px: 0, py: 0 }}>
          {accordionSwitchList.map(
            ({ label, key, toggleKey, helper, placeholder, maxLength }) => (
              <Box key={key} display="flex" flexDirection="column" mb={1}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography fontWeight={600}>{label}</Typography>
                  <Switch
                    checked={
                      content[toggleKey as keyof typeof content] as boolean
                    }
                    onChange={(e) =>
                      handleSwitchChange(toggleKey, e.target.checked)
                    }
                  />
                </Box>
                {isReversed && (
                  <Typography
                    color={primaryColor}
                    fontSize={{ xs: 13, md: 14 }}
                    sx={{ mt: -0.3, mb: 0.5, opacity: 0.7 }}
                  >
                    {helper}
                  </Typography>
                )}
              </Box>
            )
          )}

          <Box mb={2} mt={1.5}>
            <Typography fontWeight={600} mb={1}>
              업로드 주기
            </Typography>
            <Grid container spacing={1}>
              {uploadList.map((u) => (
                <Grid size={{ xs: 4 }} key={u}>
                  <Button
                    fullWidth
                    variant={
                      content.uploadCycle === u ? "contained" : "outlined"
                    }
                    onClick={() => handleUploadChange(u)}
                    disabled={u !== "주 1회"}
                    sx={{ 
                      height: 40,
                      opacity: u !== "주 1회" ? 0.5 : 1,
                      cursor: u !== "주 1회" ? "not-allowed" : "pointer"
                    }}
                  >
                    {u}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Box mb={2}>
            <Typography fontWeight={600}>톤앤매너</Typography>

            {isReversed && (
              <Typography
                color={primaryColor}
                fontSize={{ xs: 13, md: 14 }}
                sx={{ mt: 0.5, mb: 1, opacity: 0.7 }}
              >
                어떤 톤으로 고객들과 소통하시길 원하시나요? 최대 3가지를
                선택해주세요.
              </Typography>
            )}

            <Grid container spacing={1}>
              {toneList.map((t) => (
                <Grid size={{ xs: 6 }} key={t}>
                  <Chip
                    label={t}
                    clickable
                    variant="outlined"
                    onClick={() =>
                      handleToneChange(
                        content.toneMannerList.includes(t)
                          ? content.toneMannerList.filter((x) => x !== t)
                          : [...content.toneMannerList, t]
                      )
                    }
                    sx={{
                      width: "100%",
                      fontWeight: 500,
                      fontSize: 14,
                      borderColor: content.toneMannerList.includes(t)
                        ? "primary.main"
                        : "grey.300",
                      "&:hover": {
                        borderColor: "primary.main",
                        backgroundColor: "grey.50",
                      },
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>



          <Box mb={2}>
            <Typography fontWeight={600}>이미지 비율</Typography>

            {isReversed && (
              <Typography
                color={primaryColor}
                fontSize={{ xs: 13, md: 14 }}
                sx={{ mt: 0.5, mb: 1, opacity: 0.7 }}
              >
                원하는 대표 인스타 콘텐츠 사이즈를 알려주세요!
              </Typography>
            )}

            <Grid container spacing={1}>
              {ratioList.map((r) => (
                <Grid size={{ xs: 4 }} key={r}>
                  <Button
                    fullWidth
                    variant={
                      content.imageRatio === r ? "contained" : "outlined"
                    }
                    onClick={() => handleRatioChange(r)}
                    sx={{ height: 40 }}
                  >
                    {r}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Box mb={2}>
            <Typography fontWeight={600} mb={1}>
              콘텐츠 방향성
            </Typography>
            <Grid container spacing={1}>
              {directionList.map((d) => (
                <Grid size={{ xs: 4 }} key={d}>
                  <Chip
                    label={d}
                    clickable
                    variant="outlined"
                    onClick={() =>
                      handleDirectionChange(
                        content.directionList.includes(d)
                          ? content.directionList.filter((x) => x !== d)
                          : [...content.directionList, d]
                      )
                    }
                    sx={{
                      width: "100%",
                      fontWeight: 500,
                      fontSize: { xs: 12, md: 14 },
                      borderColor: content.directionList.includes(d)
                        ? "primary.main"
                        : "grey.300",
                      "&:hover": {
                        borderColor: "primary.main",
                        backgroundColor: "grey.50",
                      },
                      letterSpacing: { xs: "-0.01em", md: "0" },
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
