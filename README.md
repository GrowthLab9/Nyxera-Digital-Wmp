# 🚀 WMP Multi AI — Deploy Guide

## 📁 Struktur File
```
wmp-vercel/
├── src/
│   ├── main.jsx        ← entry point
│   └── App.jsx         ← aplikasi utama
├── public/
│   └── favicon.svg
├── index.html
├── package.json
├── vite.config.js
└── vercel.json
```

---

## 🔷 CARA DEPLOY KE VERCEL (Recommended)

### Metode A — Via GitHub (Paling Pro)
1. Buat akun GitHub → github.com
2. Buat repository baru → klik "+ New repository" → nama: `wmp-ai`
3. Upload semua file ini ke repo (drag & drop di browser atau pakai GitHub Desktop)
4. Buka vercel.com → Sign up dengan GitHub
5. Klik "Add New Project" → Import repo `wmp-ai`
6. Settings otomatis terdeteksi (Vite) → Klik **Deploy**
7. ✅ Dapat link: `wmp-ai.vercel.app`

### Metode B — Via Vercel CLI (Lebih Cepat)
```bash
npm i -g vercel
cd wmp-vercel
npm install
vercel
```
Ikuti instruksi → selesai!

### Metode C — Upload Langsung (Termudah)
1. Build dulu: `npm install && npm run build`
2. Buka vercel.com → drag folder `dist/` ke dashboard
3. ✅ Langsung live!

---

## ⚡ CARA DEPLOY KE BOLT.NEW

1. Buka bolt.new
2. Klik "Start new project"
3. Di chat, ketik:

```
Create a React + Vite app with this single component as App.jsx:
[paste isi src/App.jsx]
```

4. Tunggu generate selesai
5. Klik "Deploy" → pilih Netlify
6. ✅ Dapat link gratis!

---

## 🔑 Cara Pakai Setelah Deploy

1. Buka app di browser
2. Klik tombol **⚠️ Set Key** di kanan atas
3. Masukkan API key gratis:
   - **Gemini** (recommended): aistudio.google.com → Get API Key
   - **Groq**: console.groq.com → API Keys
   - **OpenRouter**: openrouter.ai → Keys
4. Klik Simpan
5. Pilih modul → isi form → Generate! 🎉

---

## 📦 Tech Stack
- React 18 + Vite 5
- Zero external dependencies (murni React)
- 9 AI endpoints terintegrasi
- localStorage untuk simpan API keys

## 💰 Biaya
- Hosting Vercel: **GRATIS** (hobby plan)
- AI API: **GRATIS** (Gemini/Groq/OpenRouter)
- Total: **$0/bulan** 🎉
