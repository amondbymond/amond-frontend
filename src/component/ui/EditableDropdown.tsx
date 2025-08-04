import React, { useState, useEffect } from 'react';
import { Box, Select, MenuItem, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { primaryColor } from '@/constant/styles/styleTheme';

interface EditableDropdownProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  sx?: any;
}

export default function EditableDropdown({ 
  options, 
  value, 
  onChange, 
  label,
  sx 
}: EditableDropdownProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    onChange(newValue);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          cursor: 'pointer',
          borderRadius: 1,
          px: 1,
          py: 0.5,
          backgroundColor: 'rgba(255, 152, 0, 0.08)',
          border: '1px dashed transparent',
          transition: 'all 0.2s',
          '&:hover': {
            backgroundColor: 'rgba(255, 152, 0, 0.12)',
            borderColor: primaryColor,
          },
          ...sx
        }}
        onClick={() => setIsEditing(true)}
      >
        <Typography sx={{ 
          fontWeight: 600, 
          fontSize: 'inherit',
          color: primaryColor 
        }}>
          {localValue}
        </Typography>
        <EditIcon sx={{ fontSize: 16, color: '#666' }} />
      </Box>
    );
  }

  return (
    <Select
      value={localValue}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={() => setIsEditing(false)}
      size="small"
      autoFocus
      sx={{
        minWidth: 120,
        '& .MuiSelect-select': {
          py: 0.5,
          fontSize: 'inherit',
          fontWeight: 600,
        },
        ...sx
      }}
    >
      {options.map((option) => (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      ))}
    </Select>
  );
}