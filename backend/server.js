const express = require('express');
const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '..', '.env')
});

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GOOGLE_TTS_API_KEY = process.env.GOOGLE_TTS_API_KEY;

const app = express();
app.use(express.json());

const userUsage = {};
let counter = 0;
const isProduction = process.env.NODE_ENV === 'production';
const RATE_LIMIT_MAX = Number(process.env.OPENAI_RATE_LIMIT_MAX || 5);
const RATE_LIMIT_WINDOW_MS = Number(process.env.OPENAI_RATE_LIMIT_WINDOW_MS || 60 * 60 * 1000);

function getLanguageInstruction(currentLanguage) {
  const languageInstructions = {
    'zh-hant': 'Write in Traditional Chinese.',
    'zh-hans': 'Write in Simplified Chinese.',
    en: 'Write in English.',
    ja: 'Write in Japanese.',
    ko: 'Write in Korean.'
  };

  const lang = String(currentLanguage || 'zh-Hant').toLowerCase();
  return (
    Object.entries(languageInstructions).find(([key]) => lang.startsWith(key))?.[1] ||
    'Write in Traditional Chinese.'
  );
}

function extractTag(text, tag) {
  const match = text.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? match[1].trim() : '';
}

app.post('/api/OpenAI', async (req, res) => {
  const userIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  if (isProduction) {
    const now = Date.now();
    const usage = userUsage[userIp];

    if (!usage || usage.resetAt <= now) {
      userUsage[userIp] = {
        count: 1,
        resetAt: now + RATE_LIMIT_WINDOW_MS
      };
    } else {
      usage.count += 1;
    }

    if (userUsage[userIp].count > RATE_LIMIT_MAX) {
      return res.status(429).json({
        error: `已達使用上限（${RATE_LIMIT_MAX}次）`,
        detail: `請稍後再試，或在伺服器設定 OPENAI_RATE_LIMIT_MAX / OPENAI_RATE_LIMIT_WINDOW_MS。`
      });
    }
  }

  const { content, emotion, currentLanguage = 'zh-Hant', prayerLength = 200, topic } = req.body;

  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key not set in environment.' });
  }

  let messages;

  if (content) {
    messages = [
      {
        role: 'system',
        content: 'You are a precise assistant. Follow the requested output format exactly.'
      },
      {
        role: 'user',
        content
      }
    ];
  } else if (emotion || topic) {
    const subject = emotion || topic;
    messages = [
      {
        role: 'system',
        content: [
          'You write short pastoral prayer content.',
          getLanguageInstruction(currentLanguage),
          'Return only these XML tags with no extra commentary:',
          '<scripture>...</scripture>',
          '<explanation>...</explanation>',
          '<prayer>...</prayer>'
        ].join(' ')
      },
      {
        role: 'user',
        content: [
          `Topic or emotion: ${subject}`,
          `Prayer length target: about ${prayerLength} words.`,
          'Requirements:',
          '1. Choose one relevant Bible verse.',
          '2. Give one brief explanation connected to the topic or emotion.',
          '3. Write one compassionate prayer.'
        ].join('\n')
      }
    ];
  } else {
    return res.status(400).json({ error: 'Missing content, emotion, or topic.' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages,
        max_tokens: 900,
        temperature: 0.7
      })
    });

    const rawText = await response.text();
    let data = null;

    try {
      data = rawText ? JSON.parse(rawText) : null;
    } catch (parseError) {
      console.error('OpenAI API JSON parse failed:', parseError);
    }

    if (!response.ok) {
      console.error('OpenAI API error detail:', rawText);
      return res.status(response.status).json({
        error: 'OpenAI API error',
        detail: rawText
      });
    }

    const fullText = data?.choices?.[0]?.message?.content || '';
    if (!fullText) {
      return res.status(500).json({ error: 'OpenAI returned empty content.' });
    }

    if (content) {
      return res.json({ content: fullText });
    }

    const prayer = extractTag(fullText, 'prayer');
    const scripture = extractTag(fullText, 'scripture');
    const explanation = extractTag(fullText, 'explanation');

    if (!prayer || !scripture || !explanation) {
      return res.status(500).json({
        error: 'Failed to parse OpenAI response.',
        detail: fullText
      });
    }

    return res.json({ prayer, scripture, explanation });
  } catch (err) {
    console.error('OpenAI API call failed:', err);
    return res.status(500).json({ error: 'OpenAI API call failed', detail: err.message });
  }
});

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
        Authorization: `Bearer ${OPENAI_API_KEY}`,
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

    const arrayBuffer = await response.arrayBuffer();
    const base64audio = Buffer.from(arrayBuffer).toString('base64');
    return res.json({ audioContent: base64audio });
  } catch (err) {
    return res.status(500).json({ error: 'OpenAI TTS call failed', detail: err.message });
  }
});

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
        name: voiceName || undefined
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

    return res.json({ audioContent: ttsData.audioContent });
  } catch (err) {
    return res.status(500).json({ error: 'Google TTS call failed', detail: err.message });
  }
});

app.get('/api/counter', (req, res) => {
  res.json({ count: counter });
});

app.post('/api/counter', (req, res) => {
  counter++;
  res.json({ count: counter });
});

app.get('/api/env', (req, res) => {
  res.json({ NODE_ENV: process.env.NODE_ENV || 'production' });
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/js', express.static(path.join(__dirname, '..', 'js')));
app.use('/css', express.static(path.join(__dirname, '..', 'css')));
app.use(express.static(__dirname));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`dotenv path: ${path.resolve(__dirname, '..', '.env')}`);
  console.log(`OPENAI_API_KEY loaded: ${OPENAI_API_KEY ? 'yes' : 'no'}`);
});
