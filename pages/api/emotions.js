// API route to generate emotions using OpenAI API
// This file will be deployed to Vercel as a serverless function

export default async function handler(req, res) {
  // Set CORS headers to allow requests from any origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Get the request body
    const { context, currentLanguage, otherSituation } = req.body;
    
    if (!context || !currentLanguage) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Prepare the prompt based on language
    const promptContent = `根據以下情境提供5個${currentLanguage === 'en' ? '英文' : currentLanguage === 'ja' ? '日文' : currentLanguage === 'ko' ? '韓文' : '中文'}情緒狀態(不要編號)，最後加「${otherSituation}」，用空格分隔：
    情境：${context}
    範例輸出：${currentLanguage === 'en' ? 'Anxiety Sadness Loneliness Stress Joy ' + otherSituation : 
              currentLanguage === 'ja' ? '不安 悲しみ 孤独 ストレス 喜び ' + otherSituation : 
              currentLanguage === 'ko' ? '불안 슬픔 외로움 스트레스 기쁨 ' + otherSituation : 
              '焦慮 悲傷 孤獨 壓力 喜樂 ' + otherSituation}`;

    // Make the request to OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{
          role: 'user',
          content: promptContent
        }],
        max_tokens: 100,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      return res.status(response.status).json({ 
        error: 'Error from OpenAI API', 
        details: errorData
      });
    }

    const data = await response.json();
    
    if (!data?.choices?.[0]?.message?.content) {
      return res.status(500).json({ error: 'Invalid API response structure' });
    }

    // Return the emotions
    const emotions = data.choices[0].message.content.split(' ');
    return res.status(200).json({ emotions });
    
  } catch (error) {
    console.error('Error generating emotions:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}
