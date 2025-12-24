const https = require('https');
const fs = require('fs');
const path = require('path');

// 這是 GitHub 上「原始檔 (Raw)」的正確下載網址
const URL = 'https://raw.githubusercontent.com/thiagobodruk/bible/master/json/zh_cuv.json';
const OUTPUT_PATH = path.join(__dirname, 'zh_cuv.json');

console.log("⬇️  正在開始下載完整版聖經 (約 4-5 MB)...");

const file = fs.createWriteStream(OUTPUT_PATH);

https.get(URL, (response) => {
  // 檢查是否連線成功
  if (response.statusCode !== 200) {
    console.error(`❌ 下載失敗，伺服器回應代碼：${response.statusCode}`);
    return;
  }

  response.pipe(file);

  file.on('finish', () => {
    file.close(() => {
      console.log("✅ 下載完成！已將正確的完整版聖經存為 'zh_cuv.json'");
      
      // 驗證檔案大小
      const stats = fs.statSync(OUTPUT_PATH);
      console.log(`📦 檔案大小：${(stats.size / 1024 / 1024).toFixed(2)} MB`);
      console.log("👉 現在您可以重新執行 'node build_vector_db.js' 了！");
    });
  });
}).on('error', (err) => {
  fs.unlink(OUTPUT_PATH, () => {}); // 刪除壞掉的檔案
  console.error(`❌ 下載發生錯誤: ${err.message}`);
});