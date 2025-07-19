import { Box, Button, Typography, Grid, IconButton, FormControlLabel, FormControl, Radio, RadioGroup, TextField } from "@mui/material";
import { useState } from "react";
import { primaryColor } from "@/constant/styles/styleTheme";
import { TitleTypo28 } from "@/component/ui/styled/StyledTypography";
import { DropDownWithArr } from "@/component/ui/DropDown";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import { categoryList, reasonList } from "@/constant/commonVariable";
import OnboardingStep5 from "./OnboardingStep5";
import Summarization from "./Summarization";

// Step 1: Brand Name
export function Step1({
  brandInput,
  setBrandInput,
}: {
  brandInput: any;
  setBrandInput: Function;
}) {
  return (
    <>
      <TitleTypo28 align="center" lineHeight={1.4}>
        내가 판매하고자 하는
        <br />
        <span style={{ color: primaryColor }}>브랜드명이나 상품명</span>을
        작성해주세요.
      </TitleTypo28>

      <Typography align="center" sx={{ mt: "20px", mb: "20px" }}>
        내 서비스/상품의 브랜드명을 작성해주세요.
        <br />
        브랜드명이 없다면 <span style={{ color: primaryColor }}>가칭</span>으로
        적어주셔도 괜찮습니다.
      </Typography>

      <TextField
        placeholder="예) 아몬드 또는 amond"
        sx={{ width: { xs: "100%", md: "500px" } }}
        value={brandInput.name}
        onChange={(e) => setBrandInput({ ...brandInput, name: e.target.value })}
      />
    </>
  );
}

// Step 2: Category
export function Step2({
  brandInput,
  setBrandInput,
}: {
  brandInput: any;
  setBrandInput: Function;
}) {
  return (
    <>
      <TitleTypo28 align="center" lineHeight={1.4}>
        <span style={{ color: primaryColor }}>상품(혹은 서비스) </span>
        카테고리를 선택해주세요.
      </TitleTypo28>

      <Typography align="center" sx={{ mt: "20px", mb: "20px" }}>
        내 SNS 계정을 대표하는 카테고리를 선택해주세요.
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <DropDownWithArr
          selectList={categoryList}
          value={brandInput.category}
          onChange={(value) =>
            setBrandInput({ ...brandInput, category: value })
          }
          initialLabel="내 상품 혹은 서비스의 카테고리를 선택해주세요."
          sx={{ width: { md: "450px" } }}
        />
      </Box>
    </>
  );
}

