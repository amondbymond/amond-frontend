// Types for structured brand summary with editable field metadata

export type FieldType = 'text' | 'color' | 'multiline' | 'list';

export interface EditableField {
  id: string;
  value: string;
  type: FieldType;
  editable: boolean;
  placeholder?: string;
  maxLength?: number;
  displayName?: string;
}

export interface ColorField extends EditableField {
  type: 'color';
  colorName: string;
  colorHex: string;
}

export interface TemplateSection {
  type: 'text' | 'field' | 'linebreak';
  content?: string;
  field?: EditableField | ColorField;
}

export interface StructuredBrandSummary {
  sections: TemplateSection[];
  fields: Record<string, EditableField | ColorField>;
  metadata: {
    userName: string;
    brandName: string;
    category: string;
    hasImages: boolean;
  };
}

// Helper to create structured summary from backend response
export function createStructuredSummary(
  userName: string,
  brandName: string, 
  category: string,
  reasons: string[],
  aiFields: any,
  hasImages: boolean
): StructuredBrandSummary {
  const fields: Record<string, EditableField | ColorField> = {
    brandName: {
      id: 'brandName',
      value: brandName,
      type: 'text',
      editable: true,
      placeholder: '브랜드명',
      displayName: '브랜드명'
    },
    brandAnalysis: {
      id: 'brandAnalysis',
      value: aiFields.brandAnalysis,
      type: 'multiline',
      editable: true,
      maxLength: 500,
      placeholder: '브랜드 분석',
      displayName: '브랜드 분석'
    },
    brandStrengths: {
      id: 'brandStrengths',
      value: aiFields.brandStrengths,
      type: 'multiline',
      editable: true,
      maxLength: 300,
      placeholder: '회사의 장점',
      displayName: '회사의 장점'
    },
    coreProductName: {
      id: 'coreProductName',
      value: aiFields.coreProductName,
      type: 'text',
      editable: true,
      placeholder: '핵심 상품명',
      displayName: '핵심 상품'
    },
    coreProductDescription: {
      id: 'coreProductDescription',
      value: aiFields.coreProductDescription,
      type: 'multiline',
      editable: true,
      maxLength: 300,
      placeholder: '핵심 상품 설명',
      displayName: '상품 설명'
    },
    targetAudience: {
      id: 'targetAudience',
      value: aiFields.targetAudience,
      type: 'text',
      editable: true,
      placeholder: '타겟 고객층',
      displayName: '타겟 고객층'
    },
    targetDescription: {
      id: 'targetDescription',
      value: aiFields.targetDescription,
      type: 'multiline',
      editable: true,
      maxLength: 300,
      placeholder: '타겟 고객 설명',
      displayName: '타겟 설명'
    },
    mainColor: {
      id: 'mainColor',
      value: aiFields.mainColorHex,
      type: 'color',
      editable: true,
      colorName: aiFields.mainColorHex.split(',')[0]?.trim() || 'Main Color',
      colorHex: aiFields.mainColorHex.split(',')[1]?.trim() || '#6366F1',
      displayName: '메인 컬러'
    } as ColorField,
    conclusion: {
      id: 'conclusion',
      value: aiFields.conclusion,
      type: 'multiline',
      editable: true,
      maxLength: 500,
      placeholder: '결론',
      displayName: '결론'
    }
  };

  // Build template sections
  const sections: TemplateSection[] = [
    { type: 'text', content: `${userName}님이 적어주신 이야기, 이렇게 요약해봤어요. ✨` },
    { type: 'linebreak' },
    { type: 'linebreak' },
    { type: 'text', content: '• 당신의 상품명은 ' },
    { type: 'field', field: fields.brandName },
    { type: 'linebreak' },
    { type: 'text', content: `• 선택하신 브랜드는 [${reasons.join(', ')}]를 운영 목적으로 ${category} 카테고리네요!` },
    { type: 'linebreak' },
    { type: 'linebreak' },
    { type: 'text', content: '당신의 브랜드 ' },
    { type: 'field', field: fields.brandName },
    { type: 'text', content: '는 ' },
    { type: 'field', field: fields.brandAnalysis },
    { type: 'linebreak' },
    { type: 'linebreak' },
    { type: 'text', content: '• 회사의 장점 → ' },
    { type: 'field', field: fields.brandStrengths },
    { type: 'linebreak' },
    { type: 'text', content: '• 중심 상품은 [' },
    { type: 'field', field: fields.coreProductName },
    { type: 'text', content: '] → ' },
    { type: 'field', field: fields.coreProductDescription },
    { type: 'linebreak' },
    { type: 'text', content: '• 타겟 고객층은 [' },
    { type: 'field', field: fields.targetAudience },
    { type: 'text', content: '] → ' },
    { type: 'field', field: fields.targetDescription },
  ];

  // Add image analysis section if needed
  if (hasImages && aiFields.imageAnalysis) {
    sections.push(
      { type: 'linebreak' },
      { type: 'linebreak' },
      { type: 'text', content: '📸 이미지 분석 결과:' },
      { type: 'linebreak' },
      { type: 'text', content: `• 이미지들은 ${aiFields.imageAnalysis}` },
      { type: 'linebreak' },
      { type: 'text', content: `• 시각적 스타일: ${aiFields.visualStyle}` },
      { type: 'linebreak' },
      { type: 'text', content: `• 주요 색상: ${aiFields.colorPalette.join(', ')}` }
    );
  }

  // Continue with rest
  sections.push(
    { type: 'linebreak' },
    { type: 'text', content: '저희가 생각하기엔 피드의 메인테마는 ' },
    { type: 'field', field: fields.mainColor },
    { type: 'text', content: '로 하는게 좋을 것 같아요!' },
    { type: 'linebreak' },
    { type: 'linebreak' },
    { type: 'text', content: `이런 고객들에게 어필하기 위해서는 ${aiFields.contentType1}, ${aiFields.contentType2}, ${aiFields.contentType3}, ${aiFields.contentType4} 형식의 콘텐츠가 적절해 보입니다.` },
    { type: 'linebreak' },
    { type: 'linebreak' },
    { type: 'field', field: fields.brandName },
    { type: 'text', content: '는 ' },
    { type: 'field', field: fields.conclusion }
  );

  return {
    sections,
    fields,
    metadata: {
      userName,
      brandName,
      category,
      hasImages
    }
  };
}