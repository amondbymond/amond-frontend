// Helper to get the correct path with basePath
export const getBasePath = () => {
  // Return empty string because Next.js handles basePath automatically
  return '';
};

export const withBasePath = (path: string) => {
  // Don't add basePath to external URLs
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) {
    return path;
  }
  
  // Next.js automatically handles basePath when it's set in next.config.js
  // So we just return the path as-is
  return path;
};