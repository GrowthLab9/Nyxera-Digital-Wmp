import { useState, useRef, useEffect } from "react";

// ─── FREE AI PROVIDERS ────────────────────────────────────────────────────────
const AI_PROVIDERS = [
  {
    id: "gemini-flash",
    name: "Gemini 2.5 Flash",
    provider: "Google",
    badge: "🟢 GRATIS",
    badgeColor: "#00ff9d",
    icon: "💎",
    note: "1M token/hari • Paling recommended",
    keyPlaceholder: "AIza...",
    keyLink: "https://aistudio.google.com/apikey",
    call: async (apiKey, messages, onChunk) => {
      const sysMsg = messages.find(m => m.role === "system");
      const userMsg = messages.filter(m => m.role !== "system");
      const contents = userMsg.map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));
      if (sysMsg) contents.unshift({ role: "user", parts: [{ text: "System: " + sysMsg.content }] });
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:streamGenerateContent?alt=sse&key=${apiKey}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents }) }
      );
      if (!res.ok) { const e = await res.text(); throw new Error(`Gemini ${res.status}: ${e.slice(0,100)}`); }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value).split("\n").filter(l => l.startsWith("data: "))) {
          try { const j = JSON.parse(line.slice(6)); const t = j.candidates?.[0]?.content?.parts?.[0]?.text; if (t) { full += t; onChunk(full); } } catch {}
        }
      }
      return full;
    }
  },
  {
    id: "groq-llama",
    name: "Llama 3.3 70B",
    provider: "Groq",
    badge: "🟢 GRATIS",
    badgeColor: "#00ff9d",
    icon: "⚡",
    note: "14.400 req/hari • Ultra cepat",
    keyPlaceholder: "gsk_...",
    keyLink: "https://console.groq.com/keys",
    call: async (apiKey, messages, onChunk) => {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages, max_tokens: 1500, stream: true })
      });
      if (!res.ok) { const e = await res.text(); throw new Error(`Groq ${res.status}: ${e.slice(0,100)}`); }
      const reader = res.body.getReader(); const decoder = new TextDecoder(); let full = "";
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        for (const line of decoder.decode(value).split("\n").filter(l => l.startsWith("data: ") && !l.includes("[DONE]"))) {
          try { const j = JSON.parse(line.slice(6)); const t = j.choices?.[0]?.delta?.content; if (t) { full += t; onChunk(full); } } catch {}
        }
      }
      return full;
    }
  },
  {
    id: "groq-mixtral",
    name: "Mixtral 8x7B",
    provider: "Groq",
    badge: "🟢 GRATIS",
    badgeColor: "#00ff9d",
    icon: "⚡",
    note: "14.400 req/hari • Multi-expert",
    keyPlaceholder: "gsk_...",
    keyLink: "https://console.groq.com/keys",
    call: async (apiKey, messages, onChunk) => {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({ model: "mixtral-8x7b-32768", messages, max_tokens: 1500, stream: true })
      });
      if (!res.ok) { const e = await res.text(); throw new Error(`Groq ${res.status}: ${e.slice(0,100)}`); }
      const reader = res.body.getReader(); const decoder = new TextDecoder(); let full = "";
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        for (const line of decoder.decode(value).split("\n").filter(l => l.startsWith("data: ") && !l.includes("[DONE]"))) {
          try { const j = JSON.parse(line.slice(6)); const t = j.choices?.[0]?.delta?.content; if (t) { full += t; onChunk(full); } } catch {}
        }
      }
      return full;
    }
  },
  {
    id: "or-llama",
    name: "Llama 3.1 8B",
    provider: "OpenRouter",
    badge: "🟢 GRATIS",
    badgeColor: "#00ff9d",
    icon: "🌐",
    note: "20 req/menit • 30+ model gratis",
    keyPlaceholder: "sk-or-v1-...",
    keyLink: "https://openrouter.ai/keys",
    call: async (apiKey, messages, onChunk) => {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}`, "HTTP-Referer": "https://wmp-ai.vercel.app", "X-Title": "WMP Master Prompts" },
        body: JSON.stringify({ model: "meta-llama/llama-3.1-8b-instruct:free", messages, max_tokens: 1500, stream: true })
      });
      if (!res.ok) { const e = await res.text(); throw new Error(`OpenRouter ${res.status}: ${e.slice(0,100)}`); }
      const reader = res.body.getReader(); const decoder = new TextDecoder(); let full = "";
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        for (const line of decoder.decode(value).split("\n").filter(l => l.startsWith("data: ") && !l.includes("[DONE]"))) {
          try { const j = JSON.parse(line.slice(6)); const t = j.choices?.[0]?.delta?.content; if (t) { full += t; onChunk(full); } } catch {}
        }
      }
      return full;
    }
  },
  {
    id: "or-mistral",
    name: "Mistral 7B",
    provider: "OpenRouter",
    badge: "🟢 GRATIS",
    badgeColor: "#00ff9d",
    icon: "🌐",
    note: "20 req/menit • European AI",
    keyPlaceholder: "sk-or-v1-...",
    keyLink: "https://openrouter.ai/keys",
    call: async (apiKey, messages, onChunk) => {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}`, "HTTP-Referer": "https://wmp-ai.vercel.app", "X-Title": "WMP Master Prompts" },
        body: JSON.stringify({ model: "mistralai/mistral-7b-instruct:free", messages, max_tokens: 1500, stream: true })
      });
      if (!res.ok) { const e = await res.text(); throw new Error(`OpenRouter ${res.status}: ${e.slice(0,100)}`); }
      const reader = res.body.getReader(); const decoder = new TextDecoder(); let full = "";
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        for (const line of decoder.decode(value).split("\n").filter(l => l.startsWith("data: ") && !l.includes("[DONE]"))) {
          try { const j = JSON.parse(line.slice(6)); const t = j.choices?.[0]?.delta?.content; if (t) { full += t; onChunk(full); } } catch {}
        }
      }
      return full;
    }
  },
  {
    id: "or-gemma",
    name: "Gemma 3 27B",
    provider: "OpenRouter",
    badge: "🟢 GRATIS",
    badgeColor: "#00ff9d",
    icon: "🌐",
    note: "Google open model • Cerdas",
    keyPlaceholder: "sk-or-v1-...",
    keyLink: "https://openrouter.ai/keys",
    call: async (apiKey, messages, onChunk) => {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}`, "HTTP-Referer": "https://wmp-ai.vercel.app", "X-Title": "WMP Master Prompts" },
        body: JSON.stringify({ model: "google/gemma-3-27b-it:free", messages, max_tokens: 1500, stream: true })
      });
      if (!res.ok) { const e = await res.text(); throw new Error(`OpenRouter ${res.status}: ${e.slice(0,100)}`); }
      const reader = res.body.getReader(); const decoder = new TextDecoder(); let full = "";
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        for (const line of decoder.decode(value).split("\n").filter(l => l.startsWith("data: ") && !l.includes("[DONE]"))) {
          try { const j = JSON.parse(line.slice(6)); const t = j.choices?.[0]?.delta?.content; if (t) { full += t; onChunk(full); } } catch {}
        }
      }
      return full;
    }
  },
  {
    id: "anthropic",
    name: "Claude Sonnet 4",
    provider: "Anthropic",
    badge: "🔑 TRIAL",
    badgeColor: "#f5c518",
    icon: "🤖",
    note: "Trial credits • Kualitas terbaik",
    keyPlaceholder: "sk-ant-...",
    keyLink: "https://console.anthropic.com",
    call: async (apiKey, messages, onChunk) => {
      const sys = messages.find(m => m.role === "system");
      const chat = messages.filter(m => m.role !== "system");
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1500, stream: true, system: sys?.content || "", messages: chat })
      });
      if (!res.ok) { const e = await res.text(); throw new Error(`Claude ${res.status}: ${e.slice(0,100)}`); }
      const reader = res.body.getReader(); const decoder = new TextDecoder(); let full = "";
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        for (const line of decoder.decode(value).split("\n").filter(l => l.startsWith("data: "))) {
          try { const j = JSON.parse(line.slice(6)); if (j.type === "content_block_delta" && j.delta?.text) { full += j.delta.text; onChunk(full); } } catch {}
        }
      }
      return full;
    }
  },
  {
    id: "xai",
    name: "Grok 4 Mini",
    provider: "xAI",
    badge: "🎁 $25 CREDIT",
    badgeColor: "#a78bfa",
    icon: "🔮",
    note: "$25 gratis akun baru",
    keyPlaceholder: "xai-...",
    keyLink: "https://console.x.ai",
    call: async (apiKey, messages, onChunk) => {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({ model: "grok-4-mini", messages, max_tokens: 1500, stream: true })
      });
      if (!res.ok) { const e = await res.text(); throw new Error(`xAI ${res.status}: ${e.slice(0,100)}`); }
      const reader = res.body.getReader(); const decoder = new TextDecoder(); let full = "";
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        for (const line of decoder.decode(value).split("\n").filter(l => l.startsWith("data: ") && !l.includes("[DONE]"))) {
          try { const j = JSON.parse(line.slice(6)); const t = j.choices?.[0]?.delta?.content; if (t) { full += t; onChunk(full); } } catch {}
        }
      }
      return full;
    }
  },
  {
    id: "together",
    name: "Llama 3.1 405B",
    provider: "Together AI",
    badge: "🎁 $25 CREDIT",
    badgeColor: "#a78bfa",
    icon: "🤝",
    note: "$25 gratis akun baru • Model terbesar",
    keyPlaceholder: "...",
    keyLink: "https://api.together.ai",
    call: async (apiKey, messages, onChunk) => {
      const res = await fetch("https://api.together.xyz/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({ model: "meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo", messages, max_tokens: 1500, stream: true })
      });
      if (!res.ok) { const e = await res.text(); throw new Error(`Together ${res.status}: ${e.slice(0,100)}`); }
      const reader = res.body.getReader(); const decoder = new TextDecoder(); let full = "";
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        for (const line of decoder.decode(value).split("\n").filter(l => l.startsWith("data: ") && !l.includes("[DONE]"))) {
          try { const j = JSON.parse(line.slice(6)); const t = j.choices?.[0]?.delta?.content; if (t) { full += t; onChunk(full); } } catch {}
        }
      }
      return full;
    }
  },
];

const MODULES = [
  { id: "visual",    icon: "🎨", label: "Visual",      color: "#f5c518", glow: "rgba(245,197,24,0.15)"  },
  { id: "app",       icon: "📱", label: "App Build",    color: "#00e5ff", glow: "rgba(0,229,255,0.15)"   },
  { id: "product",   icon: "💎", label: "Product",      color: "#ff2d78", glow: "rgba(255,45,120,0.15)"  },
  { id: "optimize",  icon: "⚡", label: "Optimizer",    color: "#00ff9d", glow: "rgba(0,255,157,0.15)"   },
  { id: "story",     icon: "📽️", label: "Storyboard",  color: "#a78bfa", glow: "rgba(167,139,250,0.15)" },
  { id: "comic",     icon: "🎭", label: "Komik",        color: "#ff7b00", glow: "rgba(255,123,0,0.15)"   },
  { id: "infografis",icon: "📊", label: "Infografis",   color: "#06d6a0", glow: "rgba(6,214,160,0.15)"   },
  { id: "marketing", icon: "📣", label: "Marketing",    color: "#ef476f", glow: "rgba(239,71,111,0.15)"  },
];

const SYSTEM_PROMPTS = {
  visual: `Kamu adalah master prompt engineer khusus AI image generation. Buat prompt gambar AI sangat detail dan efektif.

Format output:
🎨 MASTER PROMPT (Copy-Paste Ready):
[prompt utama — detail, spesifik, kaya keyword artistik]

📐 VARIASI STYLE:
• Photorealistic: [versi]
• Artistic/Painterly: [versi]
• Minimal/Clean: [versi]
• Cinematic: [versi]

🚫 NEGATIVE PROMPT (SD/Leonardo):
[negative prompts]

🛠️ PARAMETER PER PLATFORM:
• Midjourney: --ar X:Y --style raw --v 6.1
• DALL-E 3: [tips]
• Stable Diffusion: [tips + model]
• Leonardo AI: [tips]
• Flux.1: [tips]
• Ideogram: [tips]

💡 PRO TIPS: [3 tips spesifik]`,

  app: `Kamu adalah senior software architect dan product manager. Generate master prompt siap pakai untuk AI app builder.

Format output:
🚀 MASTER PROMPT — BOLT.NEW:
[prompt panjang lengkap: nama app, halaman, fitur detail, tech stack, design system, database, auth, deployment]

⚡ QUICK PROMPT — V0.DEV:
[prompt ringkas fokus UI]

🖱️ CURSOR AI INSTRUCTIONS:
Step 1: ... Step 2: ... Step 3: ...

❤️ LOVABLE.DEV PROMPT:
[prompt fokus Supabase + database]

📋 TECH STACK: Frontend · Backend · DB · Auth · Payment · Deploy

💰 ESTIMASI BIAYA: Free tier: ... | Scale: ...

⚡ QUICK WINS: 1. 2. 3.`,

  product: `Kamu adalah digital product strategist dan copywriter kelas dunia.

Format output:
💎 PRODUCT BLUEPRINT: [Nama]

📌 EXECUTIVE SUMMARY: [deskripsi, USP, market gap]

🎯 FITUR LENGKAP A-Z: [list bernomor]

💰 MONETISASI: Model · Tier Free · Tier Pro $X · Tier Business $X · Upsell · Revenue Est.

🛠️ TOOLS STACK: [tools buat + jual + marketing]

📣 LAUNCH 90 HARI: Bulan 1/2/3

✍️ MASTER AI PROMPT untuk buat produk ini: [prompt siap pakai]

🔥 HEADLINE IDEAS (5): 1. 2. 3. 4. 5.`,

  optimize: `Kamu adalah prompt engineering expert. Analisis dan tingkatkan prompt yang diberikan.

Format output:
🔍 DIAGNOSIS:
• Kekuatan: • Kelemahan: • Missing: • Score: X/10

⚡ PROMPT SUPERCHARGED: [prompt yang dioptimasi total]

🔄 3 VARIASI:
1. [Approach] → [prompt]
2. [Approach] → [prompt]
3. [Approach] → [prompt]

🧩 CHAIN OF THOUGHT VERSION: [versi step-by-step]

📊 BEFORE X/10 → AFTER Y/10 — Key improvements: [list]

💡 PRO TIPS: [3 tips]`,

  story: `Kamu adalah sutradara dan storyboard artist profesional.

Format output:
🎬 STORYBOARD: "[Judul]"
Durasi: | Genre: | Platform:

PANEL [N]:
📷 Shot: | 🎥 Angle: | ⏱ Durasi:
🖼️ Visual: [deskripsi detail untuk AI]
👤 Character: [pose, ekspresi]
💬 Dialog/VO: "..."
🔊 Sound: | 🎨 Mood:
🤖 AI PROMPT: [prompt Midjourney/DALL-E siap pakai]

[ulangi semua panel]

🎨 STYLE BIBLE: Color · Film look · Camera · Lighting

🤖 BATCH PROMPTS: [semua panel sekaligus]`,

  comic: `Kamu adalah komikus profesional dan comic script writer.

Format output:
🎭 COMIC SCRIPT: "[Judul]"
Genre: | Style: | Format:

━━━ PANEL [N] ━━━
📐 Size: FULL/HALF/QUARTER
📷 Shot: | 🎭 Expression:
🖼️ SCENE: [deskripsi visual detail]
👥 CHARACTERS: [posisi, aksi]
💬 [Karakter]: "[dialog]"
🔊 SFX: | 📝 CAPTION:
🤖 AI PROMPT: [prompt untuk generate panel]

[ulangi semua panel]

🦸 CHARACTER DESIGN: [prompt setiap karakter]
📖 COVER PROMPT: [prompt cover]
🎨 COLOR STYLE: [panduan warna]`,

  infografis: `Kamu adalah infographic designer dan data journalist profesional.

Format output:
📊 INFOGRAFIS: "[Judul]"

📌 HEADLINE (5 opsi): 1. 2. 3. 4. 5.

🔢 HOOK STATISTIC: [1 angka paling mengejutkan]

📋 KONTEN:
SECTION 1 — [Judul]: [data] | Icon: [emoji]
[min 5 section]

📈 DATA VIZ: Chart type · Data angka

💬 PULL QUOTE: "[insight 10-15 kata]"

🎨 DESIGN BRIEF: Layout · Colors · Font · Icon style · Size

🤖 AI IMAGE PROMPT: [prompt background/elemen]

🛠️ TOOLS: Canva keyword · Visme type · Piktochart category

📱 CAPTION SOSMED: [caption + hashtag siap post]`,

  marketing: `Kamu adalah growth marketer dan copywriter kelas dunia.

Format output:
📣 MARKETING PACK: "[Produk]"

🎯 POSITIONING: "Untuk [TARGET], [BRAND] adalah satu-satunya [CATEGORY] yang [DIFFERENTIATOR]"

✍️ HEADLINE (10): 1-10 [berbagai angle]

📸 INSTAGRAM CAPTION (3): Short · Story · List

📘 FACEBOOK AD: Primary text · Headline · Description · CTA

📧 EMAIL SUBJECT (10): 1-10

📧 EMAIL BODY: [template siap edit]

🎥 VIDEO SCRIPT 30 detik: Hook · Value · CTA

#️⃣ HASHTAG: Niche (10) · Medium (10) · Broad (5)

🤖 VISUAL PROMPT: [prompt Midjourney untuk konten]`,
};

const MODULE_FIELDS = {
  visual: [
    { key: "subject", label: "Subjek / Objek Utama", placeholder: "wanita muda membaca buku di kafe sore hari", type: "text" },
    { key: "style", label: "Gaya Visual", placeholder: "photorealistic, anime, oil painting, cyberpunk...", type: "text" },
    { key: "mood", label: "Mood / Suasana", placeholder: "romantic, epic, mysterious, cozy...", type: "text" },
    { key: "extra", label: "Detail Tambahan", placeholder: "warna, elemen khusus, rasio, dll...", type: "textarea" },
  ],
  app: [
    { key: "appName", label: "Nama Aplikasi", placeholder: "TaskFlow Pro", type: "text" },
    { key: "description", label: "Deskripsi App", placeholder: "SaaS untuk manage freelancer project dengan AI task prioritization", type: "textarea" },
    { key: "features", label: "Fitur Utama (pisahkan koma)", placeholder: "auth, dashboard, kanban, AI, invoice, payment, team chat", type: "textarea" },
    { key: "design", label: "Gaya Design", placeholder: "minimal dark, vibrant SaaS, glassmorphism, corporate clean...", type: "text" },
  ],
  product: [
    { key: "type", label: "Jenis Produk Digital", placeholder: "eBook, kursus, template Notion, SaaS, plugin...", type: "text" },
    { key: "topic", label: "Topik / Niche", placeholder: "social media marketing untuk UMKM Indonesia", type: "text" },
    { key: "target", label: "Target Pembeli", placeholder: "freelancer 20-35, masalah: susah dapat klien", type: "textarea" },
    { key: "price", label: "Range Harga", placeholder: "Rp 150.000 / $29", type: "text" },
    { key: "platform", label: "Platform Jual", placeholder: "Gumroad, Tokopedia, website sendiri...", type: "text" },
  ],
  optimize: [
    { key: "original", label: "Prompt Original", placeholder: "Paste prompt yang ingin dioptimasi...", type: "textarea", rows: 5 },
    { key: "goal", label: "Tujuan Prompt", placeholder: "generate gambar product / buat landing page...", type: "text" },
    { key: "platform", label: "Platform AI Target", placeholder: "Claude, ChatGPT, Midjourney, Bolt.new...", type: "text" },
  ],
  story: [
    { key: "title", label: "Judul / Tema", placeholder: "iklan minuman energi — atlet bangkit dari kekalahan", type: "text" },
    { key: "type", label: "Jenis Konten", placeholder: "iklan TV 30 detik, Reels, film pendek, game cutscene...", type: "text" },
    { key: "panels", label: "Jumlah Panel", placeholder: "4, 6, 8, 12...", type: "text" },
    { key: "style", label: "Gaya Visual", placeholder: "sinematik realistik, animasi 2D, flat illustration...", type: "text" },
    { key: "mood", label: "Tone & Mood", placeholder: "inspiratif, dramatis, lucu, menegangkan...", type: "text" },
  ],
  comic: [
    { key: "title", label: "Judul Komik", placeholder: "Kopi & Deadline", type: "text" },
    { key: "genre", label: "Genre & Format", placeholder: "slice of life 4 panel / manga action / webtoon...", type: "text" },
    { key: "synopsis", label: "Sinopsis / Scene", placeholder: "Deskripsi adegan atau cerita yang mau dikomikkan...", type: "textarea" },
    { key: "style", label: "Gaya Seni", placeholder: "manga, webtoon, western cartoon, chibi...", type: "text" },
  ],
  infografis: [
    { key: "topic", label: "Topik", placeholder: "5 Fakta Mengejutkan tentang Kebiasaan Tidur Orang Indonesia", type: "text" },
    { key: "type", label: "Jenis Infografis", placeholder: "statistik / edukasi / timeline / perbandingan / proses...", type: "text" },
    { key: "data", label: "Data / Poin Utama", placeholder: "73% orang tidur kurang 7 jam, 40% pakai HP sebelum tidur...", type: "textarea" },
    { key: "platform", label: "Platform Publish", placeholder: "Instagram, LinkedIn, website, presentasi...", type: "text" },
    { key: "style", label: "Gaya Visual", placeholder: "modern minimalis, bold colorful, corporate, playful...", type: "text" },
  ],
  marketing: [
    { key: "product", label: "Produk / Brand", placeholder: "Aplikasi manajemen keuangan untuk mahasiswa", type: "text" },
    { key: "target", label: "Target Audiens", placeholder: "mahasiswa 18-25, masalah: boros tanpa sadar", type: "textarea" },
    { key: "channel", label: "Channel Marketing", placeholder: "Instagram, TikTok, email, Google Ads, WhatsApp...", type: "text" },
    { key: "goal", label: "Tujuan Campaign", placeholder: "awareness, lead gen, penjualan, download app...", type: "text" },
    { key: "tone", label: "Tone of Voice", placeholder: "friendly, professional, bold & edgy, inspiratif...", type: "text" },
  ],
};

const getStoredKeys = () => { try { const r = localStorage.getItem("wmp_keys_v2"); return r ? JSON.parse(r) : {}; } catch { return {}; } };
const saveKeys = (k) => { try { localStorage.setItem("wmp_keys_v2", JSON.stringify(k)); } catch {} };

export default function App() {
  const [mod, setMod] = useState("visual");
  const [aiId, setAiId] = useState("gemini-flash");
  const [apiKeys, setApiKeys] = useState(getStoredKeys);
  const [showKeys, setShowKeys] = useState(false);
  const [showHist, setShowHist] = useState(false);
  const [fields, setFields] = useState({});
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const outRef = useRef(null);

  const module = MODULES.find(m => m.id === mod);
  const provider = AI_PROVIDERS.find(p => p.id === aiId);
  const currentKey = apiKeys[aiId] || "";
  const hasKey = currentKey.trim().length > 5;

  useEffect(() => { setFields({}); setOutput(""); setError(""); }, [mod]);
  useEffect(() => { if (outRef.current) outRef.current.scrollTop = outRef.current.scrollHeight; }, [output]);

  const updateKey = (id, val) => { const u = { ...apiKeys, [id]: val }; setApiKeys(u); saveKeys(u); };

  const buildMessages = () => {
    const data = (MODULE_FIELDS[mod] || []).map(f => `${f.label}: ${fields[f.key] || "(kosong)"}`).join("\n");
    return [
      { role: "system", content: SYSTEM_PROMPTS[mod] },
      { role: "user", content: `Generate master prompt berdasarkan:\n\n${data}` }
    ];
  };

  const generate = async () => {
    if (!hasKey) { setError(`⚠️ Set API key untuk ${provider.name} dulu — klik tombol 🔑 Keys`); setShowKeys(true); return; }
    if (!(MODULE_FIELDS[mod] || []).some(f => fields[f.key]?.trim())) { setError("Isi minimal satu field!"); return; }
    setError(""); setOutput(""); setLoading(true);
    try {
      const result = await provider.call(currentKey, buildMessages(), t => setOutput(t));
      setHistory(h => [{ mod, icon: module.icon, label: module.label, ai: provider.name, fields: { ...fields }, output: result, time: new Date().toLocaleTimeString("id-ID") }, ...h.slice(0, 9)]);
    } catch (e) { setError("❌ " + e.message); }
    setLoading(false);
  };

  const S = {
    root: { minHeight: "100vh", maxHeight: "100vh", background: "#02020a", color: "#e8e8f5", fontFamily: "'Sora', sans-serif", display: "grid", gridTemplateRows: "54px 1fr", overflow: "hidden", "--mc": module.color, "--mg": module.glow },
    hdr: { display: "flex", alignItems: "center", gap: 14, padding: "0 18px", borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(2,2,10,0.97)", backdropFilter: "blur(20px)", zIndex: 20, position: "relative" },
    logo: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, letterSpacing: 2, display: "flex", gap: 1 },
    sep: { color: "rgba(255,255,255,0.12)", fontSize: 18 },
    sub: { fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.22)" },
    body: { display: "grid", gridTemplateColumns: "188px 1fr 1fr", height: "calc(100vh - 54px)", overflow: "hidden" },
    sidebar: { borderRight: "1px solid rgba(255,255,255,0.06)", background: "rgba(3,3,12,0.85)", padding: "14px 10px", display: "flex", flexDirection: "column", gap: 3, overflowY: "auto" },
    slabel: { fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.14)", padding: "0 8px", marginBottom: 6 },
  };

  const modBtnStyle = (m) => ({
    display: "flex", alignItems: "center", gap: 9, padding: "9px 11px", borderRadius: 9, cursor: "pointer",
    border: `1px solid ${mod === m.id ? m.color : "transparent"}`,
    background: mod === m.id ? "rgba(255,255,255,0.05)" : "none",
    color: mod === m.id ? m.color : "rgba(255,255,255,0.32)",
    fontFamily: "'Sora', sans-serif", fontSize: 12, fontWeight: 500,
    boxShadow: mod === m.id ? `inset 0 0 14px ${m.glow}` : "none",
    transition: "all 0.18s", textAlign: "left", width: "100%",
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0} body{overflow:hidden;background:#02020a}
        ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px}
        input,textarea,select{font-family:'Sora',sans-serif}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes lgrow{from{width:0}to{width:100%}}
        @keyframes keypulse{0%,100%{box-shadow:0 0 0 0 rgba(255,45,120,0.4)}50%{box-shadow:0 0 0 8px rgba(255,45,120,0)}}
        .modbt:hover{background:rgba(255,255,255,0.04)!important;color:rgba(255,255,255,0.65)!important}
        .hitem:hover{background:rgba(255,255,255,0.05);border-color:rgba(255,255,255,0.14)!important}
        .kentry:hover{border-color:rgba(255,255,255,0.12)!important}
        .genbt:hover:not(:disabled){filter:brightness(1.1);transform:translateY(-1px)}
        .copybt:hover:not(:disabled){filter:brightness(1.15)}
        .klink:hover{background:rgba(0,229,255,0.18)!important}
      `}</style>

      <div style={S.root}>

        {/* KEY MODAL */}
        {showKeys && (
          <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.88)", backdropFilter: "blur(14px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setShowKeys(false)}>
            <div style={{ background: "#0a0a18", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 28, maxWidth: 660, width: "100%", maxHeight: "85vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }} onClick={e => e.stopPropagation()}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30 }}>🔑 API Keys Manager</div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", lineHeight: 1.6, marginTop: -8 }}>Key tersimpan di browser kamu saja. Tidak dikirim ke server manapun kecuali langsung ke AI provider yang kamu pilih.</p>
              {AI_PROVIDERS.map(p => {
                const k = apiKeys[p.id] || "";
                const saved = k.length > 5;
                return (
                  <div key={p.id} className="kentry" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 16, transition: "border-color 0.2s" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <span style={{ fontSize: 22 }}>{p.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{p.name}</div>
                        <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 100, fontSize: 10, fontWeight: 700, background: p.badgeColor + "18", color: p.badgeColor, border: `1px solid ${p.badgeColor}35`, marginTop: 2 }}>{p.badge}</span>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", marginTop: 2 }}>{p.note}</div>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
                      <input type="password" placeholder={p.keyPlaceholder} value={k} onChange={e => updateKey(p.id, e.target.value)}
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 12px", color: "#e8e8f5", fontFamily: "'JetBrains Mono',monospace", fontSize: 12, outline: "none" }} />
                      <a href={p.keyLink} target="_blank" rel="noopener noreferrer" className="klink"
                        style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 14px", borderRadius: 8, background: "rgba(0,229,255,0.07)", border: "1px solid rgba(0,229,255,0.18)", color: "#00e5ff", fontSize: 11, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap", transition: "background 0.2s" }}>
                        🔗 Dapetin Key
                      </a>
                    </div>
                    <div style={{ fontSize: 11, marginTop: 5, fontFamily: "'JetBrains Mono',monospace", color: saved ? "#00ff9d" : "rgba(255,255,255,0.2)" }}>
                      {saved ? `✅ Tersimpan (${k.slice(0, 8)}...)` : "Belum ada key"}
                    </div>
                  </div>
                );
              })}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button onClick={() => setShowKeys(false)} style={{ padding: "9px 18px", borderRadius: 9, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 13 }}>Batal</button>
                <button onClick={() => setShowKeys(false)} style={{ padding: "9px 22px", borderRadius: 9, background: module.color, border: "none", color: "#000", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>✅ Simpan</button>
              </div>
            </div>
          </div>
        )}

        {/* HISTORY MODAL */}
        {showHist && (
          <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.88)", backdropFilter: "blur(14px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setShowHist(false)}>
            <div style={{ background: "#0a0a18", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 28, maxWidth: 660, width: "100%", maxHeight: "80vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }} onClick={e => e.stopPropagation()}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30 }}>📜 History ({history.length})</div>
              {history.length === 0 ? <p style={{ color: "rgba(255,255,255,0.2)", textAlign: "center", padding: 40 }}>Belum ada riwayat</p>
                : history.map((h, i) => (
                  <div key={i} className="hitem" onClick={() => { setMod(h.mod); setFields(h.fields); setOutput(h.output); setShowHist(false); }}
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 11, padding: 14, cursor: "pointer", transition: "all 0.15s" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span>{h.icon}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)" }}>{h.label}</span>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "'JetBrains Mono',monospace", padding: "2px 7px", background: "rgba(255,255,255,0.04)", borderRadius: 5 }}>{h.ai}</span>
                      <span style={{ marginLeft: "auto", fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: "rgba(255,255,255,0.2)" }}>{h.time}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.output.slice(0, 110)}...</div>
                  </div>
                ))}
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button onClick={() => setShowHist(false)} style={{ padding: "9px 18px", borderRadius: 9, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 13 }}>Tutup</button>
              </div>
            </div>
          </div>
        )}

        {/* HEADER */}
        <header style={S.hdr}>
          <div style={S.logo}><span style={{ color: "#f5c518" }}>W</span><span style={{ color: "#00e5ff" }}>M</span><span style={{ color: "#ff2d78" }}>P</span></div>
          <span style={S.sep}>·</span>
          <span style={S.sub}>Multi AI Free</span>

          {/* AI selector */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.2)" }}>Engine</span>
            <select value={aiId} onChange={e => { setAiId(e.target.value); setError(""); }}
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#e8e8f5", padding: "5px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", outline: "none" }}>
              <optgroup label="── 🟢 GRATIS ──">
                {AI_PROVIDERS.filter(p => p.badge.includes("GRATIS")).map(p => <option key={p.id} value={p.id}>{p.icon} {p.name} ({p.provider})</option>)}
              </optgroup>
              <optgroup label="── 🎁 Free Credits ──">
                {AI_PROVIDERS.filter(p => !p.badge.includes("GRATIS")).map(p => <option key={p.id} value={p.id}>{p.icon} {p.name} ({p.provider})</option>)}
              </optgroup>
            </select>
          </div>

          <button onClick={() => setShowKeys(true)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 13px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", letterSpacing: 1, textTransform: "uppercase", border: "1px solid", transition: "all 0.2s", fontFamily: "'Sora',sans-serif", animation: hasKey ? "none" : "keypulse 2s infinite", background: hasKey ? "rgba(0,255,157,0.07)" : "rgba(255,45,120,0.07)", borderColor: hasKey ? "rgba(0,255,157,0.25)" : "rgba(255,45,120,0.3)", color: hasKey ? "#00ff9d" : "#ff2d78" }}>
            {hasKey ? "✅ Keys" : "⚠️ Set Key"}
          </button>
          <button onClick={() => setShowHist(true)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)", padding: "5px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>📜 {history.length}</button>
        </header>

        {/* BODY */}
        <div style={S.body}>

          {/* SIDEBAR */}
          <aside style={S.sidebar}>
            <div style={S.slabel}>Modules</div>
            {MODULES.map(m => (
              <button key={m.id} className="modbt" style={modBtnStyle(m)} onClick={() => setMod(m.id)}>
                <span style={{ fontSize: 17 }}>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            ))}
            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "8px 0" }} />
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 9, padding: 11, marginTop: "auto" }}>
              <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, color: "rgba(255,255,255,0.14)", marginBottom: 6 }}>Active</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.45)", marginBottom: 3 }}>{provider.icon} {provider.name}</div>
              <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: hasKey ? "#00ff9d" : "#ff2d78" }}>{hasKey ? `✓ ${currentKey.slice(0, 8)}...` : "✗ No Key"}</div>
            </div>
          </aside>

          {/* INPUT */}
          <div style={{ borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "14px 18px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(3,3,12,0.6)", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 21 }}>{module.icon}</span>
              <div>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 19, letterSpacing: 1 }}>
                  <span style={{ color: module.color }}>{module.label}</span> <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>Generator</span>
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 1 }}>{provider.icon} {provider.name} · {provider.note}</div>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 13 }}>
              {(MODULE_FIELDS[mod] || []).map(f => (
                <div key={f.key} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(255,255,255,0.28)" }}>{f.label}</label>
                  {f.type === "textarea"
                    ? <textarea rows={f.rows || 3} placeholder={f.placeholder} value={fields[f.key] || ""} onChange={e => setFields({ ...fields, [f.key]: e.target.value })}
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 9, padding: "9px 12px", color: "#e8e8f5", fontSize: 12.5, lineHeight: 1.5, resize: "none", width: "100%", outline: "none" }} />
                    : <input type="text" placeholder={f.placeholder} value={fields[f.key] || ""} onChange={e => setFields({ ...fields, [f.key]: e.target.value })}
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 9, padding: "9px 12px", color: "#e8e8f5", fontSize: 12.5, width: "100%", outline: "none" }} />
                  }
                </div>
              ))}
            </div>

            {error && <div style={{ background: "rgba(255,45,120,0.08)", border: "1px solid rgba(255,45,120,0.2)", borderRadius: 8, padding: "9px 13px", fontSize: 12, color: "#ff6b9d", margin: "0 18px" }}>{error}</div>}

            <div style={{ padding: "13px 18px", borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(3,3,12,0.6)", display: "flex", gap: 8 }}>
              <button onClick={() => { setFields({}); setOutput(""); setError(""); }} style={{ padding: "12px 13px", borderRadius: 9, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 14 }}>🗑️</button>
              <button className="genbt" onClick={generate} disabled={loading}
                style={{ flex: 1, padding: "12px 18px", borderRadius: 9, background: module.color, border: "none", color: "#000", fontSize: 13, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, transition: "all 0.2s" }}>
                {loading ? `⚡ Generating...` : `🚀 Generate ${module.label}`}
              </button>
            </div>
          </div>

          {/* OUTPUT */}
          <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "14px 18px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(3,3,12,0.6)", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 19, color: "rgba(255,255,255,0.55)" }}>OUTPUT</div>
              {output && <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: "rgba(255,255,255,0.2)", padding: "2px 8px", background: "rgba(255,255,255,0.04)", borderRadius: 5 }}>{provider.icon} {provider.name.split(" (")[0]}</span>}
              <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
                {output && <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: "rgba(255,255,255,0.2)" }}>{output.length} chars</span>}
                <button className="copybt" disabled={!output} onClick={() => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 13px", borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: output ? "pointer" : "not-allowed", opacity: output ? 1 : 0.3, transition: "all 0.2s", border: "1px solid", background: copied ? "rgba(245,197,24,0.08)" : "rgba(0,255,157,0.06)", borderColor: copied ? "rgba(245,197,24,0.2)" : "rgba(0,255,157,0.2)", color: copied ? "#f5c518" : "#00ff9d" }}>
                  {copied ? "✅ Copied!" : "📋 Copy"}
                </button>
              </div>
            </div>

            <div ref={outRef} style={{ flex: 1, overflowY: "auto", padding: 18 }}>
              {loading && <div style={{ height: 2, background: module.color, boxShadow: `0 0 10px ${module.color}`, borderRadius: 2, marginBottom: 14, animation: "lgrow 0.3s ease" }} />}
              {output
                ? <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, lineHeight: 1.9, color: "#bdd4bd", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {output}{loading && <span style={{ display: "inline-block", width: 2, height: 13, background: module.color, marginLeft: 2, verticalAlign: "middle", animation: "blink 1s infinite" }} />}
                  </div>
                : !loading && (
                  <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: "rgba(255,255,255,0.1)" }}>
                    <div style={{ fontSize: 44, opacity: 0.22 }}>{module.icon}</div>
                    <div style={{ fontSize: 12, textAlign: "center", lineHeight: 1.7 }}>
                      Isi form di kiri → klik <span style={{ color: module.color, fontWeight: 700 }}>Generate</span>
                      {!hasKey && <><br /><span style={{ color: "#ff2d78", marginTop: 6, display: "block" }}>⚠️ Set API key untuk {provider.name}</span></>}
                    </div>
                    <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", opacity: 0.4 }}>powered by {provider.name}</div>
                  </div>
                )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
