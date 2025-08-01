require('dotenv').config();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const express = require('express');
const path = require('path');
const app = express();


app.use(express.json());

// -------- OpenAI API 產生禱告或經文 --------


app.post('/api/gemini', async (req, res) => {

  

  const { content, emotion, currentLanguage = 'zh-Hant', prayerLength = 100, topic } = req.body;

  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key not set in environment.' });
  }

  // 判斷是否為英文
  const isEnglish = currentLanguage.toLowerCase().startsWith('en');

  // 組 prompt
  let userPrompt = '';
  if (content) {
    userPrompt = content;
  } else if (emotion) {
    userPrompt = isEnglish
      ? `Please write a prayer of about ${prayerLength} words for the emotion "${emotion}", including a related Bible verse and a brief explanation in English.`
      : `請針對「${emotion}」的情緒，寫一段約${prayerLength}字的禱告文，並附上合適的聖經經文與簡短解說。請使用繁體中文。`;
  } else if (topic) {
    userPrompt = isEnglish
      ? `Please write a prayer of about ${prayerLength} words on the topic: "${topic}". Include a related Bible verse at the end. Use English.`
      : `請用繁體中文寫一段約${prayerLength}字的禱告文，主題是「${topic}」。請附上相關的聖經經文與簡短解說。`;
  } else {
    return res.status(400).json({ error: 'Missing content, emotion, or topic.' });
  }

  // 明確要求標籤分段輸出
  const promptWithTags = isEnglish
    ? `Please respond in three parts with the exact tags shown below, all in English:

<prayer>Prayer text here</prayer>
<scripture>Bible verse here</scripture>
<explanation>Brief explanation here</explanation>

Based on the following instructions: ${userPrompt}`
    : `請用繁體中文回覆，並用以下標籤分三段：
<prayer>禱告文內容</prayer>
<scripture>聖經經文</scripture>
<explanation>簡短解說</explanation>

根據以下的指示作答：${userPrompt}`;
  
  try {
    // 呼叫 OpenAI Chat Completion API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // 或你有的其他模型名稱
        messages: [
          { role: 'system', content: 'You are a helpful assistant that responds with the given structured tags.' },
          { role: 'user', content: promptWithTags }
        ],
        max_tokens: 800,
        temperature: 0.7,
        n: 1,
        stop: null
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenAI API error detail:', errText);
      return res.status(response.status).json({ error: 'OpenAI API error', detail: errText });
    }

    const data = await response.json();
    const fullText = data.choices?.[0]?.message?.content || '';
    console.log('[Debug] OpenAI 回傳內容全文：', fullText);
    
    // 用正則提取三段標籤中的內容
    const prayerMatch = fullText.match(/<prayer>([\s\S]*?)<\/prayer>/i);
    const scriptureMatch = fullText.match(/<scripture>([\s\S]*?)<\/scripture>/i);
    const explanationMatch = fullText.match(/<explanation>([\s\S]*?)<\/explanation>/i);

    const prayer = prayerMatch ? prayerMatch[1].trim() : '';
    const scripture = scriptureMatch ? scriptureMatch[1].trim() : '';
    const explanation = explanationMatch ? explanationMatch[1].trim() : '';

    return res.json({ prayer, scripture, explanation });

  } catch (err) {
    console.error('OpenAI API call failed:', err);
    return res.status(500).json({ error: 'OpenAI API call failed', detail: err.message });
  }
});



// --- /api/openai-tts: OpenAI Text-to-Speech ---


app.post('/api/openai-tts', async (req, res) => {
  const { text, voice = 'alloy', model = 'tts-1', speed = 1.0 } = req.body;

  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key not set in environment.' });
  }

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Missing or invalid text.' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,      // tts-1 或 tts-1-hd
        input: text,
        voice,      // alloy, echo, fable, onyx, nova, shimmer
        speed       // 0.25 ~ 4.0
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(500).json({ error: 'OpenAI TTS API error', detail: errText });
    }

    // OpenAI 回傳二進位音訊，轉為 base64
    const arrayBuffer = await response.arrayBuffer();
    const base64audio = Buffer.from(arrayBuffer).toString('base64');
    
    return res.json({ audioContent: base64audio });
  } catch (err) {
    return res.status(500).json({ error: 'OpenAI TTS call failed', detail: err.message });
  }
});



// --- /api/google-tts: Google Cloud Text-to-Speech ---
const GOOGLE_TTS_API_KEY = process.env.GOOGLE_TTS_API_KEY;

app.post('/api/google-tts', async (req, res) => {
  const { text, languageCode = 'zh-TW', voiceName, speakingRate = 1.0 } = req.body;

  if (!GOOGLE_TTS_API_KEY) {
    return res.status(500).json({ error: 'Google TTS API key not set in environment.' });
  }

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Missing or invalid text.' });
  }

  try {
    const apiUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_API_KEY}`;
    const ttsBody = {
      input: { text },
      voice: {
        languageCode,
        name: voiceName || undefined, // optional
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate,
      },
    };

    const ttsRes = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ttsBody),
    });

    if (!ttsRes.ok) {
      const errText = await ttsRes.text();
      return res.status(500).json({ error: 'Google TTS API error', detail: errText });
    }

    const ttsData = await ttsRes.json();

    if (!ttsData.audioContent) {
      return res.status(500).json({ error: 'No audioContent in TTS response.' });
    }

    // 回傳 base64 音訊
    return res.json({ audioContent: ttsData.audioContent });

  } catch (err) {
    return res.status(500).json({ error: 'Google TTS call failed', detail: err.message });
  }
});

// --- /api/counter: 計數器 (內存) ---
let counter = 0;

app.get('/api/counter', (req, res) => {
  res.json({ count: counter });
});

app.post('/api/counter', (req, res) => {
  counter++;
  res.json({ count: counter });
});

// --- /api/env: 回傳安全環境資訊 ---
app.get('/api/env', (req, res) => {
  res.json({ NODE_ENV: process.env.NODE_ENV || 'production' });
});

// 靜態檔案設定
app.use(express.static(path.join(__dirname, 'public')));
app.use('/js', express.static(path.join(__dirname, '..', 'js')));
app.use('/css', express.static(path.join(__dirname, '..', 'css')));
app.use(express.static(__dirname)); // 支援根目錄 favicon.ico

// fallback 路由，啟用 SPA 支援
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 靜態檔案與 SPA fallback
app.use(express.static(path.join(__dirname, 'public')));
app.use('/js', express.static(path.join(__dirname, '..', 'js')));
app.use('/css', express.static(path.join(__dirname, '..', 'css')));
app.use(express.static(__dirname));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 啟動服務
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
