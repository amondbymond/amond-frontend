import { Fab, Tooltip, Zoom } from '@mui/material';
import { useState } from 'react';

export default function FloatingKakaoButton() {
  const [isVisible, setIsVisible] = useState(true);

  const handleClick = () => {
    window.open("http://pf.kakao.com/_CjqWn/chat", "_blank");
  };

  return (
    <Zoom in={isVisible}>
      <Tooltip 
        title="카카오 문의하기" 
        arrow 
        placement="left"
        sx={{
          '& .MuiTooltip-tooltip': {
            bgcolor: '#333',
            color: '#fff',
            fontWeight: 500,
            fontSize: 12,
          },
          '& .MuiTooltip-arrow': {
            color: '#333',
          },
        }}
      >
        <Fab
          onClick={handleClick}
          sx={{
            position: 'fixed',
            bottom: 30,
            right: 30,
            bgcolor: '#FFFDE7',
            color: '#F57C00',
            width: 56,
            height: 56,
            zIndex: 1000,
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            '&:hover': {
              bgcolor: '#FFF8E1',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
              color: '#333',
            },
            transition: 'all 0.2s ease-in-out',
            fontSize: 20,
          }}
        >
          💬
        </Fab>
      </Tooltip>
    </Zoom>
  );
}