

const express = require('express');
const app = express();

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const path = require('path');

app.use(express.json());

// --- /api/prayer: Generate prayer or scripture text using Groq or OpenAI ---
app.post('/api/prayer', async (req, res) => {
  const { content, emotion, currentLanguage, prayerLength, topic } = req.body;
  // 首頁情緒 prompt 直接回傳預設陣列
  const emotionPrompts = [
    '首次訪問，請推薦5個常見的情緒狀態',
    '首次访问，请推荐5个常见的情绪状态',
    'First visit, please recommend 5 common emotional states',
    '初回訪問、一般的な感情状態を5つ推薦してください',
    '첫 방문, 일반적인 감정 상태 5가지를 추천해 주세요',
    'Erster Besuch, bitte empfehlen Sie 5 häufige emotionale Zustände',
    'Première visite, veuillez recommander 5 états émotionnels courants',
    'Prima visita, si prega di consigliare 5 stati emotivi comuni',
    'Eerste bezoek, adviseer alstublieft 5 veelvoorkomende emotionele toestanden',
    'Primera visita, por favor recomiende 5 estados emocionales comunes'
  ];
  if (topic && emotionPrompts.includes(topic)) {
    // 根據語言回傳對應情緒
    const emotionsByLang = {
      'zh-Hant': ['焦慮', '悲傷', '孤獨', '壓力', '喜樂', '我有其他狀況'],
      'zh-Hans': ['焦虑', '悲伤', '孤独', '压力', '喜乐', '我有其他状况'],
      'en': ['Anxiety', 'Sadness', 'Loneliness', 'Stress', 'Joy', 'I have another situation'],
      'ja': ['不安', '悲しみ', '孤独', 'ストレス', '喜び', '他の状況があります'],
      'ko': ['불안', '슬픔', '외로움', '스트레스', '기쁨', '다른 상황이 있어요'],
      'de': ['Angst', 'Traurigkeit', 'Einsamkeit', 'Stress', 'Freude', 'Ich habe eine andere Situation'],
      'fr': ['Anxiété', 'Tristesse', 'Solitude', 'Stress', 'Joie', "J'ai une autre situation"],
      'it': ['Ansia', 'Tristezza', 'Solitudine', 'Stress', 'Gioia', "Ho un'altra situazione"],
      'nl': ['Angst', 'Verdriet', 'Eenzaamheid', 'Stress', 'Vreugde', 'Ik heb een andere situatie'],
      'es': ['Ansiedad', 'Tristeza', 'Soledad', 'Estrés', 'Alegría', 'Tengo otra situación']
    };
    const lang = currentLanguage || 'zh-Hant';
    return res.json({ result: emotionsByLang[lang] || emotionsByLang['zh-Hant'] });
  }

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
    res.json(data); // 回傳完整 Groq/OpenAI API 格式，前端可正確解析 choices[0].message.content
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
    // 回傳完整 Groq/OpenAI API 格式，前端可正確解析
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'API call failed', detail: err.message });
  }
});


// --- /api/google-tts: Google Cloud Text-to-Speech ---
const { GoogleAuth } = require('google-auth-library');
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
        name: voiceName || undefined // 可選: 指定 voiceName
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate
      }
    };
    const ttsRes = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ttsBody)
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
    res.json({ audioContent: ttsData.audioContent });
  } catch (err) {
    res.status(500).json({ error: 'Google TTS call failed', detail: err.message });
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
