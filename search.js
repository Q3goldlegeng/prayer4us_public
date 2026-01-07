require('dotenv').config();
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const VECTORS_FILE_PATH = path.join(__dirname, 'bible_vectors.json');

// 計算兩個向量的相似度
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function searchBible(query) {
  // ▼▼▼ 注意：這裡必須使用反引號 ` (鍵盤左上角那個) ▼▼▼
  console.log(\n🕵️  正在搜尋聖經中關於：「${query}」的經文...);
  // ▲▲▲ 這樣才是正確的字串格式 ▲▲▲

  // 1. 檢查資料庫是否存在
  if (!fs.existsSync(VECTORS_FILE_PATH)) {
    console.error("❌ 找不到 bible_vectors.json！請先執行 build_vector_db.js 建立資料庫。");
    return;
  }

  // 2. 載入資料庫
  console.log("📂 正在載入向量資料庫 (檔案較大請稍候)...");
  const vectorDb = JSON.parse(fs.readFileSync(VECTORS_FILE_PATH, 'utf8'));
  console.log(✅ 資料庫載入完成，共有 ${vectorDb.length} 筆經文。);

  // 3. 把使用者的問題變成向量
  try {
    const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: query,
        encoding_format: "float",
    });
    const queryVector = response.data[0].embedding;

    // 4. 比對相似度
    console.log("🧮 正在計算相似度...");
    const results = vectorDb.map(record => {
        return {
        ...record,
        similarity: cosineSimilarity(queryVector, record.vector)
        };
    });

    // 5. 排序並取出前 3 名
    results.sort((a, b) => b.similarity - a.similarity);
    const top3 = results.slice(0, 3);

    // 6. 輸出結果
    console.log("------------------------------------------------");
    console.log(🤖 AI 認為最相關的 3 節經文：);
    top3.forEach((item, index) => {
        console.log(\n🏆 第 ${index + 1} 名 (相似度: ${(item.similarity * 100).toFixed(1)}%));
        console.log(📖 出處：${item.id});
        console.log(💬 經文：${item.content});
    });
    console.log("------------------------------------------------");
  } catch (error) {
      console.error("❌ 搜尋失敗:", error.message);
  }
}

// 讀取終端機輸入的參數
const userQuery = process.argv[2];

if (!userQuery) {
  console.log("❌ 請輸入問題！範例：node search.js \"神說光\"");
} else {
  searchBible(userQuery);
}