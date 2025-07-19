import { Box, Button, Typography, Tooltip } from "@mui/material";
import React, { useState, useEffect, useRef } from "react";
import { primaryColor } from "@/constant/styles/styleTheme";
import { apiCall, handleAPIError } from "@/module/utils/api";
import EditableText from "@/component/ui/EditableText";
import EditableColor from "@/component/ui/EditableColor";

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

// Utility function to calculate relative luminance and determine if color is light or dark
const isLightColor = (color: string): boolean => {
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  }
  
  return false;
};

function ColorDisplay({ color, text }: { color: string; text: string }) {
  const isLight = isLightColor(color);
  const textColor = isLight ? '#000000' : '#FFFFFF';
  const shadowColor = isLight ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)';
  
  return (
    <Tooltip title={`색상 코드: ${color}`} arrow>
      <span
        style={{
          color: textColor,
          backgroundColor: color,
          fontWeight: 700,
          padding: '2px 6px',
          borderRadius: '4px',
          margin: "0 2px",
          textShadow: `0 1px 2px ${shadowColor}`,
          border: `1px solid ${isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)'}`,
          display: 'inline-block',
          minWidth: 'fit-content',
        }}
      >
        {text}
      </span>
    </Tooltip>
  );
}

function BrandNameDisplay({ text }: { text: string }) {
  return (
    <span
      style={{
        fontWeight: 700,
        color: primaryColor,
        padding: '1px 3px',
        borderRadius: '3px',
        backgroundColor: 'rgba(255, 152, 0, 0.1)',
      }}
    >
      {text}
    </span>
  );
}

export function parseSummaryForDisplay(summary: string, brandName: string) {
  const elements: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let keyIndex = 0;

  // Pattern for brand name highlighting
  const brandNameRegex = new RegExp(`\\b(${brandName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})\\b`, 'g');
  
  // Pattern for color display
  const colorRegex = /"mainColorHex":\s*"([^"]+),\s*(#[0-9A-Fa-f]{6})"/g;

  // Collect all matches
  const matches: Array<{
    type: 'brand' | 'color';
    match: RegExpMatchArray;
    start: number;
    end: number;
  }> = [];

  // Find brand name matches
  let brandMatch;
  while ((brandMatch = brandNameRegex.exec(summary)) !== null) {
    matches.push({
      type: 'brand',
      match: brandMatch,
      start: brandMatch.index,
      end: brandNameRegex.lastIndex
    });
  }

  // Find color matches
  let colorMatch;
  while ((colorMatch = colorRegex.exec(summary)) !== null) {
    matches.push({
      type: 'color',
      match: colorMatch,
      start: colorMatch.index,
      end: colorRegex.lastIndex
    });
  }

  // Sort matches by position
  matches.sort((a, b) => a.start - b.start);

  // Build elements array
  matches.forEach((item, index) => {
    // Add text before this match
    if (item.start > lastIndex) {
      const textBefore = summary.slice(lastIndex, item.start);
      const segments = textBefore.split(/(\n)/);
      segments.forEach((segment, i) => {
        if (segment === "\n") {
          elements.push(<br key={`br-${lastIndex + i}`} />);
        } else {
          elements.push(segment);
        }
      });
    }

    // Add the styled element
    if (item.type === 'brand') {
      elements.push(
        <BrandNameDisplay 
          key={`brand-${keyIndex++}`} 
          text={item.match[1]} 
        />
      );
    } else if (item.type === 'color') {
      elements.push(
        <ColorDisplay
          key={`color-${keyIndex++}`}
          color={item.match[2]}
          text={item.match[1]}
        />
      );
    }

    lastIndex = item.end;
  });

  // Add remaining text
  if (lastIndex < summary.length) {
    const remaining = summary.slice(lastIndex);
    const segments = remaining.split(/(\n)/);
    segments.forEach((segment, i) => {
      if (segment === "\n") {
        elements.push(<br key={`br-tail-${lastIndex + i}`} />);
      } else {
        elements.push(segment);
      }
    });
  }

  return elements;
}

