import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, Typography } from '@mui/material';
import { primaryColor } from '@/constant/styles/styleTheme';

interface EditableTextProps {
  text: string;
  onTextChange: (newText: string) => void;
  placeholder?: string;
  multiline?: boolean;
  maxLength?: number;
  fontSize?: string | number;
  fontWeight?: string | number;
  color?: string;
  sx?: any;
  id?: string; // Add unique ID to prevent conflicts
}

export default function EditableText({
  text,
  onTextChange,
  placeholder = "클릭하여 편집",
  multiline = false,
  maxLength = 200,
  fontSize = '1.15rem',
  fontWeight = 500,
  color = '#333',
  sx = {},
  id = ''
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentText, setCurrentText] = useState(text);
  const inputRef = useRef<any>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [textWidth, setTextWidth] = useState('auto');

  useEffect(() => {
    setCurrentText(text);
  }, [text]);

  // Measure text width when not editing to maintain consistent size
  useEffect(() => {
    if (!isEditing && textRef.current) {
      const width = textRef.current.offsetWidth;
      setTextWidth(`${Math.max(width + 40, 120)}px`); // More padding for comfortable editing
    }
  }, [currentText, isEditing]);

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    onTextChange(currentText);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentText(text); // Reset to original text
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && e.ctrlKey && multiline) {
      handleSave();
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Select all text for easy editing
      if (inputRef.current.select) {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  if (isEditing) {
    return (
      <Box sx={{ display: 'inline-block', ...sx }}>
        <span
          style={{
            fontSize: '1.2em',
            fontWeight: 'bold',
            color: primaryColor,
            marginRight: '2px',
          }}
        >
          [
        </span>
        <TextField
          ref={inputRef}
          value={currentText}
          onChange={(e) => setCurrentText(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          multiline={multiline}
          rows={multiline ? 2 : 1}
          variant="standard"
          size="small"
          inputProps={{
            maxLength,
            style: {
              fontSize,
              fontWeight,
              color,
              padding: '2px 4px',
              border: 'none',
              outline: 'none',
              width: textWidth,
              minWidth: textWidth,
              backgroundColor: 'rgba(255, 152, 0, 0.05)',
            }
          }}
          sx={{
            width: textWidth,
            minWidth: textWidth,
            '& .MuiInput-underline:before': {
              borderBottom: `1px solid ${primaryColor}`,
            },
            '& .MuiInput-underline:hover:before': {
              borderBottom: `2px solid ${primaryColor}`,
            },
            '& .MuiInput-underline:after': {
              borderBottom: `2px solid ${primaryColor}`,
            },
            '& .MuiInputBase-input': {
              padding: '0px',
            },
          }}
        />
        <span
          style={{
            fontSize: '1.2em',
            fontWeight: 'bold',
            color: primaryColor,
            marginLeft: '2px',
          }}
        >
          ]
        </span>
      </Box>
    );
  }

  return (
    <Box
      onClick={handleClick}
      sx={{
        display: 'inline-block',
        cursor: 'pointer',
        position: 'relative',
        padding: '2px 4px',
        borderRadius: '4px',
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: 'rgba(255, 152, 0, 0.1)',
        },
        ...sx
      }}
    >
      <span
        style={{
          fontSize: '1.2em',
          fontWeight: 'bold',
          color: primaryColor,
          marginRight: '2px',
        }}
      >
        [
      </span>
      <Typography
        ref={textRef}
        component="span"
        sx={{
          fontSize,
          fontWeight,
          color,
          minWidth: '20px',
          display: 'inline-block',
          textDecoration: 'underline',
          textDecorationColor: '#000000',
          textDecorationThickness: '2px',
          textUnderlineOffset: '2px',
        }}
      >
        {currentText || placeholder}
      </Typography>
      <span
        style={{
          fontSize: '1.2em',
          fontWeight: 'bold',
          color: primaryColor,
          marginLeft: '2px',
        }}
      >
        ]
      </span>
    </Box>
  );
}