// 環境變數配置
// 此檔案用於處理本地開發和 Vercel 部署時的環境變數

// 全局環境變數對象
window.ENV = window.ENV || {};

// 獲取API金鑰函數
async function getApiKey() {
  // 如果已經設置了環境變數，直接返回
  if (window.ENV.OPENAI_API_KEY) {
    return window.ENV.OPENAI_API_KEY;
  }


  // 檢查是否在 Vercel 環境中
  const isVercelEnv = window.location.hostname.includes('vercel.app') || 
                      window.location.hostname.includes('now.sh') ||
                      !window.location.hostname.includes('localhost');
  
  if (isVercelEnv) {
    try {
      console.log('正在從 Next.js API 路由獲取環境變數...');
      
      // 使用完整的 URL 路徑
      const apiUrl = `${window.location.origin}/api/env`;
      console.log('API URL:', apiUrl);
      
      // 嘗試從 Next.js API 路由獲取環境變數
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API 回應錯誤: ${response.status}`);
      }
      
      const data = await response.json();
    //  console.log('API 回應:', data);
      
      if (data.OPENAI_API_KEY) {
        console.log('成功從 API 獲取環境變數');
        window.ENV.OPENAI_API_KEY = data.OPENAI_API_KEY;
        return data.OPENAI_API_KEY;
      } else {
        console.warn('API 回應中沒有 OPENAI_API_KEY');
      }
    } catch (error) {
      console.warn('無法從 API 獲取環境變數:', error);
      console.error('詳細錯誤:', error.message);
    }
  } else {
    console.log('在本地環境中，使用 .env.js 中的環境變數');
  }
  
  // 返回本地環境變數或空字符串
  return window.ENV.OPENAI_API_KEY || '';
}

// 導出 getApiKey 函數
window.getApiKey = getApiKey;
