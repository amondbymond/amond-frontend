// Custom hook to provide scaled values throughout the app
export const useScaledTheme = () => {
  const SCALE_FACTOR = 0.75;
  
  // Helper to scale pixel values
  const scale = (value: number): string => {
    return `${Math.round(value * SCALE_FACTOR)}px`;
  };
  
  // Helper to scale numeric values (returns number)
  const scaleNumber = (value: number): number => {
    return Math.round(value * SCALE_FACTOR);
  };
  
  return {
    scale,
    scaleNumber,
    // Common scaled values
    navBarHeight: { xs: scale(44), md: scale(59) }, // 33px, 44px
    spacing: {
      xs: scale(8),   // 6px
      sm: scale(16),  // 12px
      md: scale(24),  // 18px
      lg: scale(32),  // 24px
      xl: scale(48),  // 36px
    },
    fontSize: {
      xs: scale(12),   // 9px
      sm: scale(14),   // 10.5px
      base: scale(16), // 12px
      lg: scale(18),   // 13.5px
      xl: scale(20),   // 15px
      xxl: scale(24),  // 18px
    },
    buttonSize: {
      small: {
        height: scale(32), // 24px
        fontSize: scale(13), // 10px
      },
      medium: {
        height: scale(40), // 30px
        fontSize: scale(14), // 10.5px
      },
      large: {
        height: scale(48), // 36px
        fontSize: scale(16), // 12px
      }
    }
  };
};