// --- /api/counter: 簡易計數器（記憶體版，重啟會歸零） ---
let counter = 0;
app.get('/api/counter', (req, res) => {
  if (req.method === 'POST') {
    counter++;
    res.json({ count: counter });
  } else {
    res.json({ count: counter });
  }
});

// --- /api/env: 回傳環境變數（僅回傳安全資訊，勿回傳金鑰） ---
app.get('/api/env', (req, res) => {
  res.json({ NODE_ENV: process.env.NODE_ENV || 'production' });
});
require('dotenv').config();
const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
// 靜態檔案服務，支援 favicon.ico 及其他靜態資源
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname)); // 兼容 favicon.ico 在根目錄

app.post('/api/prayer', async (req, res) => {
  const topic = req.body.topic || "感恩";

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          { role: "system", content: "你是一位溫柔誠懇的基督徒禱告助手。" },
          { role: "user", content: `請用繁體中文寫一段 100 字內的禱告文，主題是：「${topic}」。最後請加上一句對應的聖經經文出處。` }
        ],
        temperature: 0.7,
        max_tokens: 150
      })
    });

    const data = await response.json();
    res.json({ result: data.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: "API call failed" });
  }
});

// 靜態頁面 fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
