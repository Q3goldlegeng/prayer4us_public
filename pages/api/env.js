// API route to securely expose environment variables to the client
// This file will be deployed to Vercel as a serverless function

export default function handler(req, res) {
  // Set CORS headers to allow requests from any origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Log for debugging
  console.log('API route called, checking for environment variables');
  
  // Check if the environment variable exists
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY environment variable is not set');
  } else {
    console.log('OPENAI_API_KEY environment variable is set');
  }

  // Return the environment variables
  // Only expose specific variables that are needed by the client
  res.status(200).json({
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || ''
  });
}
