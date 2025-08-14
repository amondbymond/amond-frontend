// Helper to get the correct path with basePath
export const getBasePath = () => {
  return process.env.NODE_ENV === 'production' ? '/service' : '/service';
};

export const withBasePath = (path: string) => {
  // Don't add basePath to external URLs
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) {
    return path;
  }
  
  // Add basePath
  const basePath = getBasePath();
  return path.startsWith('/') ? `${basePath}${path}` : `${basePath}/${path}`;
};