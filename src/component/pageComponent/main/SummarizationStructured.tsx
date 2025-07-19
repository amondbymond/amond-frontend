import { Box, Button, Typography } from "@mui/material";
import React, { useState, useEffect, useRef } from "react";
import { primaryColor } from "@/constant/styles/styleTheme";
import { apiCall, handleAPIError } from "@/module/utils/api";
import StructuredSummaryRenderer from "@/component/ui/StructuredSummaryRenderer";
import { createStructuredSummary, StructuredBrandSummary } from "@/types/brandSummary";

interface SummarizationProps {
  brandInput: any;
  images: File[];
  scrapedImages: File[];
  hasUrl: boolean | null;
  selectedImages: Set<string>;
  onGenerateContent: () => void;
  onGenerateImages?: () => void;
  onBrandInputChange?: (updatedBrandInput: any) => void;
}

export default function SummarizationStructured({
  brandInput,
  images,
  scrapedImages,
  hasUrl,
  selectedImages,
  onGenerateContent,
  onGenerateImages,
  onBrandInputChange,
}: SummarizationProps) {
  const [structuredSummary, setStructuredSummary] = useState<StructuredBrandSummary | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [error, setError] = useState<string>("");
  const [imageUrls, setImageUrls] = useState<Map<string, string>>(new Map());
  const hasInitialized = useRef(false);

  // Handle field changes
  const handleFieldChange = (fieldId: string, newValue: string) => {
    if (!structuredSummary) return;

    // Update the field value in the structured summary
    const updatedSummary = {
      ...structuredSummary,
      fields: {
        ...structuredSummary.fields,
        [fieldId]: {
          ...structuredSummary.fields[fieldId],
          value: newValue
        }
      }
    };

    // Update sections to reflect the new value
    updatedSummary.sections = updatedSummary.sections.map(section => {
      if (section.type === 'field' && section.field?.id === fieldId) {
        return {
          ...section,
          field: {
            ...section.field,
            value: newValue
          }
        };
      }
      return section;
    });

    setStructuredSummary(updatedSummary);

    // If it's the brand name, update the parent component
    if (fieldId === 'brandName' && onBrandInputChange) {
      onBrandInputChange({
        ...brandInput,
        name: newValue
      });
    }
  };

  // Handle color changes
  const handleColorChange = (fieldId: string, newName: string, newHex: string) => {
    if (!structuredSummary) return;

    const updatedSummary = {
      ...structuredSummary,
      fields: {
        ...structuredSummary.fields,
        [fieldId]: {
          ...structuredSummary.fields[fieldId],
          value: `${newName}, ${newHex}`,
          colorName: newName,
          colorHex: newHex
        }
      }
    };

    // Update sections
    updatedSummary.sections = updatedSummary.sections.map(section => {
      if (section.type === 'field' && section.field?.id === fieldId) {
        return {
          ...section,
          field: {
            ...section.field,
            value: `${newName}, ${newHex}`,
            colorName: newName,
            colorHex: newHex
          }
        };
      }
      return section;
    });

    setStructuredSummary(updatedSummary);
  };

  // Generate brand summary using the API
  const generateBrandSummary = async () => {
    if (isLoadingSummary) return;
    try {
      setIsLoadingSummary(true);
      setError("");
      
      // Collect selected images with base64
      const selectedImageInfo: Array<{
        fileName: string;
        type: 'manual' | 'scraped';
        index: number;
        base64: string;
      }> = [];
      
      // Process images (same as before)
      // ... your existing image processing code ...
      
      const response = await apiCall({
        url: "/content/brand-summary",
        method: "post",
        body: {
          brandName: brandInput.name,
          category: brandInput.category,
          reasons: brandInput.reasonList,
          description: brandInput.description,
          hasUrl: hasUrl,
          url: brandInput.url,
          selectedImages: selectedImageInfo,
          imageCount: selectedImages.size,
        },
      });
      
      // Check if backend returns structured format
      if (response.data.structured) {
        // Use structured response directly
        const { metadata, fields, staticFields } = response.data.structured;
        const structured = createStructuredSummary(
          metadata.userName,
          metadata.brandName,
          metadata.category,
          metadata.reasons,
          {
            ...fields,
            ...staticFields,
            colorPalette: staticFields.colorPalette || [],
            contentType1: staticFields.contentTypes[0],
            contentType2: staticFields.contentTypes[1],
            contentType3: staticFields.contentTypes[2],
            contentType4: staticFields.contentTypes[3]
          },
          metadata.hasImages
        );
        setStructuredSummary(structured);
      } else if (response.data.summary) {
        // Fallback: Parse the old format
        // For now, you would need to parse the summary text
        // But ideally, update your backend to return structured data
        console.warn('Backend returned old format. Please update to structured format.');
        
        // Create a basic structured summary from the text
        // This is a temporary solution - better to update backend
        const structured = createStructuredSummary(
          "User",
          brandInput.name,
          brandInput.category,
          brandInput.reasonList,
          {
            brandAnalysis: "브랜드 분석 내용을 추출해야 합니다",
            brandStrengths: "장점을 추출해야 합니다",
            coreProductName: brandInput.name,
            coreProductDescription: "상품 설명을 추출해야 합니다",
            targetAudience: "타겟 고객층",
            targetDescription: "타겟 설명",
            mainColorHex: "Indigo Purple, #6366F1",
            conclusion: "결론을 추출해야 합니다",
            imageAnalysis: "",
            visualStyle: "",
            colorPalette: [],
            contentType1: "콘텐츠1",
            contentType2: "콘텐츠2",
            contentType3: "콘텐츠3",
            contentType4: "콘텐츠4"
          },
          selectedImages.size > 0
        );
        setStructuredSummary(structured);
      }
      
    } catch (e) {
      setError("브랜드 요약 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
      handleAPIError(e, "브랜드 요약 생성 실패");
    } finally {
      setIsLoadingSummary(false);
    }
  };

  useEffect(() => {
    if (!structuredSummary && !isLoadingSummary && !hasInitialized.current) {
      hasInitialized.current = true;
      generateBrandSummary();
    }
  }, []);

  // Image URL management (same as before)
  // ... your existing image URL code ...

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 6, mb: 8, px: { xs: 2, md: 3 } }}>
      <Box sx={{
        background: "#f5f5f5",
        borderRadius: "20px",
        px: 3,
        py: 2,
        mb: 2,
        display: "inline-block",
        position: "relative",
        fontWeight: 500,
        color: "#444"
      }}>
        내가 작성한 정보 다시 확인해줄 수 있어?
        <Box sx={{
          position: "absolute",
          left: 30,
          bottom: -12,
          width: 0,
          height: 0,
          borderLeft: "12px solid transparent",
          borderRight: "12px solid transparent",
          borderTop: "12px solid #f5f5f5"
        }} />
      </Box>

      {structuredSummary ? (
        <StructuredSummaryRenderer
          summary={structuredSummary}
          onFieldChange={handleFieldChange}
          onColorChange={handleColorChange}
        />
      ) : (
        <Box sx={{
          background: "#fff7f1",
          borderRadius: 3,
          p: 3,
          minHeight: 180,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Typography sx={{ color: '#666' }}>
            {isLoadingSummary ? '요약을 불러오는 중입니다...' : '요약이 없습니다.'}
          </Typography>
        </Box>
      )}

      {/* Selected images section */}
      {selectedImages.size > 0 && (
        <Box sx={{ mb: 3, mt: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, textAlign: 'center' }}>
            선택된 이미지들
          </Typography>
          {/* Your existing image grid code */}
        </Box>
      )}
      
      {error && (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 2 }}>
          <Typography sx={{ color: "#d32f2f", fontWeight: 600, textAlign: "center", mb: 1 }}>
            {error}
          </Typography>
          <Button
            onClick={generateBrandSummary}
            variant="outlined"
            sx={{
              borderColor: primaryColor,
              color: primaryColor,
              '&:hover': {
                borderColor: primaryColor,
                background: primaryColor,
                color: "white",
              }
            }}
          >
            다시 시도
          </Button>
        </Box>
      )}

      <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
        <Button
          fullWidth
          variant="contained"
          color="warning"
          sx={{ fontWeight: 700, fontSize: "18px", py: 1.5, borderRadius: "12px" }}
          onClick={onGenerateContent}
          disabled={isLoadingSummary || !!error}
        >
          이대로 콘텐츠 생성하기!
        </Button>
      </Box>
    </Box>
  );
}