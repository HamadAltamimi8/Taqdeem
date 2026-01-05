
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// نظام تسجيل الـ Service Worker مع دعم التحديث الفوري
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker) {
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // إنشاء تنبيه بسيط للمستخدم بوجود نسخة جديدة
              showUpdateToast();
            }
          };
        }
      };
    });
  });
}

function showUpdateToast() {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-24 left-6 right-6 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl z-[200] flex items-center justify-between update-toast';
  toast.innerHTML = `
    <span class="text-xs font-bold">🎉 يتوفر تحديث جديد للمنصة!</span>
    <button id="refresh-btn" class="bg-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase">تحديث الآن</button>
  `;
  document.body.appendChild(toast);
  document.getElementById('refresh-btn')?.addEventListener('click', () => {
    window.location.reload();
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Root element missing");

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
