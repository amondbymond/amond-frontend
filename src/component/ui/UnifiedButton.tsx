import { Button, ButtonProps } from '@mui/material';

type UnifiedButtonVariant = 'colored' | 'white';

interface UnifiedButtonProps extends Omit<ButtonProps, 'variant' | 'color'> {
  variant?: UnifiedButtonVariant;
}

export default function UnifiedButton({ 
  variant = 'colored', 
  children, 
  sx = {},
  ...props 
}: UnifiedButtonProps) {
  if (variant === 'white') {
    return (
      <Button
        variant="contained"
        sx={{
          bgcolor: "#FFF3E0",
          color: "#FF9800",
          fontWeight: 700,
          borderRadius: 2,
          '&:hover': { bgcolor: "#FFE0B2" },
          '&:disabled': {
            bgcolor: "#f5f5f5",
            color: "#999",
          },
          ...sx
        }}
        {...props}
      >
        {children}
      </Button>
    );
  }
  
  return (
    <Button
      variant="contained"
      color="warning"
      sx={{
        fontWeight: 700,
        borderRadius: 2,
        '&:disabled': {
          bgcolor: "#f5f5f5",
          color: "#999",
        },
        ...sx
      }}
      {...props}
    >
      {children}
    </Button>
  );
}