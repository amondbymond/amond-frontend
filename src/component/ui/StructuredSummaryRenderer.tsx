import React from 'react';
import { Box, Typography } from '@mui/material';
import EditableText from './EditableText';
import EditableColor from './EditableColor';
import { 
  StructuredBrandSummary, 
  EditableField, 
  ColorField, 
  TemplateSection 
} from '@/types/brandSummary';

interface StructuredSummaryRendererProps {
  summary: StructuredBrandSummary;
  onFieldChange: (fieldId: string, newValue: string) => void;
  onColorChange?: (fieldId: string, newName: string, newHex: string) => void;
}

export default function StructuredSummaryRenderer({
  summary,
  onFieldChange,
  onColorChange
}: StructuredSummaryRendererProps) {
  const renderField = (field: EditableField | ColorField, index: number) => {
    if (!field.editable) {
      // Non-editable fields just display as text
      return <span key={`field-${field.id}-${index}`}>{field.value}</span>;
    }

    if (field.type === 'color') {
      const colorField = field as ColorField;
      return (
        <EditableColor
          key={`color-${field.id}-${index}`}
          colorName={colorField.colorName}
          colorCode={colorField.colorHex}
          onColorChange={(newName, newHex) => {
            if (onColorChange) {
              onColorChange(field.id, newName, newHex);
            }
          }}
        />
      );
    }

    // Text or multiline editable fields
    return (
      <EditableText
        key={`text-${field.id}-${index}`}
        id={field.id}
        text={field.value}
        onTextChange={(newValue) => onFieldChange(field.id, newValue)}
        placeholder={field.placeholder}
        multiline={field.type === 'multiline'}
        maxLength={field.maxLength}
        fontSize="1.15rem"
        fontWeight={field.id === 'brandName' ? 700 : 500}
      />
    );
  };

  const renderSection = (section: TemplateSection, index: number) => {
    switch (section.type) {
      case 'text':
        return <span key={`text-${index}`}>{section.content}</span>;
      
      case 'field':
        return section.field ? renderField(section.field, index) : null;
      
      case 'linebreak':
        return <br key={`br-${index}`} />;
      
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        background: "#fff7f1",
        borderRadius: 3,
        p: 3,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        minHeight: 180,
      }}
    >
      <Typography
        component="div"
        sx={{
          fontSize: '1.15rem',
          fontWeight: 500,
          color: '#333',
          whiteSpace: 'pre-line',
          lineHeight: 1.9,
          wordBreak: 'keep-all',
        }}
      >
        {summary.sections.map((section, index) => renderSection(section, index))}
      </Typography>
    </Box>
  );
}