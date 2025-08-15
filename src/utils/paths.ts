// Helper to get the correct path with basePath
export const getBasePath = () => {
  // No basePath needed since we're handling routing at infrastructure level
  return '';
};

export const withBasePath = (path: string) => {
  // Don't add basePath to external URLs
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) {
    return path;
  }
  
  // Just return the path as-is
  return path;
};