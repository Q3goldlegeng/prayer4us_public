import { useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';

export default function Home() {
  useEffect(() => {
    // Redirect to the static index.html file
    window.location.href = '/index.html';
  }, []);

  return (
    <div>
      <h1>重定向中...</h1>
      <p>如果您看到此頁面，請點擊<a href="/index.html">這裡</a>繼續。</p>
      <Analytics />
    </div>
  );
}