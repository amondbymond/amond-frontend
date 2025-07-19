import { Box, Container, Typography, Link as MuiLink } from "@mui/material";
import { BodyContainer } from "../ui/BodyContainer";

export default function Footer() {
  return (
    <footer>
      <Container
        maxWidth={false}
        sx={{
          py: { xs: "16px", md: "24px" },
          backgroundColor: "#FFF",
          borderTop: "1px solid #E1E1E1",
        }}
      >
        <BodyContainer>
          <Box sx={{ width: "100%", overflow: "auto" }}>
            <Box sx={{ 
              mb: 0.5, 
              textAlign: "left", 
              fontSize: '15px', 
              color: '#888',
              whiteSpace: 'nowrap',
              display: 'inline-block',
              minWidth: 'max-content'
            }}>
              몬드 주식회사 | 대표자명 유윤지 | 통신판매업신고번호 2025-용인기흥-02270호 | 사업자등록번호 816-81-03565 | 경기도 용인시 기흥구 동백중앙로 245, 215호 | 010-3192-7934 | service@mond.io.kr

            </Box>
          
            <Typography sx={{ mb: 0.5, textAlign: "left", fontSize: '15px !important', color: '#888 !important' }}>
              아몬드는 스팸메일 발송을 금지하고 있습니다. 스팸메일로 의심되는 경우 발송을 차단하거나 사용을 정지시킬 수 있습니다.
            </Typography>
            <Typography sx={{ textAlign: "left", fontSize: '15px !important', color: '#888 !important' }}>
              <MuiLink
                href="https://sticky-partridge-ee9.notion.site/2172fde8bab680b1b776cb4244d60f9b"
                underline="hover"
                sx={{ fontWeight: 500, color: '#888 !important', fontSize: '15px !important' }}
                target="_blank"
                rel="noopener noreferrer"
              >
                이용약관
              </MuiLink>
              <Box component="span" mx={1} color="#ccc">|</Box>
              <MuiLink
                href="https://sticky-partridge-ee9.notion.site/2172fde8bab68036bd25f88124abaf02"
                underline="hover"
                sx={{ fontWeight: 700, color: '#888 !important', fontSize: '15px !important' }}
                target="_blank"
                rel="noopener noreferrer"
              >
                개인정보 처리방침
              </MuiLink>
            </Typography>
            <Typography sx={{ mt: 1, textAlign: "left", fontSize: '15px !important', color: '#bbb !important' }}>
              Copyright © amond. All rights reserved
            </Typography>
          </Box>
        </BodyContainer>
      </Container>
    </footer>
  );
}
