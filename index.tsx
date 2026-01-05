
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // إصلاح المسار ليعمل على مجلدات GitHub Pages الفرعية
    const swPath = window.location.pathname.endsWith('/') 
      ? 'sw.js' 
      : './sw.js';
      
    navigator.serviceWorker.register(swPath).then((registration) => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker) {
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdateToast();
            }
          };
        }
      };
    }).catch(err => console.error('SW registration failed:', err));
  });
}

function showUpdateToast() {
  const existingToast = document.querySelector('.update-toast');
  if (existingToast) return;

  const toast = document.createElement('div');
  toast.className = 'fixed bottom-24 left-6 right-6 bg-slate-900 text-white p-5 rounded-[24px] shadow-2xl z-[200] flex items-center justify-between update-toast border border-white/10 backdrop-blur-lg bg-opacity-95';
  toast.innerHTML = `
    <div class="flex items-center space-x-3 space-x-reverse">
      <div class="bg-blue-600 p-2 rounded-xl animate-bounce">✨</div>
      <div class="text-right">
        <p class="text-[11px] font-black">يتوفر تحديث جديد للمنصة!</p>
        <p class="text-[9px] text-slate-400 font-bold">نسخة v1.3.3 أصبحت جاهزة</p>
      </div>
    </div>
    <button id="refresh-btn" class="bg-blue-600 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider active:scale-95 transition-all">تحديث الآن</button>
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
