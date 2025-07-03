// js/env-config.js
// 僅用於前端取得安全的環境資訊，不含任何 API 金鑰

export const ENV = {
  NODE_ENV: (window && window.__ENV__ && window.__ENV__.NODE_ENV) || 'production'
};

// 若需其他安全資訊，可由後端 /api/env 提供 fetch 取得
  };
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${key}`
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error("Groq API 請求失敗: " + res.status);
  return await res.json();
};