// Step 3: Reasons
export function Step3({
  brandInput,
  setBrandInput,
}: {
  brandInput: any;
  setBrandInput: Function;
}) {
  const handleToggle = (reason: string) => {
    if (brandInput.reasonList.includes(reason)) {
      setBrandInput({
        ...brandInput,
        reasonList: brandInput.reasonList.filter((r: string) => r !== reason),
      });
    } else {
      if (brandInput.reasonList.length >= 3) {
        alert("최대 3개까지만 선택 가능합니다.");
        return;
      }
      setBrandInput({
        ...brandInput,
        reasonList: [...brandInput.reasonList, reason],
      });
    }
  };

  return (
    <>
      <TitleTypo28 align="center" lineHeight={1.4}>
        해당 서비스와 상품 SNS 계정을
        <br />
        <span style={{ color: primaryColor }}>운영하는 가장 큰 이유</span>가
        뭔가요?
      </TitleTypo28>
      <Typography align="center" sx={{ mt: "20px", mb: "20px" }}>
        복수 선택 가능합니다. 최대 3가지를 선택해주세요.
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Grid container spacing={{ xs: "12px", md: "16px" }}>
          {reasonList.map((reason) => {
            const selected = brandInput.reasonList.includes(reason);
            return (
              <Grid key={reason} size={{ xs: 12, md: 6 }}>
                <Box
                  onClick={() => handleToggle(reason)}
                  sx={{
                    cursor: "pointer",
                    px: 2.5,
                    py: 1.2,
                    borderRadius: "12px",
                    border: `1.7px solid ${
                      selected ? primaryColor : "#E6E6E6"
                    }`,
                    background: "#fff",
                    color: selected ? primaryColor : "#999999",
                    fontWeight: 600,
                    fontSize: { xs: "15px", md: "16px" },
                    transition: "all 0.15s",
                    userSelect: "none",
                    minWidth: "120px",
                    textAlign: "center",
                  }}
                >
                  {reason}
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </>
  );
}

// Step 4: URL
export function Step4({ 
  setBrandInput, 
  brandInput,
  hasUrl,
  setHasUrl,
}: { 
  setBrandInput: Function; 
  brandInput: any;
  hasUrl: boolean | null;
  setHasUrl: (value: boolean | null) => void;
}) {
  return (
    <>
      <TitleTypo28 align="center" lineHeight={1.4}>
        내 상품,서비스를 대표하는
        <span style={{ color: primaryColor }}> 링크</span>가
        <br />
        있나요?
      </TitleTypo28>

      <Typography align="center" sx={{ mt: "20px", mb: "20px" }}>
        홈페이지, 블로그 포스팅, <b>유튜브 채널, 인스타그램 링크</b> 등 내 서비스나 상품을 소개하고 있는 링크가 있다면 공유해주세요.
        <br />
        링크가 있으면 <b>자동으로 이미지를 추출할 수 있어요!</b>
      </Typography>

      <FormControl sx={{ mb: 3 }}>
        <RadioGroup
          value={hasUrl === null ? "" : hasUrl.toString()}
          onChange={(e) => {
            const value = e.target.value === "true";
            setHasUrl(value);
          }}
        >
          <Box>
            <FormControlLabel value="true" control={<Radio />} label="네, 링크가 있어요" />
            {hasUrl && (
              <Box sx={{ ml: 4, mt: 2, mb: 2 }}>
                <TextField
                  placeholder="https:// "
                  sx={{ width: { xs: 1, md: "450px" } }}
                  value={brandInput.url}
                  onChange={(e) => setBrandInput({ ...brandInput, url: e.target.value })}
                  size="small"
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  예시: https://youtube.com/yourchannel, https://instagram.com/yourbrand, https://yourbrand.com
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                  링크를 입력하면 자동으로 이미지를 추출합니다. 추가로 사진을 더 넣을 수도 있어요!
                </Typography>
              </Box>
            )}
          </Box>
          <FormControlLabel value="false" control={<Radio />} label="아니요, 링크가 없어요" />
        </RadioGroup>
      </FormControl>
    </>
  );
}

// Step 5: Images (imported from separate file)
export { default as Step5 } from './OnboardingStep5';

// Step 6: Description
export function Step6({
  brandInput,
  setBrandInput,
}: {
  brandInput: any;
  setBrandInput: Function;
}) {
  return (
    <>
      <TitleTypo28 align="center" lineHeight={1.4}>
        다 왔어요! 내 상품 및 서비스의
        <br />
        최신 이슈나 홍보할 내용이 있다면 알려주세요.
      </TitleTypo28>

      <Typography align="center" sx={{ mt: "20px", mb: "20px" }}>
        SNS 콘텐츠 안에 녹일 해당 제품의 특장점이나 할인 정보,
        <br />
        최신 이슈 등 꼭 강조할 내용이 있다면 알려주세요.
      </Typography>

      <TextField
        placeholder="현재 학원을 운영하는 용인 지역 안에서는 꽤 좋은 반응도 들어오고 매출도 좋은데, 전국적으로 나의 영향력을 높이는 게 목표야. 내 서비스와 브랜드에 대한 영향력을 강조해줘. 그리고 내가 가진 성인,아동 스피치에 대한 전문성을 강조해줘."
        sx={{ width: { xs: 1, md: "500px" } }}
        value={brandInput.description}
        onChange={(e) =>
          setBrandInput({ ...brandInput, description: e.target.value })
        }
        multiline
        rows={2}
        inputProps={{
          maxLength: 1000,
        }}
      />
    </>
  );
}

// Step 7: Brand Summary (now using separate Summarization component)
export { default as Step7 } from './Summarization'; 