# Pray with You, Prayer for us

A multilingual emotional support website based on Bible verses, providing relevant scripture, explanations, and prayers tailored to the user's emotional state and needs.

## Features

- **Dynamic Emotion Options**: Suggests common emotions and supports custom input after clicking "Other Situation" three times.
- **Special Scenarios**: Automatically recommends "Prayer before Meal" or "Small Group Prayer" based on time or context.
- **Scripture & Explanations**: Provides relevant Bible verses and concise explanations for each emotion or scenario.
- **Prayer Generation**: Generates heartfelt prayers for each situation, with the ability to extend the prayer up to four segments, each longer and deeper.
- **Voice Playback**: Each prayer segment can be played with selectable voice styles, supporting all languages.
- **Multilingual Support**: Instantly switch between Traditional Chinese, Simplified Chinese, English, Japanese, and Korean via URL parameter:
  - `?lang=zh-Hant` (Traditional Chinese)
  - `?lang=zh-Hans` (Simplified Chinese)
  - `?lang=en` (English)
  - `?lang=ja` (Japanese)
  - `?lang=ko` (Korean)
- **Custom Prayer Input**: Users can enter their own prayer needs or situations for personalized scripture and prayer.

## Usage

1. Visit the website (add `?lang=xx` to specify language, e.g. `?lang=en`).
2. Select an emotion, or click "Other Situation" three times to enter a custom situation.
3. The system generates a Bible verse, explanation, and a prayer segment.
4. Click "Continue with a longer prayer" to extend the prayer (up to 4 segments).
5. Each segment can be played with selectable voice style and language.

## Technical Architecture

- HTML/CSS/JavaScript
- OpenAI API (GPT-4o-mini for content, TTS-1 for speech synthesis)

## Local Setup

1. Copy `.env.example.js` to `.env.js`
2. Fill in your OpenAI API key in `.env.js`
3. Run the project using a local server, for example:
   ```
   npx http-server
   ```
   or use the Live Server extension in VSCode

## Deploy to Vercel

### Prerequisites

1. GitHub account
2. Vercel account
3. Valid OpenAI API key

### Deployment Steps

1. Create a new repository on GitHub
2. Import the repository on Vercel and configure environment variables (`OPENAI_API_KEY`)
3. Deploy and test the site and API routes

### Notes

- The project retrieves the API key from Vercel environment variables via `/api/env`
- `.env.js` is for local development only
- Update the API key in Vercel and redeploy as needed

---

# 我陪您禱告

一個多語系的情緒支持網站，根據用戶的情緒或需求，提供相關聖經經文、解說與禱告詞，並支援語音播放。

## 功能

- **動態情緒選項**：首頁推薦常見情緒，點三次「我有其他狀況」可自訂輸入。
- **特殊情境**：根據時間自動推薦「餐前禱告」或「小組禱告」。
- **經文與解說**：每個情緒或情境都會提供合適的聖經經文與簡明解說。
- **禱告詞生成與延長**：每次產生一段禱告詞，可點「接續更長的禱告」延長（最多四段，每段更長更深入）。
- **語音播放**：每段禱告詞都可選擇語音風格播放，支援所有語系。
- **多語系支援**：網址加 `?lang=zh-Hant`、`zh-Hans`、`en`、`ja`、`ko` 可切換語言。
- **自訂禱告需求**：可輸入自己的困難或禱告需求，獲得專屬經文與禱告。

## 使用方式

1. 進入網站（可加 `?lang=語系` 指定語言）。
2. 選擇情緒，或點三次「我有其他狀況」自訂輸入。
3. 系統自動產生經文、解說與禱告詞。
4. 點「接續更長的禱告」可延長禱告詞（最多四段）。
5. 每段禱告詞都可單獨播放語音並切換語音風格。

## 技術架構

- HTML/CSS/JavaScript
- OpenAI API（GPT-4o-mini 生成內容，TTS-1 合成語音）

## 本地運行

1. 複製 `.env.example.js` 為 `.env.js`
2. 填入 OpenAI API 金鑰
3. 使用本地伺服器運行（如 `npx http-server` 或 VSCode Live Server）

## 部署到 Vercel

1. 建立 GitHub 倉庫
2. 在 Vercel 匯入並設置環境變數（`OPENAI_API_KEY`）
3. 部署並測試網站與 API 路由

## 注意事項

- API 金鑰由 Vercel 環境變數 `/api/env` 提供
- `.env.js` 僅供本地開發
- 更新金鑰請於 Vercel 後台修改並重新部署
