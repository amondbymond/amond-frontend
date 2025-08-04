import { Box } from "@mui/material";
import { ReactNode } from "react";

interface ScalingWrapperProps {
  children: ReactNode;
  scale?: number;
}

export default function ScalingWrapper({ children, scale = 0.75 }: ScalingWrapperProps) {
  return (
    <Box
      sx={{
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
        width: `${100 / scale}%`,
        height: `${100 / scale}%`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          width: '100%',
          margin: '0 auto',
          maxWidth: `${1440 * scale}px`, // Scale the max container width
        }}
      >
        {children}
      </Box>
    </Box>
  );
}