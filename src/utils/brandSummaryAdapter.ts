// Adapter to convert between backend and frontend formats
// This helps transition from the old text-based format to the new structured format

import { createStructuredSummary, StructuredBrandSummary } from '@/types/brandSummary';

// Extract field values from the old text format
export function parseOldFormatSummary(summary: string, brandName: string): any {
  const fields: any = {
    brandName: brandName,
    brandAnalysis: '',
    brandStrengths: '',
    coreProductName: '',
    coreProductDescription: '',
    targetAudience: '',
    targetDescription: '',
    mainColorHex: '',
    conclusion: ''
  };

  // Extract brand analysis
  const brandAnalysisMatch = summary.match(new RegExp(`${brandName}는\\s+(.+?)(?=\\n|•)`, 's'));
  if (brandAnalysisMatch) {
    fields.brandAnalysis = brandAnalysisMatch[1].trim();
  }

  // Extract company strengths
  const strengthsMatch = summary.match(/회사의\s*장점\s*→\s*(.+?)(?=\n|•)/);
  if (strengthsMatch) {
    fields.brandStrengths = strengthsMatch[1].trim();
  }

  // Extract core product
  const productMatch = summary.match(/중심\s*상품은\s*\[([^\]]+)\]\s*→\s*(.+?)(?=\n|•)/);
  if (productMatch) {
    fields.coreProductName = productMatch[1].trim();
    fields.coreProductDescription = productMatch[2].trim();
  }

  // Extract target audience
  const targetMatch = summary.match(/타겟\s*고객층은\s*\[([^\]]+)\]\s*→\s*(.+?)(?=\n|•)/);
  if (targetMatch) {
    fields.targetAudience = targetMatch[1].trim();
    fields.targetDescription = targetMatch[2].trim();
  }

  // Extract main color
  const colorMatch = summary.match(/메인테마는\s*(.+?)로\s*하는게/);
  if (colorMatch) {
    fields.mainColorHex = colorMatch[1].trim();
  }

  // Extract conclusion
  const conclusionMatch = summary.match(new RegExp(`${brandName}는\\s+(.+?)$`, 's'));
  if (conclusionMatch) {
    const lines = conclusionMatch[0].split('\n');
    const lastLine = lines[lines.length - 1];
    const finalMatch = lastLine.match(new RegExp(`${brandName}는\\s+(.+)$`));
    if (finalMatch) {
      fields.conclusion = finalMatch[1].trim();
    }
  }

  return fields;
}

// Convert old API response to structured format
export function convertToStructuredFormat(
  apiResponse: any,
  userName: string
): StructuredBrandSummary | null {
  // If the API already returns structured format, use it directly
  if (apiResponse.structured) {
    const { metadata, fields, staticFields } = apiResponse.structured;
    return createStructuredSummary(
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
  }

  // Otherwise, try to parse the old format
  if (apiResponse.summary && apiResponse.brandName) {
    const extractedFields = parseOldFormatSummary(
      apiResponse.summary,
      apiResponse.brandName
    );

    return createStructuredSummary(
      userName,
      apiResponse.brandName,
      apiResponse.category || '기타',
      apiResponse.reasons || [],
      extractedFields,
      false // hasImages - would need to be determined from context
    );
  }

  return null;
}

// Get the final text from structured summary (for saving to backend)
export function getTextFromStructuredSummary(summary: StructuredBrandSummary): string {
  let text = '';
  
  summary.sections.forEach(section => {
    switch (section.type) {
      case 'text':
        text += section.content || '';
        break;
      case 'field':
        if (section.field) {
          text += section.field.value;
        }
        break;
      case 'linebreak':
        text += '\n';
        break;
    }
  });
  
  return text;
}

// Get all field values for saving
export function getFieldValues(summary: StructuredBrandSummary): Record<string, string> {
  const values: Record<string, string> = {};
  
  Object.entries(summary.fields).forEach(([id, field]) => {
    values[id] = field.value;
  });
  
  return values;
}