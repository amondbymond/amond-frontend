import React, { useState, useRef, useEffect } from 'react';
import { Box, Tooltip, Popover, TextField, Button } from '@mui/material';

interface EditableColorProps {
  colorName: string;
  colorCode: string;
  onColorChange: (newName: string, newCode: string) => void;
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

export default function EditableColor({
  colorName,
  colorCode,
  onColorChange
}: EditableColorProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [tempName, setTempName] = useState(colorName);
  const [tempCode, setTempCode] = useState(colorCode);
  
  const isLight = isLightColor(colorCode);
  const textColor = isLight ? '#000000' : '#FFFFFF';
  const shadowColor = isLight ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)';

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setTempName(colorName);
    setTempCode(colorCode);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSave = () => {
    onColorChange(tempName, tempCode);
    handleClose();
  };

  const handleCancel = () => {
    setTempName(colorName);
    setTempCode(colorCode);
    handleClose();
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Tooltip title={`색상 편집하기 - ${colorCode}`} arrow>
        <span
          onClick={handleClick}
          style={{
            color: textColor,
            backgroundColor: colorCode,
            fontWeight: 700,
            padding: '2px 6px',
            borderRadius: '4px',
            margin: "0 2px",
            textShadow: `0 1px 2px ${shadowColor}`,
            border: `1px solid ${isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)'}`,
            display: 'inline-block',
            minWidth: 'fit-content',
            cursor: 'pointer',
            textDecoration: 'underline',
            textDecorationColor: '#000000',
            textDecorationThickness: '2px',
            textUnderlineOffset: '2px',
          }}
        >
          {colorName}
        </span>
      </Tooltip>
      
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Box sx={{ p: 3, minWidth: 300 }}>
          <TextField
            label="색상 이름"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            fullWidth
            size="small"
            sx={{ mb: 2 }}
          />
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
            <TextField
              label="색상 코드"
              value={tempCode}
              onChange={(e) => setTempCode(e.target.value)}
              size="small"
              sx={{ flex: 1 }}
              placeholder="#FFD700"
            />
            <input
              type="color"
              value={tempCode}
              onChange={(e) => setTempCode(e.target.value)}
              style={{
                width: '40px',
                height: '40px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            />
          </Box>
          
          <Box 
            sx={{ 
              height: 40, 
              backgroundColor: tempCode, 
              borderRadius: 1, 
              mb: 2,
              border: '1px solid #ccc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isLightColor(tempCode) ? '#000' : '#fff',
              fontWeight: 'bold'
            }}
          >
            {tempName}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button onClick={handleCancel} size="small">
              취소
            </Button>
            <Button onClick={handleSave} variant="contained" size="small">
              저장
            </Button>
          </Box>
        </Box>
      </Popover>
    </>
  );
}