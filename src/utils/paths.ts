// Helper to get the correct path with basePath
export const getBasePath = () => {
  return process.env.NODE_ENV === 'production' ? '/service' : '/service';
};

export const withBasePath = (path: string) => {
  // Don't add basePath to external URLs
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) {
    return path;
  }
  
  // Next.js automatically handles basePath, so we just return the path as-is
  // The basePath in next.config.js will be automatically prepended
  return path;
};