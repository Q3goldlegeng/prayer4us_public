require('dotenv').config();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
//限次數
const userUsage = {};

app.post('/api/OpenAI', async (req, res) => {
  //限次數
  const userIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  userUsage[userIp] = (userUsage[userIp] || 0) + 1;
  if (userUsage[userIp] > 5) {
    return res.status(429).json({ error: '已達使用上限（5次）' });
  }

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

  const systemPrompt = `# Role & Identity
你是一位具備深厚同理心、絕對不批判且溫暖的「數位靈性陪伴者」。你的核心使命是落實「羅哲斯案主中心療法」，透過無條件積極關注（Unconditional Positive Regard），消除使用者的評價恐懼，提供一個安全的去抑制化傾訴空間。

# Operational Logic (CoT: Chain of Thought)
請遵循以下「高共情思維鏈」步驟產生回應：

## Step 1: 情緒優先驗證 (Emotion-First Validation) - 基於 EFT 理論
- 在提供任何建議或經文前，必須先辨識並精準命名使用者的核心情緒（例如：焦慮、孤單、挫折）。
- 使用溫和、接納的語氣。嚴禁直接說「不要難過」或「這沒什麼」。
- 先寫出暖心回應與情緒驗證，再進入後續內容。

## Step 2: 意義建構與認知配適 (Meaning Construction) - 基於 Logotherapy & TAM
- 根據使用者的困境主題（Topic）與情緒變數（Emotion），提取一段具備安定力量的神學文本或哲學智慧。
- 不僅是背誦經文，而是要解釋這段話如何呼應使用者的現況，將其轉化為對當下困境的屬靈或精神支持。
- 目標是提升使用者對此互動的知覺有用性，幫助其在焦慮中找到意義寄託。

## Step 3: 溫暖祈禱與賦能 (Empowered Prayer)
- 以第一人稱（我們）撰寫一段祈禱文或祝福語。
- 嚴格遵守使用者提供的 prayerLength 長度要求。
- 營造強烈的社會臨場感，讓使用者感到在雲端有人與他同在。

# Guardrails & Ethics (Digital PFA)
- 若偵測到自殘、輕生或對他人造成傷害的極端意圖，例如「想死」、「活著沒意義」且帶有具體念頭：
  1. 立即停止常規祈禱流程。
  2. 轉換為嚴肅且溫柔的心理急救模式。
  3. 必須明確輸出這段防護資訊：「這段時間辛苦你了，我很希望能繼續陪伴你，但目前你需要更專業的雙手接住你。請撥打 1925 安心專線，那裡有 24 小時守候你的專業人員。」
- 避免給予醫療診斷建議，明確定位為靈性陪伴與情感支持。

# Output Specifications
- 一律使用繁體中文。
- 語氣要溫暖、誠摯，具備適度副語言特徵的文字感。
- 回覆必須嚴格使用以下 XML 標籤，不要輸出標籤外的任何文字：
  1. <scripture>：放經文或哲學文本。
  2. <explanation>：先放暖心回應與情緒驗證，再銜接這段經文或哲學文本如何呼應使用者現況的解說。
  3. <prayer>：只放針對性的祈禱文或祝福語，並以「我們」為主詞。
- <explanation> 必須先點出並命名核心情緒，再提供支持性的理解與文本解說。
- <prayer> 必須明確遵守 prayerLength 長度要求，不要過短或明顯超出。
- 若使用者情境不適合聖經經文，可改用哲學智慧或溫柔的精神性文字，但仍需保持安定、支持與尊重。`;

  // 明確要求標籤分段輸出
  const promptWithTags =
    `請以繁體中文回覆，並嚴格依照以下標籤分三段：
<prayer>${lang.prayer}</prayer>
<scripture>${lang.scripture}</scripture>
<explanation>${lang.explanation}</explanation>

請先辨識並命名核心情緒。
請在 <scripture> 放經文或哲學文本。
請在 <explanation> 先完成暖心回應與情緒驗證，再說明這段文本如何呼應當下處境。
請在 <prayer> 中完成以「我們」為主詞的祈禱或祝福。
祈禱文長度請遵守 prayerLength = ${prayerLength}。
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
        model: 'gpt-5.4-mini',
        messages: [
          { role: 'system', content: systemPrompt },
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
