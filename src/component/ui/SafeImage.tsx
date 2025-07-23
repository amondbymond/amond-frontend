import NextImage, { ImageProps } from 'next/image';
import React from 'react';

// Custom Image component that filters out the fetchPriority prop
export const SafeImage = React.forwardRef<HTMLImageElement, ImageProps>((props, ref) => {
  // Remove fetchPriority from props to avoid React warning
  const { fetchPriority, ...restProps } = props as any;
  
  return <NextImage {...restProps} ref={ref} />;
});

SafeImage.displayName = 'SafeImage';

export default SafeImage;