export function parseEditableSummaryForDisplay(
  summary: string, 
  brandName: string,
  onBrandNameChange: (newName: string) => void,
  onCompanyAdvantageChange: (newAdvantage: string) => void,
  onProductNameChange: (newProduct: string) => void,
  onProductDescriptionChange: (newDescription: string) => void,
  onTargetCustomerChange: (newTarget: string) => void,
  onTargetDescriptionChange: (newDescription: string) => void,
  onColorChange: (oldName: string, oldCode: string, newName: string, newCode: string) => void,
  imageSection?: React.ReactNode, // Optional image section to inject
  currentValues?: {
    productName?: string;
    targetCustomer?: string;
    advantage?: string;
    productDescription?: string;
    targetDescription?: string;
  }
) {
  const elements: (string | JSX.Element)[] = [];
  let processedText = summary;
  let keyIndex = 0;

  // First pass: Replace patterns with placeholders to avoid conflicts
  const placeholders: { [key: string]: { type: string; content: any; } } = {};
  
  // Remove any remaining __BRAND_X__ placeholders from the text
  processedText = processedText.replace(/__BRAND_\d+__\s*/g, '');
  
  // Pattern for specific bracketed content that should be editable
  // Only make product name and target audience editable, not reasons
  
  // Skip the simple bracketed patterns - they conflict with the more complex patterns below

  // Pattern for brand name - make it editable
  if (brandName && brandName.trim()) {
    // Look for brand name anywhere in the text
    const brandNameRegex = new RegExp(`(${brandName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, 'gi');
    processedText = processedText.replace(brandNameRegex, (match, p1) => {
      // Don't replace if it's already in a placeholder
      if (match.includes('__BRAND_')) return match;
      
      const placeholder = `__BRAND_${keyIndex}__`;
      placeholders[placeholder] = { 
        type: 'brand', 
        content: p1
      };
      keyIndex++;
      return placeholder;
    });
  }

  // Pattern for company advantage (text after "회사의 장점 →")
  const companyAdvantageRegex = /회사의\s*장점\s*→\s*([^•\n]+)/g;
  processedText = processedText.replace(companyAdvantageRegex, (match, p1) => {
    const placeholder = `__ADVANTAGE_${keyIndex}__`;
    placeholders[placeholder] = { 
      type: 'advantage', 
      content: currentValues?.advantage || p1.trim()
    };
    keyIndex++;
    return `회사의 장점 → ${placeholder}`;
  });

  // Pattern for core product with description (중심 상품은 [product] → description)
  const coreProductWithDescRegex = /중심\s*상품은\s*\[([^\]]+)\]\s*→\s*([^•\n]+)/g;
  processedText = processedText.replace(coreProductWithDescRegex, (match, product, description) => {
    const productPlaceholder = `__PRODUCT_${keyIndex}__`;
    const descPlaceholder = `__PRODUCT_DESC_${keyIndex}__`;
    placeholders[productPlaceholder] = { 
      type: 'product', 
      content: currentValues?.productName || product.trim().replace(/__BRAND_\d+__\s*/g, '')
    };
    placeholders[descPlaceholder] = { 
      type: 'product_desc', 
      content: currentValues?.productDescription || description.trim()
    };
    keyIndex++;
    return `중심 상품은 ${productPlaceholder} → ${descPlaceholder}`;
  });

  // Pattern for target customers (타겟 고객층은 [target] → description)
  const targetCustomerRegex = /타겟\s*고객층은\s*\[([^\]]+)\]\s*→\s*([^•\n]+)/g;
  processedText = processedText.replace(targetCustomerRegex, (match, target, description) => {
    const targetPlaceholder = `__TARGET_${keyIndex}__`;
    const descPlaceholder = `__TARGET_DESC_${keyIndex}__`;
    placeholders[targetPlaceholder] = { 
      type: 'target', 
      content: currentValues?.targetCustomer || target.trim().replace(/__BRAND_\d+__\s*/g, '')
    };
    placeholders[descPlaceholder] = { 
      type: 'target_desc', 
      content: currentValues?.targetDescription || description.trim()
    };
    keyIndex++;
    return `타겟 고객층은 ${targetPlaceholder} → ${descPlaceholder}`;
  });

  // Pattern for color display - more flexible to catch different formats
  const colorRegex1 = /"mainColorHex":\s*"([^"]+),\s*(#[0-9A-Fa-f]{6})"/g;
  processedText = processedText.replace(colorRegex1, (match, name, color) => {
    const placeholder = `__COLOR_${keyIndex}__`;
    placeholders[placeholder] = { 
      type: 'color', 
      content: { name: name.trim(), color: color.trim() }
    };
    keyIndex++;
    return placeholder;
  });

  // Pattern for inline color mentions like "Vibrant Yellow, #FFD700"
  const colorRegex2 = /([A-Za-z\s]+),\s*(#[0-9A-Fa-f]{6})/g;
  processedText = processedText.replace(colorRegex2, (match, name, color) => {
    const placeholder = `__COLOR_${keyIndex}__`;
    placeholders[placeholder] = { 
      type: 'color', 
      content: { name: name.trim(), color: color.trim() }
    };
    keyIndex++;
    return placeholder;
  });

  // Split by placeholders and process, including brackets
  const parts = processedText.split(/((?:\[)?__[A-Z_0-9]+__(?:\])?)/);
  
  parts.forEach((part, index) => {
    // Check if this part is a bracketed placeholder like [__BRAND_0__]
    const bracketMatch = part.match(/^\[(__[A-Z_0-9]+__)\]$/);
    const plainMatch = part.match(/^(__[A-Z_0-9]+__)$/);
    
    const placeholderKey = bracketMatch ? bracketMatch[1] : (plainMatch ? plainMatch[1] : null);
    
    if (placeholderKey && placeholders[placeholderKey]) {
      const placeholder = placeholders[placeholderKey];
      const hasBrackets = !!bracketMatch;
      
      switch (placeholder.type) {
        case 'brand':
          // Display brand name as editable
          elements.push(
            <EditableText
              key={`brand-${index}-${placeholder.content}`}
              id={`brand-${index}`}
              text={placeholder.content}
              onTextChange={onBrandNameChange}
              placeholder="브랜드명"
              fontSize="1.15rem"
              fontWeight={700}
            />
          );
          break;
          
        case 'advantage':
          elements.push(
            <EditableText
              key={`advantage-${index}`}
              id={`advantage-${index}`}
              text={placeholder.content}
              onTextChange={onCompanyAdvantageChange}
              placeholder="회사의 장점을 입력하세요"
              multiline={true}
              maxLength={500}
              fontSize="1.15rem"
              fontWeight={500}
            />
          );
          break;
          
        case 'product':
          elements.push(
            <EditableText
              key={`product-${index}`}
              id={`product-${index}`}
              text={placeholder.content}
              onTextChange={onProductNameChange}
              placeholder="상품명"
              fontSize="1.15rem"
              fontWeight={500}
            />
          );
          break;
          
        case 'product_desc':
          elements.push(
            <EditableText
              key={`product_desc-${index}`}
              id={`product_desc-${index}`}
              text={placeholder.content}
              onTextChange={onProductDescriptionChange}
              placeholder="상품 설명"
              multiline={true}
              maxLength={500}
              fontSize="1.15rem"
              fontWeight={500}
            />
          );
          break;
          
        case 'target':
          elements.push(
            <EditableText
              key={`target-${index}`}
              id={`target-${index}`}
              text={placeholder.content}
              onTextChange={onTargetCustomerChange}
              placeholder="타겟 고객층"
              fontSize="1.15rem"
              fontWeight={500}
            />
          );
          break;
          
        case 'target_desc':
          elements.push(
            <EditableText
              key={`target_desc-${index}`}
              id={`target_desc-${index}`}
              text={placeholder.content}
              onTextChange={onTargetDescriptionChange}
              placeholder="타겟 고객 설명"
              multiline={true}
              maxLength={500}
              fontSize="1.15rem"
              fontWeight={500}
            />
          );
          break;
          
        case 'color':
          elements.push(
            <EditableColor
              key={`color-${index}`}
              colorName={placeholder.content.name}
              colorCode={placeholder.content.color}
              onColorChange={(newName, newCode) => 
                onColorChange(placeholder.content.name, placeholder.content.color, newName, newCode)
              }
            />
          );
          break;
      }
    } else {
      // Regular text - split by newlines
      const segments = part.split(/(\n)/);
      segments.forEach((segment, i) => {
        if (segment === "\n") {
          elements.push(<br key={`br-${index}-${i}`} />);
        } else if (segment) {
          elements.push(segment);
        }
      });
    }
  });

  return elements;
}

// Utility function to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
};

export default function Summarization({
  brandInput,
  images,
  scrapedImages,
  hasUrl,
  selectedImages,
  onGenerateContent,
  onGenerateImages,
  onBrandInputChange,
}: SummarizationProps) {
  const [summary, setSummary] = useState<string>("");
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [error, setError] = useState<string>("");
  const [imageUrls, setImageUrls] = useState<Map<string, string>>(new Map());
  const [editableBrandName, setEditableBrandName] = useState<string>(brandInput.name || "");
  const [editableAdvantage, setEditableAdvantage] = useState<string>("");
  const [editableProductName, setEditableProductName] = useState<string>("");
  const [editableProductDescription, setEditableProductDescription] = useState<string>("");
  const [editableTargetCustomer, setEditableTargetCustomer] = useState<string>("");
  const [editableTargetDescription, setEditableTargetDescription] = useState<string>("");
  const hasInitialized = useRef(false);

  // Update editable brand name when brandInput changes
  useEffect(() => {
    setEditableBrandName(brandInput.name || "");
  }, [brandInput.name]);

  // Handler for brand name changes
  const handleBrandNameChange = (newName: string) => {
    setEditableBrandName(newName);
    if (onBrandInputChange) {
      onBrandInputChange({
        ...brandInput,
        name: newName
      });
    }
    // Update summary to reflect new brand name everywhere
    if (editableBrandName && summary) {
      const updatedSummary = summary.replace(new RegExp(editableBrandName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), 'gi'), newName);
      setSummary(updatedSummary);
    }
  };

  // Handler for company advantage changes
  const handleCompanyAdvantageChange = (newAdvantage: string) => {
    setEditableAdvantage(newAdvantage);
  };

  // Handler for product name changes
  const handleProductNameChange = (newProduct: string) => {
    setEditableProductName(newProduct);
  };

  // Handler for product description changes
  const handleProductDescriptionChange = (newDescription: string) => {
    setEditableProductDescription(newDescription);
  };

  // Handler for target customer changes
  const handleTargetCustomerChange = (newTarget: string) => {
    setEditableTargetCustomer(newTarget);
  };

  // Handler for target description changes
  const handleTargetDescriptionChange = (newDescription: string) => {
    setEditableTargetDescription(newDescription);
  };

  // Handler for color changes
  const handleColorChange = (oldName: string, oldCode: string, newName: string, newCode: string) => {
    // Update the summary to reflect the color change
    if (summary) {
      let updatedSummary = summary;
      // Replace the old color pattern with the new one
      updatedSummary = updatedSummary.replace(
        new RegExp(`${oldName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")},\\s*${oldCode.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, 'g'),
        `${newName}, ${newCode}`
      );
      setSummary(updatedSummary);
    }
  };

  // Generate brand summary using OpenAI API
  const generateBrandSummary = async () => {
    if (isLoadingSummary) return;
    try {
      setIsLoadingSummary(true);
      setError("");
      
      // Collect selected images with their base64 data
      const selectedImageInfo: Array<{
        fileName: string;
        type: 'manual' | 'scraped';
        index: number;
        base64: string;
      }> = [];
      
      // Process manual images
      for (let idx = 0; idx < images.length; idx++) {
        const img = images[idx];
        const imageKey = `manual-${idx}`;
        if (selectedImages.has(imageKey)) {
          try {
            const base64Data = await fileToBase64(img);
            selectedImageInfo.push({ 
              fileName: img.name, 
              type: 'manual', 
              index: idx,
              base64: base64Data
            });
          } catch (error) {
            // Error handling for manual image conversion
          }
        }
      }
      
      // Process scraped images
      for (let idx = 0; idx < scrapedImages.length; idx++) {
        const img = scrapedImages[idx];
        const imageKey = `scraped-${idx}`;
        if (selectedImages.has(imageKey)) {
          try {
            const base64Data = await fileToBase64(img);
            selectedImageInfo.push({ 
              fileName: img.name, 
              type: 'scraped', 
              index: idx,
              base64: base64Data
            });
          } catch (error) {
            // Error handling for scraped image conversion
          }
        }
      }
      
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
      
      console.log('API Response:', response.data); // Debug log
      
      // Helper function to clean any remaining placeholders from text
      const cleanPlaceholders = (text: string): string => {
        // Remove any __BRAND_X__ placeholders and keep only what follows
        return text.replace(/__BRAND_\d+__\s*/g, '');
      };
      
      if (response.data.summary) {
        let processedSummary = response.data.summary;
        
        // Extract values from the summary text if not provided separately
        // This is a fallback for when the backend doesn't send structured data
        
        // Extract core product name and description
        const productMatch = processedSummary.match(/중심 상품은 \[([^\]]+)\] → \[([^\]]+)\]/);
        if (productMatch) {
          let productNamePart = productMatch[1].trim();
          const productDesc = productMatch[2].trim();
          
          // Clean any placeholders from the product name
          productNamePart = cleanPlaceholders(productNamePart);
          
          // If product name is empty after cleaning, extract from context
          if (!productNamePart || productNamePart.length === 0) {
            // Try to extract a meaningful name from the product description
            const words = productDesc.split(/[\s,]/);
            productNamePart = words[0] || '제품';
          }
          
          setEditableProductName(productNamePart);
          setEditableProductDescription(productDesc);
          
          // Update the summary to remove the placeholder
          processedSummary = processedSummary.replace(productMatch[1], productNamePart);
        }
        
        // Extract target audience and description
        const targetMatch = processedSummary.match(/타겟 고객층은 \[([^\]]+)\] → \[([^\]]+)\]/);
        if (targetMatch) {
          let targetNamePart = targetMatch[1].trim();
          const targetDesc = targetMatch[2].trim();
          
          // Clean any placeholders from the target audience
          targetNamePart = cleanPlaceholders(targetNamePart);
          
          // If target name is empty after cleaning, extract from context
          if (!targetNamePart || targetNamePart.length === 0) {
            const words = targetDesc.split(/[\s,]/);
            targetNamePart = words[0] || '고객층';
          }
          
          setEditableTargetCustomer(targetNamePart);
          setEditableTargetDescription(targetDesc);
          
          // Update the summary to remove the placeholder
          processedSummary = processedSummary.replace(targetMatch[1], targetNamePart);
        }
        
        // Also extract other fields from the summary
        const strengthsMatch = processedSummary.match(/회사의\s*장점\s*→\s*([^•\n]+)/);
        if (strengthsMatch) {
          setEditableAdvantage(strengthsMatch[1].trim());
        }
        
        // Replace specific placeholders with actual values if backend returns structured data
        if (response.data.coreProductName) {
          processedSummary = processedSummary.replace(/__BRAND_1__/g, response.data.coreProductName);
          setEditableProductName(response.data.coreProductName);
        }
        if (response.data.targetAudience) {
          processedSummary = processedSummary.replace(/__BRAND_2__/g, response.data.targetAudience);
          setEditableTargetCustomer(response.data.targetAudience);
        }
        
        // Also check for fields in a structured format
        if (response.data.fields) {
          if (response.data.fields.coreProductName) {
            processedSummary = processedSummary.replace(/__BRAND_1__/g, response.data.fields.coreProductName);
            setEditableProductName(response.data.fields.coreProductName);
          }
          if (response.data.fields.targetAudience) {
            processedSummary = processedSummary.replace(/__BRAND_2__/g, response.data.fields.targetAudience);
            setEditableTargetCustomer(response.data.fields.targetAudience);
          }
          // Set other editable fields if available
          if (response.data.fields.brandStrengths) {
            setEditableAdvantage(response.data.fields.brandStrengths);
          }
          if (response.data.fields.coreProductDescription) {
            setEditableProductDescription(response.data.fields.coreProductDescription);
          }
          if (response.data.fields.targetDescription) {
            setEditableTargetDescription(response.data.fields.targetDescription);
          }
        }
        
        // Final cleanup: remove any remaining __BRAND_X__ placeholders from the entire text
        processedSummary = cleanPlaceholders(processedSummary);
        
        setSummary(processedSummary);
      }
      
    } catch (e) {
      setError("브랜드 요약 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
      handleAPIError(e, "브랜드 요약 생성 실패");
    } finally {
      setIsLoadingSummary(false);
    }
  };

  useEffect(() => {
    if (!summary && !isLoadingSummary && !hasInitialized.current) {
      hasInitialized.current = true;
      generateBrandSummary();
    }
  }, []);

  // Function to safely get image URL with error handling
  const getImageUrl = (file: File, key: string) => {
    try {
      let url = imageUrls.get(key);
      
      if (!url) {
        const newUrl = URL.createObjectURL(file);
        if (newUrl) {
          setImageUrls(prev => new Map(prev).set(key, newUrl));
          url = newUrl;
        } else {
          return '';
        }
      }
      
      return url;
    } catch (error) {
      return '';
    }
  };

  // Cleanup effect for image URLs
  useEffect(() => {
    return () => {
      imageUrls.forEach(url => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {
          // Ignore revoke errors
        }
      });
    };
  }, []);

  // Update image URLs when images change
  useEffect(() => {
    const refreshImageUrls = () => {
      setImageUrls(prevUrls => {
        const newImageUrls = new Map<string, string>();
        
        images.forEach((img, idx) => {
          const key = `manual-${idx}`;
          try {
            const url = URL.createObjectURL(img);
            if (url) {
              newImageUrls.set(key, url);
            }
          } catch (error) {
            // Error handling for manual image URL creation
          }
        });
        
        scrapedImages.forEach((img, idx) => {
          const key = `scraped-${idx}`;
          try {
            const url = URL.createObjectURL(img);
            if (url) {
              newImageUrls.set(key, url);
            }
          } catch (error) {
            // Error handling for scraped image URL creation
          }
        });
        
        // Clean up old URLs
        prevUrls.forEach((url, key) => {
          if (!newImageUrls.has(key)) {
            try {
              URL.revokeObjectURL(url);
            } catch (e) {
              // Ignore revoke errors
            }
          }
        });
        
        return newImageUrls;
      });
    };

    const timer = setTimeout(refreshImageUrls, 50);
    return () => clearTimeout(timer);
  }, [images, scrapedImages]);

  const displayContent = summary || (isLoadingSummary ? '요약을 불러오는 중입니다...' : '요약이 없습니다.');
  
  // Split summary into sections for better presentation
  const summaryParts = {
    beforeImage: '',
    afterImage: ''
  };
  
  if (summary) {
    const imageAnalysisIndex = summary.indexOf('📸 이미지 분석 결과:');
    if (imageAnalysisIndex > -1) {
      summaryParts.beforeImage = summary.substring(0, imageAnalysisIndex);
      summaryParts.afterImage = summary.substring(imageAnalysisIndex);
    } else {
      summaryParts.beforeImage = summary;
    }
  }

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

      {/* Instructions for editable fields */}
      <Box sx={{
        // Option 1: Soft gradient with light background
        background: "linear-gradient(135deg, #fff4e6 0%, #ffe0b2 100%)",
        borderRadius: 2,
        p: 2,
        mb: 3,
        color: "#5d4037",
        fontSize: "14px",
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        border: `1px solid ${primaryColor}20`,
        boxShadow: "0 2px 8px rgba(255, 152, 0, 0.1)"
      }}>
        <Box sx={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: primaryColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: "white",
          fontSize: "20px"
        }}>
          💡
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 600, color: "#5d4037", fontSize: "15px", mb: 0.5 }}>
            수정 가능한 영역 안내
          </Typography>
          <Typography sx={{ color: "#6d4c41", fontSize: "13px" }}>
            [ ] 대괄호 안의 내용은 클릭하여 직접 수정할 수 있습니다. 
            브랜드명, 핵심 상품, 타겟 고객층 등을 자유롭게 편집해보세요!
          </Typography>
        </Box>
      </Box>

      {/* Quick stats */}
      {summary && (
        <Box sx={{ 
          display: "flex", 
          gap: 2, 
          mb: 3,
          flexWrap: "wrap"
        }}>
          <Box sx={{
            flex: 1,
            minWidth: "140px",
            background: "#f8f9fa",
            borderRadius: 2,
            p: 2,
            textAlign: "center",
            borderLeft: `3px solid ${primaryColor}`
          }}>
            <Typography sx={{ fontSize: "12px", color: "#666", mb: 0.5 }}>
              브랜드명
            </Typography>
            <Typography sx={{ fontWeight: 600, fontSize: "14px" }}>
              {editableBrandName || brandInput.name}
            </Typography>
          </Box>
          <Box sx={{
            flex: 1,
            minWidth: "140px",
            background: "#f8f9fa",
            borderRadius: 2,
            p: 2,
            textAlign: "center",
            borderLeft: `3px solid #6366f1`
          }}>
            <Typography sx={{ fontSize: "12px", color: "#666", mb: 0.5 }}>
              카테고리
            </Typography>
            <Typography sx={{ fontWeight: 600, fontSize: "14px" }}>
              {brandInput.category}
            </Typography>
          </Box>
          <Box sx={{
            flex: 1,
            minWidth: "140px",
            background: "#f8f9fa",
            borderRadius: 2,
            p: 2,
            textAlign: "center",
            borderLeft: `3px solid #8b5cf6`
          }}>
            <Typography sx={{ fontSize: "12px", color: "#666", mb: 0.5 }}>
              선택 이미지
            </Typography>
            <Typography sx={{ fontWeight: 600, fontSize: "14px" }}>
              {selectedImages.size}장
            </Typography>
          </Box>
        </Box>
      )}

      {/* Main content area with sections */}
      <Box sx={{
        background: "#fff7f1",
        borderRadius: 3,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        overflow: "hidden"
      }}>
        {/* First part of content before images */}
        <Box sx={{ p: 3 }}>
          <Typography
            sx={{
              fontSize: '1.15rem',
              fontWeight: 500,
              color: '#333',
              whiteSpace: 'pre-line',
              lineHeight: 1.9,
              wordBreak: 'keep-all',
            }}
          >
            {parseEditableSummaryForDisplay(
              summaryParts.beforeImage || displayContent, 
              editableBrandName || '', 
              handleBrandNameChange,
              handleCompanyAdvantageChange,
              handleProductNameChange,
              handleProductDescriptionChange,
              handleTargetCustomerChange,
              handleTargetDescriptionChange,
              handleColorChange,
              undefined,
              {
                productName: editableProductName,
                targetCustomer: editableTargetCustomer,
                advantage: editableAdvantage,
                productDescription: editableProductDescription,
                targetDescription: editableTargetDescription
              }
            )}
          </Typography>
        </Box>
        
        {/* Image Analysis Section with integrated images */}
        {summaryParts.afterImage && selectedImages.size > 0 && (
          <Box sx={{ 
            background: "linear-gradient(to bottom, rgba(255,152,0,0.05), rgba(255,152,0,0.02))",
            p: 3,
            borderTop: "1px solid rgba(255,152,0,0.1)"
          }}>
            <Typography
              sx={{
                fontSize: '1.15rem',
                fontWeight: 500,
                color: '#333',
                whiteSpace: 'pre-line',
                lineHeight: 1.9,
                wordBreak: 'keep-all',
              }}
            >
              {parseEditableSummaryForDisplay(
                summaryParts.afterImage, 
                editableBrandName || '', 
                handleBrandNameChange,
                handleCompanyAdvantageChange,
                handleProductNameChange,
                handleProductDescriptionChange,
                handleTargetCustomerChange,
                handleTargetDescriptionChange,
                handleColorChange,
                undefined,
                {
                  productName: editableProductName,
                  targetCustomer: editableTargetCustomer,
                  advantage: editableAdvantage,
                  productDescription: editableProductDescription,
                  targetDescription: editableTargetDescription
                }
              )}
            </Typography>
            
            {/* Selected Images integrated into the analysis section */}
            <Box sx={{ mt: 3 }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                  gap: 2,
                  maxWidth: 600,
                  mx: "auto"
                }}
              >
                {/* Manual Images */}
                {images.map((img, idx) => {
                  const imageKey = `manual-${idx}`;
                  if (!selectedImages.has(imageKey)) return null;
                  
                  return (
                    <Box
                      key={`${img.name}-${idx}-${img.lastModified}`}
                      sx={{
                        width: "100%",
                        paddingTop: "100%",
                        position: "relative",
                        borderRadius: 2,
                        overflow: "hidden",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        transition: "transform 0.2s",
                        "&:hover": {
                          transform: "scale(1.05)"
                        }
                      }}
                    >
                      <img
                        src={getImageUrl(img, imageKey)}
                        alt={`preview-${idx}`}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </Box>
                  );
                })}
                
                {/* Scraped Images */}
                {scrapedImages.map((img, idx) => {
                  const imageKey = `scraped-${idx}`;
                  if (!selectedImages.has(imageKey)) return null;
                  
                  return (
                    <Box
                      key={`${img.name}-${idx}-${img.lastModified}`}
                      sx={{
                        width: "100%",
                        paddingTop: "100%",
                        position: "relative",
                        borderRadius: 2,
                        overflow: "hidden",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        transition: "transform 0.2s",
                        "&:hover": {
                          transform: "scale(1.05)"
                        }
                      }}
                    >
                      <img
                        src={getImageUrl(img, imageKey)}
                        alt={`scraped-preview-${idx}`}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        )}
        
        {/* If no image analysis section but there are images, show continuation */}
        {!summaryParts.afterImage && summary && (
          <Box sx={{ p: 3, pt: 0 }}>
            <Typography
              sx={{
                fontSize: '1.15rem',
                fontWeight: 500,
                color: '#333',
                whiteSpace: 'pre-line',
                lineHeight: 1.9,
                wordBreak: 'keep-all',
              }}
            >
              {parseEditableSummaryForDisplay(
                '', 
                editableBrandName || '', 
                handleBrandNameChange,
                handleCompanyAdvantageChange,
                handleProductNameChange,
                handleProductDescriptionChange,
                handleTargetCustomerChange,
                handleTargetDescriptionChange,
                handleColorChange,
                undefined,
                {
                  productName: editableProductName,
                  targetCustomer: editableTargetCustomer,
                  advantage: editableAdvantage,
                  productDescription: editableProductDescription,
                  targetDescription: editableTargetDescription
                }
              )}
            </Typography>
          </Box>
        )}
      </Box>

      
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
        {onGenerateImages && (
          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{ fontWeight: 700, fontSize: "18px", py: 1.5, borderRadius: "12px" }}
            onClick={onGenerateImages}
            disabled={isLoadingSummary || !!error}
          />
        )}
      </Box>
    </Box>
  );
}