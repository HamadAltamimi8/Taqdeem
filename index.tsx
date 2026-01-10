import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// تسجيل الـ Service Worker بشكل أبسط لتجنب أخطاء المسارات
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .catch(err => console.log('ServiceWorker registration skipped or failed:', err));
  });
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}