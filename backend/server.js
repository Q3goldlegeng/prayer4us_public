require('dotenv').config();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const express = require('express');
const path = require('path');
const app = express();


app.use(express.json());

// -------- OpenAI API 產生禱告或經文 --------



app.post('/api/OpenAI', async (req, res) => {
  const { content, emotion, currentLanguage = 'zh-Hant', prayerLength = 200, topic } = req.body;

  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key not set in environment.' });
  }

  // 多語言標籤與描述
  const langMap = {
    'zh-hant': {
      name: '繁體中文',
      prayer: '禱告文內容',
      scripture: '聖經經文',
      explanation: '簡短解說',
      prompt: (emotion, topic) =>
        emotion
          ? `請針對「${emotion}」的情緒，寫一段約${prayerLength}字的禱告文，並附上合適的聖經經文與簡短解說。請使用繁體中文。`
          : `請用繁體中文寫一段約${prayerLength}字的禱告文，主題是「${topic}」。請附上相關的聖經經文與簡短解說。`
    },
    'zh-hans': {
      name: '简体中文',
      prayer: '祷告文内容',
      scripture: '圣经经文',
      explanation: '简短解说',
      prompt: (emotion, topic) =>
        emotion
          ? `请针对「${emotion}」的情绪，写一段约${prayerLength}字的祷告文，并附上合适的圣经经文与简短解说。请使用简体中文。`
          : `请用简体中文写一段约${prayerLength}字的祷告文，主题是「${topic}」。请附上相关的圣经经文与简短解说。`
    },
    'en': {
      name: 'English',
      prayer: 'Prayer text here',
      scripture: 'Bible verse here',
      explanation: 'Brief explanation here',
      prompt: (emotion, topic) =>
        emotion
          ? `Please write a prayer of about ${prayerLength} words for the emotion "${emotion}", including a related Bible verse and a brief explanation in English.`
          : `Please write a prayer of about ${prayerLength} words on the topic: "${topic}". Include a related Bible verse and a brief explanation in English.`
    },
    'ja': {
      name: '日本語',
      prayer: '祈りの文',
      scripture: '聖書の言葉',
      explanation: '簡単な説明',
      prompt: (emotion, topic) =>
        emotion
          ? `「${emotion}」という感情について、約${prayerLength}文字の祈りの文を書き、関連する聖書の言葉と簡単な説明を日本語で添えてください。`
          : `テーマ「${topic}」について、約${prayerLength}文字の祈りの文を書き、関連する聖書の言葉と簡単な説明を日本語で添えてください。`
    },
    'ko': {
      name: '한국어',
      prayer: '기도문 내용',
      scripture: '성경 구절',
      explanation: '간단한 설명',
      prompt: (emotion, topic) =>
        emotion
          ? `감정 "${emotion}"에 대해 약 ${prayerLength}자 분량의 기도문을 작성하고, 관련 성경 구절과 간단한 설명을 한국어로 포함해 주세요.`
          : `주제 "${topic}"에 대해 약 ${prayerLength}자 분량의 기도문을 작성하고, 관련 성경 구절과 간단한 설명을 한국어로 포함해 주세요.`
    }
    // 可自行擴充更多語言
  };

  // 取得語言設定，預設繁體中文
  const langKey = Object.keys(langMap).find(key => currentLanguage.toLowerCase().startsWith(key)) || 'zh-hant';
  const lang = langMap[langKey];

  // 組 prompt
  let userPrompt = '';
  if (content) {
    userPrompt = content;
  } else if (emotion || topic) {
    userPrompt = lang.prompt(emotion, topic);
  } else {
    return res.status(400).json({ error: 'Missing content, emotion, or topic.' });
  }

  // 明確要求標籤分段輸出
  const promptWithTags =
    `請以${lang.name}回覆，並用以下標籤分三段：
<prayer>${lang.prayer}</prayer>
<scripture>${lang.scripture}</scripture>
<explanation>${lang.explanation}</explanation>

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
        model: 'gpt-4',
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
        model,     
        input: text,
        voice,      
        speed       
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
