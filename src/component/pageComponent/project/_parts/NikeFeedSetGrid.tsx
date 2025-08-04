import { Box, Typography, CardMedia, Fade, Grow } from "@mui/material";
import { useState } from "react";
import { s3ImageUrl } from "@/constant/commonVariable";
import { changeDateDash } from "@/module/utils/commonFunction";
import { motion } from "framer-motion";

interface NikeFeedSetProps {
  contentDataList: any[];
  onContentClick: (content: any) => void;
  fullContent?: any;
}

export default function NikeFeedSetGrid({
  contentDataList,
  onContentClick,
  fullContent,
}: NikeFeedSetProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!contentDataList) return null;

  return (
    <Box sx={{ width: '100%' }}>
      {/* 2x2 Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: { xs: '12px', md: '20px' },
          width: '100%',
          mb: 4,
        }}
      >
        {contentDataList.slice(0, 4).map((content, index) => (
          <motion.div
            key={content.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Box
              onClick={() => onContentClick(content)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              sx={{
                width: '100%',
                aspectRatio: '1/1',
                bgcolor: 'grey.100',
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                cursor: 'pointer',
                overflow: 'hidden',
                border: '1px solid',
                borderColor: hoveredIndex === index ? 'primary.main' : '#EAEAEA',
                transform: hoveredIndex === index ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.3s ease',
                boxShadow: hoveredIndex === index 
                  ? '0 8px 20px rgba(0,0,0,0.12)' 
                  : '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              {/* Date Badge */}
              <Typography
                sx={{
                  position: 'absolute',
                  top: { xs: 8, md: 12 },
                  right: { xs: 8, md: 12 },
                  fontSize: { xs: 11, md: 13 },
                  bgcolor: 'rgba(255,255,255,0.95)',
                  borderRadius: 2,
                  px: { xs: 1, md: 1.5 },
                  py: 0.5,
                  fontWeight: 600,
                  color: 'text.secondary',
                  backdropFilter: 'blur(10px)',
                  zIndex: 2,
                }}
              >
                {changeDateDash(content.postDate)}
              </Typography>

              {/* Image */}
              {content.imageUrl ? (
                <>
                  <CardMedia
                    component="img"
                    src={`${s3ImageUrl}/${content.imageUrl}`}
                    alt={content.subject}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  
                  {/* Hover Overlay */}
                  <Fade in={hoveredIndex === index}>
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        bgcolor: 'rgba(0,0,0,0.7)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 2,
                      }}
                    >
                      <Typography
                        sx={{
                          color: 'white',
                          fontSize: { xs: 14, md: 16 },
                          fontWeight: 600,
                          textAlign: 'center',
                          mb: 1,
                        }}
                      >
                        {content.subject}
                      </Typography>
                      <Typography
                        sx={{
                          color: 'rgba(255,255,255,0.8)',
                          fontSize: { xs: 12, md: 14 },
                          textAlign: 'center',
                        }}
                      >
                        클릭하여 상세보기
                      </Typography>
                    </Box>
                  </Fade>
                </>
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'grey.500',
                    fontSize: { xs: 13, md: 14 },
                  }}
                >
                  이미지 생성중...
                </Box>
              )}

              {/* Content Type Badge */}
              {content.contentType && (
                <Typography
                  sx={{
                    position: 'absolute',
                    bottom: { xs: 8, md: 12 },
                    left: { xs: 8, md: 12 },
                    fontSize: { xs: 10, md: 12 },
                    bgcolor: 'primary.main',
                    color: 'white',
                    borderRadius: 1,
                    px: { xs: 0.8, md: 1 },
                    py: 0.3,
                    fontWeight: 500,
                    zIndex: 2,
                  }}
                >
                  {content.contentType}
                </Typography>
              )}
            </Box>
          </motion.div>
        ))}
      </Box>
    </Box>
  );
}