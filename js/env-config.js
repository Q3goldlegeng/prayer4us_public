// js/env-config.js
// 僅用於前端取得安全的環境資訊，不含任何 API 金鑰


// 只給前端用的安全環境資訊，不含任何 export
window.ENV = window.ENV || {};
window.ENV.NODE_ENV = (window && window.__ENV__ && window.__ENV__.NODE_ENV) || 'production';

// 若需其他安全資訊，可由後端 /api/env 提供 fetch 取得
// (本檔案不應包含任何 async/await 或 export)
