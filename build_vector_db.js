require('dotenv').config();
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

// ⚠️ 組員注意：請確認 .env 檔案裡有 OPENAI_API_KEY
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const BIBLE_FILE_PATH = path.join(__dirname, 'zh_cuv.json');
const OUTPUT_FILE_PATH = path.join(__dirname, 'bible_vectors.json');

async function generateVector(text) {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      encoding_format: "float",
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error("⚠️  向量化失敗 (可能是網路或額度問題):", error.message);
    return null;
  }
}

async function main() {
  console.log("📂 1. 讀取聖經資料...");
  
  if (!fs.existsSync(BIBLE_FILE_PATH)) {
    console.error("❌ 找不到 zh_cuv.json");
    return;
  }

  // 讀取檔案並移除 BOM (隱形字元)
  let rawData = fs.readFileSync(BIBLE_FILE_PATH, 'utf8');
  rawData = rawData.replace(/^\uFEFF/, '').trim();

  const books = JSON.parse(rawData);
  const cleanDocuments = [];

  // 資料清洗
  for (const book of books) {
    const bookName = book.book || book.name || book.abbrev; 
    book.chapters.forEach((chapter, chapterIndex) => {
      const chapterNum = chapterIndex + 1;
      chapter.forEach((verseText, verseIndex) => {
        const verseNum = verseIndex + 1;
        if (verseText && verseText.trim().length > 0) {
            cleanDocuments.push({
              text: verseText,
              source: `${bookName} ${chapterNum}:${verseNum}`
            });
        }
      });
    });
  }

  console.log(`✅ 資料準備完成，共 ${cleanDocuments.length} 節。`);
  console.log("🚀 2. 開始向量化...");
  
  // ⚠️ 正式跑的時候，請把下面這行 .slice(0, 10) 刪掉，改成 cleanDocuments
  // 這樣才會跑整本聖經 (這裡預設先跑 10 筆測試，幫組員省錢)
  const batchData = cleanDocuments.slice(0, 10); 

  const vectorDatabase = [];
  let count = 0;

  for (const doc of batchData) {
    count++;
    process.stdout.write(`正在處理 [${count}/${batchData.length}]: ${doc.source} \r`);
    
    const embedding = await generateVector(doc.text);
    
    if (embedding) {
      vectorDatabase.push({
        id: doc.source,
        vector: embedding,
        content: doc.text,
        metadata: { source: doc.source }
      });
    }
    // 稍微降速避免被鎖
    await new Promise(r => setTimeout(r, 20)); 
  }

  fs.writeFileSync(OUTPUT_FILE_PATH, JSON.stringify(vectorDatabase, null, 2));
  console.log(`\n🎉 成功！已將向量資料儲存至 '${OUTPUT_FILE_PATH}'`);
}

main();