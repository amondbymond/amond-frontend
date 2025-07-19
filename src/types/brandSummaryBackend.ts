// Backend API response format update
// This shows how your backend should structure the response

export interface StructuredBrandResponse {
  // Keep the original formatted text for backward compatibility
  summary: string;
  
  // New structured format
  structured: {
    metadata: {
      userName: string;
      brandName: string;
      category: string;
      reasons: string[];
      hasImages: boolean;
    };
    
    // All editable fields with their values
    fields: {
      brandName: string;
      brandAnalysis: string;
      brandStrengths: string;
      coreProductName: string;
      coreProductDescription: string;
      targetAudience: string;
      targetDescription: string;
      mainColorHex: string;  // Format: "Color Name, #HEX"
      conclusion: string;
    };
    
    // Non-editable fields
    staticFields: {
      imageAnalysis?: string;
      visualStyle?: string;
      colorPalette?: string[];
      contentTypes: string[];
    };
  };
}

// Example of how to update your backend generateFormattedText method
export function generateStructuredResponse(
  userName: string,
  brandInput: any,
  aiFields: any
): StructuredBrandResponse {
  // Generate the traditional summary for backward compatibility
  const summary = generateTraditionalSummary(userName, brandInput, aiFields);
  
  return {
    summary,
    structured: {
      metadata: {
        userName,
        brandName: brandInput.brandName,
        category: brandInput.category,
        reasons: brandInput.reasons,
        hasImages: brandInput.selectedImages?.length > 0
      },
      fields: {
        brandName: brandInput.brandName,
        brandAnalysis: aiFields.brandAnalysis,
        brandStrengths: aiFields.brandStrengths,
        coreProductName: aiFields.coreProductName,
        coreProductDescription: aiFields.coreProductDescription,
        targetAudience: aiFields.targetAudience,
        targetDescription: aiFields.targetDescription,
        mainColorHex: aiFields.mainColorHex,
        conclusion: aiFields.conclusion
      },
      staticFields: {
        imageAnalysis: aiFields.imageAnalysis,
        visualStyle: aiFields.visualStyle,
        colorPalette: aiFields.colorPalette,
        contentTypes: [
          aiFields.contentType1,
          aiFields.contentType2,
          aiFields.contentType3,
          aiFields.contentType4
        ]
      }
    }
  };
}

function generateTraditionalSummary(userName: string, brandInput: any, aiFields: any): string {
  // Your existing template generation logic
  return `${userName}님이 적어주신 이야기...`;
}