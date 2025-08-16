#!/usr/bin/env node

// Check for required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_API_URL'
];

console.log('Checking environment variables...');

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn('⚠️  Missing environment variables:', missingVars);
  console.warn('These might be required for the build process.');
} else {
  console.log('✅ All required environment variables are present');
}

// Log current environment for debugging
console.log('Current NODE_ENV:', process.env.NODE_ENV);
console.log('Current NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL ? 'Set' : 'Not set');

