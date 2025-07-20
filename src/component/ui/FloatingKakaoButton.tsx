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
            bgcolor: '#FFC386',
            color: '#000',
            width: 70,
            height: 70,
            zIndex: 1000,
            boxShadow: '0 3px 15px rgba(0, 0, 0, 0.2)',
            border: '2px solid #FFA726',
            '&:hover': {
              bgcolor: '#FFB366',
              transform: 'translateY(-3px) scale(1.05)',
              boxShadow: '0 5px 25px rgba(0, 0, 0, 0.3)',
              color: '#000',
            },
            transition: 'all 0.2s ease-in-out',
            fontSize: 28,
          }}
        >
          💬
        </Fab>
      </Tooltip>
    </Zoom>
  );
}