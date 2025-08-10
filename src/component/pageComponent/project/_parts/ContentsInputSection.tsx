import { primaryColor } from "@/constant/styles/styleTheme";
import { directionList } from "@/constant/commonVariable";
import {
  Box,
  Button,
  Chip,
  Switch,
  TextField,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Grid,
} from "@mui/material";
import MUISlider from "@mui/material/Slider";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useState } from "react";
import { RowStack } from "@/component/ui/BoxStack";

export default function ContentsInputSection({
  content,
  onChange,
  isReversed,
  hideAccordion = false,
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
  hideAccordion?: boolean;
}) {
  const [accordionOpen, setAccordionOpen] = useState(false);

  const switchList = [
    {
      label: "트렌드 이슈 포함",
      key: "trendIssue",
      toggleKey: "trendIssueToggle",
      helper:
        "현재 대중에게 인기있거나 바이럴 가능성이 높은 트렌드를 활용해서 콘텐츠를 제작합니다.",
      placeholder: "하얀 퍼, 우먼스 테일러드, 가방",
      maxLength: 100,
    },
    {
      label: "SNS 이벤트",
      key: "snsEvent",
      toggleKey: "snsEventToggle",
      helper:
        "관련 인스타 계정이 진행했던 이벤트 혹은 행사를 활용해서 콘텐츠를 제작합니다.",
      placeholder: "10% 할인, 무료체험 행사, 여름휴가 이벤트",
      maxLength: 100,
    },
    {
      label: "필수 키워드",
      key: "essentialKeyword",
      toggleKey: "essentialKeywordToggle",
      helper: "콘텐츠 제작 시 필수로 포함될 키워드를 설정합니다.",
      placeholder: "스타일링, 브랜드명, 제품명",
      maxLength: 100,
    },
  ];

  const accordionSwitchList = [
    {
      label: "경쟁사",
      key: "competitor",
      toggleKey: "competitorToggle",
      helper:
        "경쟁 브랜드 혹은 상품을 알려주시면 벤치마킹해서 콘텐츠를 제작합니다.",
      placeholder: "나이키, 자라",
      maxLength: 100,
    },
  ];

  const cycleList = ["주 1회", "주 2회", "주 3회", "주 4회", "주 5회"];
  const toneList = [
    "캐주얼하고 친근한",
    "전문적이고 신뢰감 있는",
    "모던하고 세련된",
    "재미있고 유머러스한",
    "감성적이고 따뜻한",
    "활기차고 에너지틱한",
    "미니멀하고 간결한",
    "고급스럽고 우아한",
    "자연스럽고 편안한",
    "독특하고 개성있는",
  ];
  const ratioList = ["1:1", "4:5"];

  const handleSwitchChange = (toggleKey: string, value: boolean) => {
    const key = toggleKey.replace("Toggle", "");
    onChange({
      ...content,
      [toggleKey]: value,
      [key]: value ? content[key as keyof typeof content] : "",
    });
  };

  const handleCycleChange = (value: string) => {
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

  const accordionContent = (
    <>
      {accordionSwitchList.map(
        ({ label, key, toggleKey, helper, placeholder, maxLength }) => (
          <Box key={key} display="flex" flexDirection="column" mb={1}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography fontWeight={600} fontSize={{ xs: 10.5, md: 12 }}>{label}</Typography>
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
                fontSize={{ xs: 10, md: 10.5 }}
                sx={{ mt: -0.3, mb: 0.5, opacity: 0.7 }}
              >
                {helper}
              </Typography>
            )}
          </Box>
        )
      )}

      <Box mb={2} mt={1.5}>
        <Typography fontWeight={600} fontSize={{ xs: 10.5, md: 12 }} mb={0.8}>
          톤앤매너
        </Typography>
        {!isReversed && (
          <Typography
            color={primaryColor}
            fontSize={{ xs: 10, md: 10.5 }}
            sx={{ mt: -0.3, mb: 0.8, opacity: 0.7 }}
          >
            최대 3개까지 선택 가능합니다.
          </Typography>
        )}

        <Box
          sx={{
            border: "1px solid",
            borderColor: "grey.200",
            borderRadius: 1,
            p: 1,
            display: "flex",
            flexWrap: "wrap",
            gap: 0.5,
          }}
        >
          {toneList.map((t) => (
            <Chip
              key={t}
              label={t}
              variant={
                content.toneMannerList.includes(t) ? "filled" : "outlined"
              }
              color={
                content.toneMannerList.includes(t) ? "primary" : "default"
              }
              onClick={() => {
                if (content.toneMannerList.includes(t)) {
                  handleToneChange(
                    content.toneMannerList.filter((tone) => tone !== t)
                  );
                } else {
                  handleToneChange([...content.toneMannerList, t]);
                }
              }}
              size="small"
              sx={{ fontSize: { xs: 9, md: 11 } }}
            />
          ))}
        </Box>

        {isReversed && (
          <Typography
            color={primaryColor}
            fontSize={{ xs: 10, md: 10.5 }}
            sx={{ mt: 0.5, mb: 1, opacity: 0.7 }}
          >
            최대 3개까지 선택 가능합니다.
          </Typography>
        )}
      </Box>

      <Box mb={2}>
        <Typography fontWeight={600} fontSize={{ xs: 10.5, md: 12 }} mb={0.8}>
          방향성
        </Typography>
        {!isReversed && (
          <Typography
            color={primaryColor}
            fontSize={{ xs: 10, md: 10.5 }}
            sx={{ mt: -0.3, mb: 0.8, opacity: 0.7 }}
          >
            원하는 피드 방향성을 선택해주세요!
          </Typography>
        )}

        <Box
          sx={{
            border: "1px solid",
            borderColor: "grey.200",
            borderRadius: 1,
            p: 1,
            display: "flex",
            flexWrap: "wrap",
            gap: 0.5,
          }}
        >
          {directionList.map((d) => (
            <Chip
              key={d}
              label={d}
              variant={
                content.directionList.includes(d) ? "filled" : "outlined"
              }
              color={
                content.directionList.includes(d) ? "primary" : "default"
              }
              onClick={() => {
                if (content.directionList.includes(d)) {
                  handleDirectionChange(
                    content.directionList.filter((dir) => dir !== d)
                  );
                } else {
                  handleDirectionChange([...content.directionList, d]);
                }
              }}
              size="small"
              sx={{ fontSize: { xs: 9, md: 11 } }}
            />
          ))}
        </Box>

        {isReversed && (
          <Typography
            color={primaryColor}
            fontSize={{ xs: 10, md: 10.5 }}
            sx={{ mt: 0.5, mb: 1, opacity: 0.7 }}
          >
            원하는 피드 방향성을 선택해주세요!
          </Typography>
        )}
      </Box>

      <Box mb={1}>
        <Typography fontWeight={600} fontSize={{ xs: 10.5, md: 12 }} mb={0.8}>
          이미지 사이즈
        </Typography>

        {isReversed && (
          <Typography
            color={primaryColor}
            fontSize={{ xs: 10, md: 10.5 }}
            sx={{ mt: 0.5, mb: 1, opacity: 0.7 }}
          >
            원하는 대표 인스타 콘텐츠 사이즈를 알려주세요!
          </Typography>
        )}

        <Grid container spacing={1}>
          {ratioList.map((r) => (
            <Grid key={r} size={{ xs: 4 }}>
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
    </>
  );

  return (
    <Box
      sx={{
        p: hideAccordion ? 0 : { xs: 1.5, md: 2 },
        borderRadius: hideAccordion ? 0 : 1.5,
        border: hideAccordion ? "none" : "1px solid",
        borderColor: "grey.200",
        mb: hideAccordion ? 0 : { xs: 1.5, md: 2.25 },
      }}
    >
      {!hideAccordion && (
        <RowStack
          justifyContent="space-between"
          onClick={() => setAccordionOpen(!accordionOpen)}
          mb={2}
          sx={{ cursor: "pointer" }}
        >
          <Typography fontWeight={600} fontSize={{ xs: 12, md: 13.5 }}>
            콘텐츠 스타일 설정
          </Typography>

          <ExpandMoreIcon
            sx={{
              color: "rgba(0, 0, 0, 0.54)",
              fontSize: 18,
              // 회전 애니메이션
              transition: "transform 0.15s ease-in-out",
              transform: accordionOpen ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        </RowStack>
      )}
      
      {switchList.map(
        ({ label, key, toggleKey, helper, placeholder, maxLength }) => (
          <Box key={key} display="flex" flexDirection="column" mb={1}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography fontWeight={600} fontSize={{ xs: 10.5, md: 12 }}>{label}</Typography>
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
                fontSize={{ xs: 10, md: 10.5 }}
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

      {/* Show accordion content based on hideAccordion prop */}
      {hideAccordion ? (
        accordionContent
      ) : (
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
          </AccordionSummary>
          <AccordionDetails sx={{ px: 0, py: 0 }}>
            {accordionContent}
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  );
}