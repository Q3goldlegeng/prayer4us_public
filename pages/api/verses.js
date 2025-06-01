// API route to generate verses using OpenAI API
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
    const { emotion, currentLanguage, scriptureKey, explanationKey, prayerKey } = req.body;
    
    if (!emotion || !currentLanguage) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Prepare the prompt based on language
    const promptContent = `請針對「${emotion}」情緒：
    1. 提供合適聖經經文(格式：『經文』書名 章:節)${currentLanguage === 'en' || currentLanguage === 'ja' || currentLanguage === 'ko' ? '只需' + (currentLanguage === 'en' ? '英文' : currentLanguage === 'ja' ? '日文' : '韓文') : '同時提出中英文'}
    2. 簡明的解說，50字內，${currentLanguage === 'en' ? '用英文' : currentLanguage === 'zh-Hans' ? '用简体中文' : currentLanguage === 'ja' ? '用日文' : currentLanguage === 'ko' ? '用韓文' : '用繁體中文'}
    3. 禱告詞，你是一個資深慈愛的牧師，同情用戶的狀態，深情地為用戶禱告，為用戶設身處地思考，祈求上帝給用戶安慰和力量，用華麗的辭藻，用詩歌般的語言，用最真摯的情感，寫出最感人的禱告詞，激發用戶的感受，讓靈性灌注與降臨，${currentLanguage === 'en' ? '用英文' : currentLanguage === 'zh-Hans' ? '用简体中文' : currentLanguage === 'ja' ? '用日文' : currentLanguage === 'ko' ? '用韓文' : '用繁體中文'}
    請用以下格式回應：
    【${scriptureKey}】{內容}
    【${explanationKey}】{解說}
    【${prayerKey}】{禱告詞}`;

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
        max_tokens: 300,
        temperature: 0.8
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

    const responseText = data.choices[0].message.content.trim();
    
    // Parse the response
    const verseMatch = responseText.match(new RegExp(`【${scriptureKey}】([\\s\\S]+?)\\n【${explanationKey}】`));
    const comfortMatch = responseText.match(new RegExp(`【${explanationKey}】([\\s\\S]+?)\\n【${prayerKey}】`));
    const prayerMatch = responseText.match(new RegExp(`【${prayerKey}】([\\s\\S]+)`));

    if (!verseMatch || !comfortMatch || !prayerMatch) {
      return res.status(500).json({ 
        error: 'Failed to parse response', 
        responseText 
      });
    }

    // Return the parsed response
    return res.status(200).json({
      scripture: verseMatch[1].trim(),
      explanation: comfortMatch[1].trim(),
      prayer: prayerMatch[1].trim(),
      emotion: emotion
    });
    
  } catch (error) {
    console.error('Error generating verse:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}
