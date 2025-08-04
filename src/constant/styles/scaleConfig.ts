// Global scaling configuration to make the default view look like 75% zoom
export const SCALE_FACTOR = 0.75;

// Helper function to scale pixel values
export const scale = (value: number): string => {
  return `${Math.round(value * SCALE_FACTOR)}px`;
};

// Helper function to scale rem values
export const scaleRem = (value: number): string => {
  return `${value * SCALE_FACTOR}rem`;
};

// Scaled spacing values (original * 0.75)
export const scaledSpacing = {
  xs: scale(8),   // 6px
  sm: scale(16),  // 12px
  md: scale(24),  // 18px
  lg: scale(32),  // 24px
  xl: scale(48),  // 36px
  xxl: scale(64), // 48px
};

// Scaled font sizes
export const scaledFontSizes = {
  xs: scale(12),   // 9px
  sm: scale(14),   // 10.5px
  base: scale(16), // 12px
  lg: scale(18),   // 13.5px
  xl: scale(20),   // 15px
  xxl: scale(24),  // 18px
  xxxl: scale(32), // 24px
  h1: scale(48),   // 36px
  h2: scale(40),   // 30px
  h3: scale(32),   // 24px
  h4: scale(24),   // 18px
  h5: scale(20),   // 15px
  h6: scale(18),   // 13.5px
};

// Scaled component sizes
export const scaledSizes = {
  buttonHeight: {
    sm: scale(32),  // 24px
    md: scale(40),  // 30px
    lg: scale(48),  // 36px
  },
  inputHeight: {
    sm: scale(36),  // 27px
    md: scale(44),  // 33px
    lg: scale(52),  // 39px
  },
  modalWidth: {
    sm: scale(400),  // 300px
    md: scale(600),  // 450px
    lg: scale(800),  // 600px
  }
};

// Scaled border radius
export const scaledBorderRadius = {
  sm: scale(4),   // 3px
  md: scale(8),   // 6px
  lg: scale(12),  // 9px
  xl: scale(16),  // 12px
  full: '50%',
};