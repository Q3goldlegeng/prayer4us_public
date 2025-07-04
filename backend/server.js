require('dotenv').config();
console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY);

const express = require('express');
const app = express();

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const path = require('path');

app.use(express.json());

// --- /api/prayer: Generate prayer or scripture text using Groq or OpenAI ---
app.post('/api/prayer', async (req, res) => {
  const { content, emotion, currentLanguage, prayerLength, topic } = req.body;
  // Prefer Groq, fallback to OpenAI if not set
  const groqKey = process.env.GROQ_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  let apiKey, apiUrl, model, systemPrompt;

  if (groqKey) {
    apiKey = groqKey;
    apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
    model = 'llama3-70b-8192';
    systemPrompt = '你是一位溫柔誠懇的基督徒禱告助手。';
  } else if (openaiKey) {
    apiKey = openaiKey;
    apiUrl = 'https://api.openai.com/v1/chat/completions';
    model = 'gpt-3.5-turbo';
    systemPrompt = 'You are a gentle and sincere Christian prayer assistant.';
  } else {
    return res.status(500).json({ error: 'No API key set in environment.' });
  }

  // Compose prompt
  let userPrompt = '';
  if (content) {
    userPrompt = content;
  } else if (emotion) {
    userPrompt = `請針對「${emotion}」情緒，寫一段禱告文，長度約${prayerLength || 100}字，並附上合適的聖經經文與簡短解說。語言：${currentLanguage || 'zh-Hant'}`;
  } else if (topic) {
    userPrompt = `請用繁體中文寫一段 100 字內的禱告文，主題是：「${topic}」。最後請加上一句對應的聖經經文出處。`;
  } else {
    return res.status(400).json({ error: 'Missing content, emotion, or topic.' });
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1200
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(500).json({ error: 'API error', detail: errText });
    }
    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || '';
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: 'API call failed', detail: err.message });
  }
});

// --- /api/groq: 代理 Groq chat/completions ---
app.post('/api/groq', async (req, res) => {
  const { content, emotion, currentLanguage, prayerLength, topic } = req.body;
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Groq API key not set in environment.' });
  }

  // 組合 prompt
  let userPrompt = '';
  if (content) {
    userPrompt = content;
  } else if (emotion) {
    userPrompt = `請針對「${emotion}」情緒，寫一段禱告文，長度約${prayerLength || 100}字，並附上合適的聖經經文與簡短解說。語言：${currentLanguage || 'zh-Hant'}`;
  } else if (topic) {
    userPrompt = `請用繁體中文寫一段 100 字內的禱告文，主題是：「${topic}」。最後請加上一句對應的聖經經文出處。`;
  } else {
    return res.status(400).json({ error: 'Missing content, emotion, or topic.' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: [
          { role: 'system', content: '你是一位溫柔誠懇的基督徒禱告助手。' },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1200
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(500).json({ error: 'Groq API error', detail: errText });
    }
    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || '';
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: 'API call failed', detail: err.message });
  }
});

// --- /api/audio: 代理 Groq audio/speech ---
app.post('/api/audio', async (req, res) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Groq API key not set in environment.' });
  }
  const { model, voice, input, response_format, instructions } = req.body;
  if (!model || !voice || !input || !response_format) {
    return res.status(400).json({ error: 'Missing required audio parameters.' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify({
        model,
        voice,
        input,
        response_format,
        ...(instructions ? { instructions } : {})
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(500).json({ error: 'Groq Audio API error', detail: errText });
    }

    // Stream audio to frontend
    res.setHeader('Content-Type', 'audio/mpeg');
    response.body.pipe(res);
  } catch (err) {
    res.status(500).json({ error: 'Audio API call failed', detail: err.message });
  }
});


// --- /api/counter: 最簡單的記憶體計數器 ---
let counter = 0;
app.get('/api/counter', (req, res) => {
  res.json({ count: counter });
});
app.post('/api/counter', (req, res) => {
  counter++;
  res.json({ count: counter });
});

// --- /api/env: 回傳環境變數（僅回傳安全資訊，勿回傳金鑰） ---
app.get('/api/env', (req, res) => {
  res.json({ NODE_ENV: process.env.NODE_ENV || 'production' });
});


// 靜態檔案服務，支援 favicon.ico、js、css 等靜態資源
app.use(express.static(path.join(__dirname, 'public')));
app.use('/js', express.static(path.join(__dirname, '..', 'js')));
app.use('/css', express.static(path.join(__dirname, '..', 'css')));
app.use(express.static(__dirname)); // 兼容 favicon.ico 在根目錄

// fallback 路由必須在所有 API 路由和靜態檔案服務之後
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
