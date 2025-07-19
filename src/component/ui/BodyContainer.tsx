import { mdPx, xsPx } from "@/constant/styles/styleTheme";
import {
  Box,
  Button,
  Container,
  Grid,
  SxProps,
  Typography,
} from "@mui/material";
import { ReactNode } from "react";
import { TitleTypo40 } from "./styled/StyledTypography";
import { RowStack } from "./BoxStack";

/** 가로 padding Container */
export function BodyContainer({
  sx,
  id,
  children,
  ...props
}: {
  id?: string;
  children: ReactNode;
  sx?: SxProps;
}) {
  return (
    <Container
      id={id}
      sx={{
        px: { xs: xsPx, md: mdPx },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Container>
  );
}

/** 세로 Center Container with Body */
export function CenterContainer({
  sx,
  imageUrl,
  children,
  ...props
}: {
  children: ReactNode;
  imageUrl?: string;
  sx?: SxProps;
}) {
  return (
    <Container
      maxWidth={false}
      sx={{
        backgroundImage: imageUrl ? `url("${imageUrl}")` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        alignItems: "center",
        ...sx,
      }}
      {...props}
    >
      <BodyContainer>{children}</BodyContainer>
    </Container>
  );
}

// CenterContainer + 타이틀
export function TitleBgContainer({
  title,
  description,
  imageUrl,
  sx,
  typoSx,
  ...props
}: {
  title: string;
  description: string;
  imageUrl: string;
  sx?: SxProps;
  typoSx?: SxProps;
}) {
  return (
    <CenterContainer
      imageUrl={imageUrl}
      {...props}
      sx={{ height: { xs: "200px", md: "250px" } }}
    >
      <BodyContainer>
        <Typography
          variant="h1"
          align="center"
          fontSize={{ xs: 24, md: 46 }}
          fontWeight={700}
        >
          {title}
        </Typography>
        <Typography
          fontSize={{ xs: 14, md: 18 }}
          align="center"
          color="#666666"
          sx={{ mt: { xs: "10px", md: "15px" } }}
        >
          {description}
        </Typography>
      </BodyContainer>
    </CenterContainer>
  );
}

export function AdminBodyContainerWithTitle({
  currentKeyName,
  sx,
  children,
  ...props
}: {
  currentKeyName: string;
  children: ReactNode;
  sx?: SxProps;
}) {
  const adminMenuList = [
    { label: "회원 목록", keyName: "user" },
    { label: "콘텐츠", keyName: "content" },
    { label: "프롬프트 관리", keyName: "prompt" },
  ];

  return (
    <BodyContainer sx={{ py: { xs: "40px", md: "60px" } }} {...props}>
      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <TitleTypo40 variant="h1" sx={{ mb: "28px" }}>
          관리자 페이지
        </TitleTypo40>

        <RowStack justifyContent="center" sx={{ mb: "10px" }}>
          {adminMenuList.map((each, index) => (
            <Button
              key={each.keyName}
              variant={
                currentKeyName === each.keyName ? "contained" : "outlined"
              }
              href={`/admin/${each.keyName}`}
              sx={{
                borderRadius:
                  index === 0
                    ? "8px 0 0 8px"
                    : index === adminMenuList.length - 1
                    ? "0 8px 8px 0"
                    : "0",
              }}
            >
              {each.label}
            </Button>
          ))}
        </RowStack>

        {children}
      </Box>

      <Box sx={{ display: { xs: "block", md: "none" } }}>
        <RowStack justifyContent="space-between" sx={{ mb: "12px" }}>
          <Typography
            fontSize={20}
            fontWeight={600}
            align="center"
            sx={{ maxWidth: "210px", mx: "auto" }}
          >
            관리자 모드는 PC에서만 이용하실 수 있습니다.
          </Typography>
        </RowStack>
      </Box>
    </BodyContainer>
  );
}
