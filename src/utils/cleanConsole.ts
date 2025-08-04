// Clean up console logs from extensions and unnecessary debug messages
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  const originalLog = console.log;
  console.log = (...args) => {
    // Filter out contentScript messages and other noise
    const message = args[0]?.toString() || '';
    if (
      message.includes('contentScript.bundle.js') ||
      message.includes('updating page active status') ||
      message.includes('received intentional event')
    ) {
      return; // Skip these messages
    }
    originalLog.apply(console, args);
  };
}