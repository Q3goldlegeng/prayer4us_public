import { createClient } from 'redis';
import { NextResponse } from 'next/server'; // Although not strictly needed for this file's logic, good practice if expanding

// Redis Key for the counter data
const COUNTER_KEY = 'prayer4us:counter';

// Initialize counter data structure (used if no data in Redis)
const initialData = {
  total: {
    visits: 0,
    audioGenerated: 0
  },
  languages: {
    'zh-Hant': { visits: 0, audioGenerated: 0 },
    'zh-Hans': { visits: 0, audioGenerated: 0 },
    'en': { visits: 0, audioGenerated: 0 },
    'ja': { visits: 0, audioGenerated: 0 },
    'ko': { visits: 0, audioGenerated: 0 },
    'de': { visits: 0, audioGenerated: 0 },
    'fr': { visits: 0, audioGenerated: 0 },
    'it': { visits: 0, audioGenerated: 0 },
    'nl': { visits: 0, audioGenerated: 0 },
    'es': { visits: 0, audioGenerated: 0 }
  }
};

// Initialize Redis client
let redisClient;
async function getRedisClient() {
    if (!redisClient) {
        if (!process.env.REDIS_URL) {
            console.error('⚠️ REDIS_URL environment variable is missing.');
            throw new Error('Redis configuration is missing.');
        }
        try {
            console.log('[Counter API] Connecting to Redis...');
            const client = createClient({ url: process.env.REDIS_URL });
            client.on('error', (err) => console.error('[Counter API] Redis Client Error', err));
            await client.connect();
            redisClient = client;
            console.log('[Counter API] Connected to Redis successfully.');
        } catch (error) {
            console.error('[Counter API] Failed to connect to Redis:', error);
            throw error; // Re-throw to indicate connection failure
        }
    }
    return redisClient;
}

// Function to read counter data from Redis or initialize if not exists
async function getCounterData() {
  try {
    const client = await getRedisClient();
    console.log(`[Counter API] Attempting to GET data from Redis key: ${COUNTER_KEY}`);
    const jsonData = await client.get(COUNTER_KEY);
    
    if (!jsonData) {
      console.log(`[Counter API] No data found for key ${COUNTER_KEY}. Returning initial data.`);
      // Counter doesn't exist yet, return initial data
      return initialData;
    }
    
    console.log(`[Counter API] Data retrieved from Redis for key ${COUNTER_KEY}. Parsing JSON.`);
    // Parse the JSON data
    return JSON.parse(jsonData);
  } catch (error) {
    console.error('[Counter API] Error reading counter data from Redis:', error);
    // Return initial data in case of error to prevent breaking the app
    console.warn('[Counter API] Returning initial data due to Redis read error.');
    return initialData;
  }
}

// Function to update counter data in Redis
async function updateCounterData(data) {
  try {
    const client = await getRedisClient();
    // Convert data to JSON string
    const jsonData = JSON.stringify(data, null, 2);
    console.log(`[Counter API] Attempting to SET data to Redis key: ${COUNTER_KEY}`);
    await client.set(COUNTER_KEY, jsonData);
    console.log(`[Counter API] Successfully SET data for key ${COUNTER_KEY}`);
    return true;
  } catch (error) {
    console.error('[Counter API] Error updating counter data in Redis:', error);
    return false;
  }
}

// Main API Handler
export default async function handler(req, res) {
  console.log(`[Counter API] Received request: ${req.method} ${req.url}`); 
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    console.log('[Counter API] Responding to OPTIONS request.');
    res.status(200).end();
    return;
  }

  console.log('[Counter API] Processing request...'); 
  try {
    // Get current counter data
    console.log('[Counter API] Fetching current counter data...'); 
    let counterData = await getCounterData();
    console.log('[Counter API] Current counter data fetched:', JSON.stringify(counterData)); 
    
    if (req.method === 'POST') {
      console.log('[Counter API] Processing POST request. Body:', req.body); 
      const { action, language } = req.body;
      const validLanguages = ['zh-Hant', 'zh-Hans', 'en', 'ja', 'ko', 'de', 'fr', 'it', 'nl', 'es'];
      
      // Validate language
      if (!language || !validLanguages.includes(language)) {
        console.warn(`[Counter API] Invalid or missing language received: ${language}`); 
        return res.status(400).json({ error: 'Invalid or missing language' });
      }
      console.log(`[Counter API] Action: ${action}, Language: ${language}`); 

      if (action === 'visit') {
        console.log('[Counter API] Incrementing visit count...'); 
        // Ensure language key exists
        if (!counterData.languages[language]) counterData.languages[language] = { visits: 0, audioGenerated: 0 };
        // Increment total visits
        counterData.total.visits = (counterData.total.visits || 0) + 1;
        // Increment language-specific visits
        counterData.languages[language].visits = (counterData.languages[language].visits || 0) + 1;
        console.log('[Counter API] Visit count incremented.'); 
      } else if (action === 'audio') {
        console.log('[Counter API] Incrementing audio generation count...'); 
        // Ensure language key exists
        if (!counterData.languages[language]) counterData.languages[language] = { visits: 0, audioGenerated: 0 };
        // Increment total audio generations
        counterData.total.audioGenerated = (counterData.total.audioGenerated || 0) + 1;
        // Increment language-specific audio generations
        counterData.languages[language].audioGenerated = (counterData.languages[language].audioGenerated || 0) + 1;
        console.log('[Counter API] Audio generation count incremented.'); 
      } else {
        console.warn(`[Counter API] Invalid action received: ${action}`); 
        return res.status(400).json({ error: 'Invalid action' });
      }

      console.log('[Counter API] Updated counter data:', JSON.stringify(counterData)); 
      // Save updated counter data
      console.log('[Counter API] Attempting to update counter data in Redis...'); 
      const success = await updateCounterData(counterData);
      if (!success) {
        console.error('[Counter API] Failed to update counter data in Redis.'); 
        return res.status(500).json({ error: 'Failed to update counter data' });
      }
      console.log('[Counter API] Successfully updated counter data in Redis.'); 

      return res.status(200).json({ success: true, data: counterData });
    } else if (req.method === 'GET') {
      console.log('[Counter API] Processing GET request.'); 
      // Return counter data for GET requests
      return res.status(200).json(counterData);
    } else {
      console.warn(`[Counter API] Method not allowed: ${req.method}`); 
      res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']); // Inform client about allowed methods
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('[Counter API] Error processing request:', error); 
    // Check if it's a Redis connection error
    if (error.message.includes('Redis configuration is missing') || error.message.includes('Failed to connect to Redis')) {
        return res.status(503).json({ error: 'Service Unavailable: Counter service cannot connect to storage.' });
    }
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
