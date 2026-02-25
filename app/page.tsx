"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Page = "Prayer" | "Quran" | "Hadith" | "Tasbih" | "Mosque" | "News" | "PrayerTimes";

interface UserProfile {
  name: string;
  email: string;
  city: string;
  avatar: string | null;
  joinDate: string;
}


// ─── Static Data ──────────────────────────────────────────────────────────────
const PRAYERS = [
  { name: "ফজর",    icon: "🌙", time: "04:22" },
  { name: "যোহর",   icon: "☀️",  time: "01:05" },
  { name: "আসর",     icon: "🌤",  time: "04:45", active: true },
  { name: "মাগরিব", icon: "🌇", time: "06:00" },
  { name: "এশা",    icon: "✨", time: "08:15" },
];

const QURAN_SURAHS = [
  { num: 1,   name: "আল-ফাতিহা", arabic: "الفاتحة",  verses: 7,   type: "মাক্কী"  },
  { num: 2,   name: "আল-বাকারা", arabic: "البقرة",   verses: 286, type: "মাদানী" },
  { num: 3,   name: "আলে ইমরান",  arabic: "آل عمران", verses: 200, type: "মাদানী" },
  { num: 4,   name: "আন-নিসা",    arabic: "النساء",   verses: 176, type: "মাদানী" },
  { num: 5,   name: "আল-মায়িদা",  arabic: "المائدة",  verses: 120, type: "মাদানী" },
  { num: 6,   name: "আল-আনআম",    arabic: "الأنعام",  verses: 165, type: "মাক্কী"  },
  { num: 7,   name: "আল-আ'রাফ",    arabic: "الأعراف",  verses: 206, type: "মাক্কী"  },
  { num: 8,   name: "আল-আনফাল",   arabic: "الأنفال",  verses: 75,  type: "মাদানী" },
  { num: 36,  name: "ইয়া-সিন",     arabic: "يس",       verses: 83,  type: "মাক্কী"  },
  { num: 55,  name: "আর-রাহমান",  arabic: "الرحمن",   verses: 78,  type: "মাদানী" },
  { num: 67,  name: "আল-মুলক",    arabic: "الملك",    verses: 30,  type: "মাক্কী"  },
  { num: 112, name: "আল-ইখলাস",  arabic: "الإخلاص", verses: 4,   type: "মাক্কী"  },
  { num: 113, name: "আল-ফালাক",   arabic: "الفلق",    verses: 5,   type: "মাক্কী"  },
  { num: 114, name: "আন-নাস",     arabic: "الناس",    verses: 6,   type: "মাক্কী"  },
];

const HADITHS = [
  { id: 1, text: "The best among you are those who learn the Quran and teach it.", ref: "Sahih al-Bukhari 5027", narrator: "Uthman ibn Affan", category: "জ্ঞান" },
  { id: 2, text: "None of you truly believes until he loves for his brother what he loves for himself.", ref: "Sahih al-Bukhari 13", narrator: "Anas ibn Malik", category: "ঈমান" },
  { id: 3, text: "Speak good or remain silent.", ref: "Sahih al-Bukhari 6018", narrator: "Abu Hurairah", category: "চরিত্র" },
  { id: 4, text: "The strong man is not the one who overcomes people by strength, but the one who controls himself while in anger.", ref: "Sahih al-Bukhari 6114", narrator: "Abu Hurairah", category: "চরিত্র" },
  { id: 5, text: "Make things easy and do not make them difficult, cheer people up and do not drive them away.", ref: "Sahih al-Bukhari 69", narrator: "Anas ibn Malik", category: "আচরণ" },
  { id: 6, text: "Whoever believes in Allah and the Last Day should speak a good word or remain silent.", ref: "Sahih al-Bukhari 6136", narrator: "Abu Hurairah", category: "বাণী" },
];

const NEWS = [
  { title: "আসন্ন হজ মৌসুম ২০২৫-এর প্রস্তুতি সম্পন্ন",     cat: "বিশ্ব",     ago: "৪ ঘণ্টা আগে",  img: "🕋" },
  { title: "শিক্ষার জন্য নতুন আন্তর্জাতিক যাকাত ফান্ড উদ্যোগ চালু",  cat: "সম্প্রদায়", ago: "১ দিন আগে",    img: "🤲" },
  { title: "বিরল ১৪শ শতাব্দীর পাণ্ডুলিপির প্রদর্শনী শুরু", cat: "সংস্কৃতি",   ago: "৩ দিন আগে",   img: "📜" },
  { title: "দক্ষিণ-পূর্ব এশিয়ায় ইসলামিক ফিন্যান্স খাতে ১৫% প্রবৃদ্ধি",       cat: "অর্থনীতি",   ago: "৫ দিন আগে",   img: "💰" },
  { title: "কানাডার টরন্টোর কেন্দ্রে নতুন মসজিদের ভিত্তি স্থাপন",             cat: "বিশ্ব",     ago: "১ সপ্তাহ আগে",   img: "🕌" },
  { title: "কুরআন মুখস্থ প্রতিযোগিতায় ৫০০ প্রতিযোগী অংশগ্রহণ করেছে",   cat: "সম্প্রদায়", ago: "২ সপ্তাহ আগে",  img: "📖" },
];

const ARTICLES = [
  { title: "রমজানের শেষ ১০ দিনের রুটিন কীভাবে সাজাবেন",            read: "৮ মিনিট",  ago: "২ দিন আগে", num: "1" },
  { title: "আধ্যাত্মিকতার স্থাপত্য: ইসলামিক ডিজাইনের পরিচয়", read: "১২ মিনিট", ago: "৫ দিন আগে", num: "2" },
];

const MOSQUES_DHAKA = [
  { name: "বায়তুল মোকাররম জাতীয় মসজিদ", dist: "1.2 km", address: "পুরানা পল্টন, ঢাকা-১০০০", rating: 4.9, prayer: "আসর: ০৪:৪৫", img: "🕌" },
  { name: "তারা মসজিদ",       dist: "2.4 km", address: "আরমানিটোলা, পুরান ঢাকা",    rating: 4.8, prayer: "আসর: ০৪:৪৫", img: "⭐" },
  { name: "খান মোহাম্মদ মৃধা মসজিদ",     dist: "3.1 km", address: "লালবাগ, পুরান ঢাকা",       rating: 4.7, prayer: "আসর: ০৪:৪০", img: "🏛️" },
  { name: "হোসাইনী দালান",                  dist: "3.8 km", address: "পুরান ঢাকা",                rating: 4.6, prayer: "আসর: ০৪:৪৫", img: "🏰" },
  { name: "চকবাজার শাহী মসজিদ",         dist: "4.5 km", address: "চকবাজার, পুরান ঢাকা",    rating: 4.7, prayer: "আসর: ০৪:৪০", img: "🕌" },
];

const TASBIH_OPTIONS = ["সুবহানআল্লাহ", "আলহামদুলিল্লাহ", "আল্লাহু আকবার", "লা ইলাহা ইল্লাল্লাহ", "আস্তাগফিরুল্লাহ"];
const getSurahAudio  = (n: number) => `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${n}.mp3`;
// Fallback URLs if primary fails
const getSurahAudioFallback = (n: number) => `https://verses.quran.com/Alafasy/mp3/${String(n).padStart(3,"0")}.mp3`;

const DEFAULT_PROFILE: UserProfile = {
  name: "Shahib Hasan",
  email: "shahibhasan0@gmail.com",
  city: "ঢাকা, বাংলাদেশ",
  avatar: null,
  joinDate: "ফেব্রুয়ারি ২০২৬",
};


// ─── Themes ───────────────────────────────────────────────────────────────────
const themes = {
  dark: {
    bg: "#0f1f16", surface: "#172a1e", surface2: "#1e3527",
    border: "#2a4a35", gold: "#2ecc71", text: "#e8f5ee",
    textDim: "#5a8c6a", textMid: "#8abf9a", teal: "#27ae60",
    navBg: "#0b1a10", shadow: "rgba(0,0,0,0.6)", inputBg: "#1e3527",
    starColor: "rgba(100,200,130,0.7)", success: "#22C55E",
  },
  light: {
    bg: "#f5faf7", surface: "#FFFFFF", surface2: "#eaf4ee",
    border: "#c8e6d4", gold: "#1a6b3a", text: "#0d2b1a",
    textDim: "#5a8c6a", textMid: "#2e7d4f", teal: "#1a6b3a",
    navBg: "#0d4a2e", shadow: "rgba(13,74,46,0.15)", inputBg: "#eaf4ee",
    starColor: "rgba(100,200,130,0.5)", success: "#16A34A",
  },
};
type C = typeof themes.dark;

// ─── Global CSS ───────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&family=Noto+Serif:wght@400;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { overflow-x: hidden; font-family: 'Hind Siliguri', sans-serif; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #f0f0f0; }
  ::-webkit-scrollbar-thumb { background: #1a6b3a; border-radius: 3px; }

  @keyframes fadeUp  { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
  @keyframes scaleIn { from { opacity:0; transform:scale(.95) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }
  @keyframes popIn   { from { opacity:0; transform:scale(.88); } to { opacity:1; transform:scale(1); } }
  @keyframes pulse   { 0%,100%{ transform:scale(1); opacity:1; } 50%{ transform:scale(1.12); opacity:.8; } }
  @keyframes float   { 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(-5px); } }
  @keyframes glow    { 0%,100%{ box-shadow:0 0 8px rgba(30,150,80,.3); } 50%{ box-shadow:0 0 18px rgba(30,150,80,.6); } }
  @keyframes dotBlink{ 0%,100%{ transform:scaleY(.4); } 50%{ transform:scaleY(1); } }
  @keyframes spin    { to { transform:rotate(360deg); } }
  @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }

  .fu  { animation: fadeUp .4s cubic-bezier(.22,1,.36,1) both; }
  .fu1 { animation: fadeUp .4s .06s cubic-bezier(.22,1,.36,1) both; }
  .fu2 { animation: fadeUp .4s .12s cubic-bezier(.22,1,.36,1) both; }
  .fu3 { animation: fadeUp .4s .18s cubic-bezier(.22,1,.36,1) both; }
  .fu4 { animation: fadeUp .4s .24s cubic-bezier(.22,1,.36,1) both; }
  .fu5 { animation: fadeUp .4s .30s cubic-bezier(.22,1,.36,1) both; }
  .sci { animation: scaleIn .28s cubic-bezier(.22,1,.36,1) both; }
  .float-a { animation: float 3.5s ease-in-out infinite; }
  .glow-a  { animation: glow  2.5s ease-in-out infinite; }
  .pulse-a { animation: pulse 2s   ease-in-out infinite; }



  /* ─ Responsive helpers ─ */
  .hide-sm   { }
  .show-sm   { display:none !important; }
  .desk-nav  { display:flex; }
  .mob-nav   { display:none !important; }
  .searchbar { display:flex; }


  @media(max-width:768px){
    .hide-sm   { display:none !important; }
    .show-sm   { display:block !important; }
    .desk-nav  { display:none !important; }
    .mob-nav   { display:flex !important; }
    .searchbar { display:none !important; }
    .hero-grid { grid-template-columns:1fr !important; }
    .home-2c   { grid-template-columns:1fr !important; }
    .mini-2c   { grid-template-columns:1fr !important; }
    .art-grid  { grid-template-columns:1fr !important; }
    .foot-cols { flex-direction:column !important; }
    .prayers-r { flex-wrap:wrap !important; }
    .p-card    { min-width:calc(33.3% - 6px) !important; flex: none !important; }
    .util-bar  { display:none !important; }
  }
  @media(max-width:480px){
    .p-card    { min-width:calc(50% - 4px) !important; }
  }


  /* ── breadcrumb ── */
  .breadcrumb { display:flex; align-items:center; gap:6px; font-size:13px; padding:10px 20px; }
  .breadcrumb-link { color:#1a6b3a; text-decoration:none; cursor:pointer; background:none; border:none; font-family:inherit; font-size:inherit; padding:0; }
  .breadcrumb-link:hover { text-decoration:underline; }
  /* ── hadith row card ── */
  .hadith-row { padding:18px 20px; border-bottom:1px solid var(--border); transition:background .15s; }
  .hadith-row:hover { background:rgba(26,107,58,.03); }
  .hadith-row:last-child { border-bottom:none; }
  /* ── nav link ── */
  .nav-link { position:relative; display:flex; align-items:center; padding:0 14px; height:46px; font-size:14px; font-weight:500; cursor:pointer; border:none; background:none; color:rgba(255,255,255,.85); transition:color .15s; white-space:nowrap; font-family:inherit; }
  .nav-link:hover { color:#fff; background:rgba(255,255,255,.07); }
  .nav-link.active { color:#fff; font-weight:700; }
  .nav-link.active::after { content:''; position:absolute; bottom:0; left:50%; transform:translateX(-50%); width:60%; height:3px; background:#2ecc71; border-radius:3px 3px 0 0; }
  /* ── utility bar ── */
  .util-bar { display:flex; align-items:center; }
`;

// ─── Smooth TTS ───────────────────────────────────────────────────────────────
function smoothSpeak(text: string, onEnd?: () => void) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const trySpeak = () => {
    const utt = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const pref = ["Google UK English Female","Microsoft Zira Desktop","Samantha","Karen","Moira"];
    for (const n of pref) { const v = voices.find(v => v.name === n); if (v) { utt.voice = v; break; } }
    utt.rate = 0.72; utt.pitch = 0.82; utt.volume = 0.92; utt.lang = "en-GB";
    if (onEnd) utt.onend = onEnd;
    window.speechSynthesis.speak(utt);
  };
  if (window.speechSynthesis.getVoices().length > 0) trySpeak();
  else window.speechSynthesis.onvoiceschanged = trySpeak;
}

// ─── Falling Stars ────────────────────────────────────────────────────────────
function FallingStars({ starColor }: { starColor: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);
    type S = { x:number; y:number; len:number; speed:number; opacity:number; w:number };
    const stars: S[] = Array.from({ length: 28 }, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * -window.innerHeight,
      len: Math.random() * 80 + 28, speed: Math.random() * 1.3 + 0.35,
      opacity: Math.random() * 0.55 + 0.2, w: Math.random() * 1.1 + 0.3,
    }));
    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        const g = ctx.createLinearGradient(s.x, s.y, s.x - s.len*.28, s.y + s.len);
        g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(.4, starColor); g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.len*.28, s.y + s.len);
        ctx.strokeStyle = g; ctx.lineWidth = s.w; ctx.globalAlpha = s.opacity; ctx.stroke();
        ctx.beginPath(); ctx.arc(s.x, s.y, s.w*1.2, 0, Math.PI*2);
        ctx.fillStyle = `rgba(255,255,240,${s.opacity*1.3})`; ctx.globalAlpha = 1; ctx.fill();
        s.y += s.speed; s.x -= s.speed*.28;
        if (s.y > canvas.height + s.len) { s.y = Math.random()*-200; s.x = Math.random()*canvas.width; s.speed = Math.random()*1.3+.35; s.opacity = Math.random()*.55+.2; }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [starColor]);
  return <canvas ref={ref} style={{ position:"fixed", top:0, left:0, width:"100%", height:"100%", pointerEvents:"none", zIndex:0, opacity:.45 }} />;
}

// ─── Audio Hook ───────────────────────────────────────────────────────────────
// Strategy: create Audio in the play() call (which IS inside a user gesture),
// so browsers allow autoplay. Track state with refs to avoid stale closures.
function useAudio() {
  const audioRef    = useRef<HTMLAudioElement | null>(null);
  const [playing,   setPlaying]  = useState(false);
  const [loading,   setLoading]  = useState(false);
  const [current,   setCurrent]  = useState<number | null>(null);
  const [progress,  setProgress] = useState(0);
  const [duration,  setDuration] = useState(0);
  const rafRef      = useRef<number | null>(null);
  const currentRef  = useRef<number | null>(null);

  const stopCurrent = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; audioRef.current = null; }
    currentRef.current = null;
    setPlaying(false); setLoading(false); setCurrent(null); setProgress(0); setDuration(0);
  }, []);

  const play = useCallback((n: number) => {
    // Toggle off same track
    if (currentRef.current === n) { stopCurrent(); return; }

    // Stop previous
    stopCurrent();

    setCurrent(n); setLoading(true); setProgress(0); setDuration(0);
    currentRef.current = n;

    const a = new Audio(getSurahAudio(n));
    // Do NOT set crossOrigin — CDN allows direct fetch but blocks CORS preflight
    a.preload = "auto";
    audioRef.current = a;

    const tick = () => {
      if (!audioRef.current || audioRef.current !== a) return;
      setProgress(a.currentTime);
      setDuration(a.duration || 0);
      rafRef.current = requestAnimationFrame(tick);
    };

    const onPlayStart = () => {
      if (audioRef.current !== a) return;
      setLoading(false); setPlaying(true);
      rafRef.current = requestAnimationFrame(tick);
    };

    const tryPlay = () => {
      if (audioRef.current !== a) return;
      // play() called here is within the user-gesture call stack (onClick → play())
      a.play().then(onPlayStart).catch(() => {
        // Primary URL failed, try fallback
        if (audioRef.current !== a) return;
        a.src = getSurahAudioFallback(n);
        a.play().then(onPlayStart).catch(() => {
          if (audioRef.current !== a) return;
          setLoading(false); setPlaying(false);
        });
      });
    };

    a.addEventListener("canplay", tryPlay, { once: true });
    a.addEventListener("ended", stopCurrent, { once: true });
    a.addEventListener("error", () => {
      if (audioRef.current !== a) return;
      // Try fallback on error too
      a.src = getSurahAudioFallback(n);
      a.load();
      a.addEventListener("canplay", tryPlay, { once: true });
      a.addEventListener("error", stopCurrent, { once: true });
    }, { once: true });

    a.load();
  }, [stopCurrent]);

  const seek = useCallback((t: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = t;
    setProgress(t);
  }, []);

  useEffect(() => () => stopCurrent(), [stopCurrent]);

  return { play, seek, playing, loading, current, progress, duration };
}

type AudioHook = ReturnType<typeof useAudio>;

// ─── Audio Bar ────────────────────────────────────────────────────────────────
function AudioBar({ n, audio, C }: { n: number; audio: AudioHook; C: C }) {
  const isThis    = audio.current === n;
  const isPlaying = isThis && audio.playing;
  const isLoading = isThis && audio.loading;
  const pct       = isThis && audio.duration > 0 ? (audio.progress / audio.duration) * 100 : 0;
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
      <button
        onClick={() => audio.play(n)}
        title={isPlaying ? "Pause audio" : isLoading ? "Loading…" : "Play surah audio / অডিও শুনুন"}
        style={{ width:34, height:34, borderRadius:"50%", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, transition:"all .15s", flexShrink:0,
          background: isPlaying ? "#1a6b3a" : isLoading ? C.surface2 : C.surface2,
          color: isPlaying ? "#fff" : C.textMid,
          boxShadow: isPlaying ? "0 2px 10px rgba(26,107,58,.4)" : "none" }}>
        {isLoading ? "⏳" : isPlaying ? "⏸" : "▶"}
      </button>
      {isThis && audio.duration > 0 && (
        <div style={{ width:60, height:3, background:C.border, borderRadius:2, cursor:"pointer" }}
          onClick={e => { const r=(e.currentTarget as HTMLElement).getBoundingClientRect(); audio.seek((e.clientX-r.left)/r.width*audio.duration); }}>
          <div style={{ width:`${pct}%`, height:"100%", background:"#1a6b3a", borderRadius:2, transition:"width .3s linear" }} />
        </div>
      )}
    </div>
  );
}

// ─── Modal Shell ──────────────────────────────────────────────────────────────
function Modal({ children, onClose, C }: { children: React.ReactNode; onClose: () => void; C: C }) {
  useEffect(() => { document.body.style.overflow="hidden"; return () => { document.body.style.overflow=""; }; }, []);
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.8)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(8px)", animation:"fadeIn .2s ease", padding:16 }}>
      <div className="sci" onClick={e => e.stopPropagation()}
        style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:20, padding:28, width:"100%", maxWidth:480, maxHeight:"90vh", overflowY:"auto", boxShadow:`0 28px 70px ${C.shadow}` }}>
        {children}
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg }: { msg: string }) {
  return (
    <div style={{ position:"fixed", bottom:80, left:"50%", transform:"translateX(-50%)", background:"#1a6b3a", color:"#fff", padding:"10px 22px", borderRadius:24, fontWeight:700, fontSize:13, zIndex:10000, animation:"popIn .3s ease", whiteSpace:"nowrap", boxShadow:"0 8px 24px rgba(0,0,0,.3)" }}>
      {msg}
    </div>
  );
}

// ─── Avatar Display ───────────────────────────────────────────────────────────
function Avatar({ profile, size = 36, border }: { profile: UserProfile; size?: number; border?: string }) {
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:"linear-gradient(135deg,#1a6b3a,#0d4a2e)", border: border ?? "none", display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*.4, overflow:"hidden", flexShrink:0 }}>
      {profile.avatar
        ? <img src={profile.avatar} alt="avatar" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
        : <span>👤</span>
      }
    </div>
  );
}

// ─── Profile Modal ─────────────────────────────────────────────────────────────
function ProfileModal({ onClose, C, profile, setProfile }: {
  onClose: () => void; C: C;
  profile: UserProfile; setProfile: (p: UserProfile) => void;
}) {
  const [draft, setDraft] = useState<UserProfile>({ ...profile });
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setDraft(d => ({ ...d, avatar: ev.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const save = () => {
    setProfile(draft); setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 900);
  };

  const inp: React.CSSProperties = { background:C.inputBg, border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 14px", color:C.text, fontSize:14, outline:"none", width:"100%", marginTop:6, fontFamily:"inherit" };

  return (
    <Modal onClose={onClose} C={C}>
      {/* ── Avatar upload ── */}
      <div style={{ textAlign:"center", marginBottom:24 }}>
        <div style={{ position:"relative", display:"inline-block" }}>
          {/* Big avatar */}
          <div style={{ width:90, height:90, borderRadius:"50%", background:"linear-gradient(135deg,#1a6b3a,#0d4a2e)", border:`3px solid ${C.gold}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:38, overflow:"hidden", margin:"0 auto 6px", boxShadow:`0 0 0 4px ${C.surface},0 0 0 6px ${C.border}` }}>
            {draft.avatar
              ? <img src={draft.avatar} alt="avatar" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
              : <span>👤</span>
            }
          </div>
          {/* Camera button */}
          <button
            onClick={() => fileRef.current?.click()}
            title="Upload photo"
            style={{ position:"absolute", bottom:6, right:-4, width:30, height:30, borderRadius:"50%", background:"#1a6b3a", border:`2px solid ${C.surface}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, color:"#fff", boxShadow:"0 2px 8px rgba(0,0,0,.3)" }}>
            📷
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleAvatarChange} />
        </div>

        {draft.avatar && (
          <button onClick={() => setDraft(d => ({ ...d, avatar: null }))}
            style={{ background:"none", border:"none", color:C.textDim, fontSize:11, cursor:"pointer", display:"block", margin:"4px auto 0" }}>
            ছবি সরান
          </button>
        )}

        <h2 style={{ fontSize:20, fontWeight:700, color:C.text, marginTop:10 }}>আমার প্রোফাইল</h2>
        <p style={{ fontSize:12, color:C.textDim, marginTop:3 }}>সদস্য হয়েছেন {profile.joinDate} থেকে</p>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        {/* Editable fields */}
        {([["পূর্ণ নাম","name"],["ইমেইল","email"],["শহর","city"]] as [string, keyof UserProfile][]).map(([label, key]) => (
          <div key={label}>
            <div style={{ fontSize:11, color:C.textDim, letterSpacing:"0.06em" }}>{label}</div>
            <input style={inp} value={String(draft[key] ?? "")} onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))} />
          </div>
        ))}

        {/* Stats */}
        <div style={{ background:C.surface2, border:`1px solid ${C.border}`, borderRadius:12, padding:16 }}>
          <div style={{ fontSize:11, color:C.textDim, marginBottom:12, letterSpacing:"0.06em" }}>আপনার পরিসংখ্যান</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", textAlign:"center", gap:8 }}>
            {[["১৪২","দিন ধারাবাহিক 🔥"],["৫","জুয পড়া"],["১,২৪০","তাসবিহ"]].map(([v,l]) => (
              <div key={l}>
                <div style={{ fontSize:22, fontWeight:800, color:C.gold }}>{v}</div>
                <div style={{ fontSize:11, color:C.textDim }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <button onClick={save} style={{ background: saved ? C.success : `linear-gradient(135deg,${C.gold},${C.teal})`, border:"none", borderRadius:12, padding:"13px 0", color:"#fff", fontSize:15, fontWeight:700, cursor:"pointer", transition:"background .3s", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          {saved ? "✓ সংরক্ষিত!" : "পরিবর্তন সংরক্ষণ করুন"}
        </button>
      </div>
    </Modal>
  );
}

// ─── Settings Modal ───────────────────────────────────────────────────────────
function SettingsModal({ onClose, dark, setDark, C }: { onClose:()=>void; dark:boolean; setDark:(v:boolean)=>void; C:C }) {
  const [notif,   setNotif]   = useState(true);
  const [adhan,   setAdhan]   = useState(true);
  const [reciter, setReciter] = useState("মিশারি আলাফাসি");
  const Toggle = ({ label, sub, val, fn }: { label:string; sub?:string; val:boolean; fn:()=>void }) => (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"13px 0", borderBottom:`1px solid ${C.border}` }}>
      <div><div style={{ fontSize:14, fontWeight:500, color:C.text }}>{label}</div>{sub&&<div style={{ fontSize:12, color:C.textDim }}>{sub}</div>}</div>
      <button onClick={fn} style={{ width:46, height:25, background: val?C.gold:C.surface2, border:`1px solid ${val?C.gold:C.border}`, borderRadius:13, position:"relative", cursor:"pointer", transition:"all .25s", padding:0, flexShrink:0 }}>
        <div style={{ width:17, height:17, background:"#fff", borderRadius:"50%", position:"absolute", top:3, left: val?25:4, transition:"left .25s" }} />
      </button>
    </div>
  );
  return (
    <Modal onClose={onClose} C={C}>
      <h2 style={{ fontSize:20, fontWeight:700, color:C.text, marginBottom:4 }}>⚙️ সেটিংস</h2>
      <p style={{ fontSize:13, color:C.textDim, marginBottom:20 }}>আপনার অভিজ্ঞতা কাস্টমাইজ করুন</p>
      <Toggle label="ডার্ক মোড"     sub="ডার্ক / লাইট থিম পরিবর্তন করুন"  val={dark}  fn={() => setDark(!dark)} />
      <Toggle label="বিজ্ঞপ্তি" sub="নামাজের সময় রিমাইন্ডার"      val={notif} fn={() => setNotif(v => !v)} />
      <Toggle label="আযান সতর্কতা"   sub="নামাজের সময় আযান বাজান" val={adhan} fn={() => setAdhan(v => !v)} />
      <div style={{ padding:"13px 0", borderBottom:`1px solid ${C.border}` }}>
        <div style={{ fontSize:14, fontWeight:500, color:C.text, marginBottom:8 }}>ক্বারী</div>
        {["মিশারি আলাফাসি","আব্দুর রহমান আস-সুদাইস","সা'দ আল-গামেদী"].map(r => (
          <button key={r} onClick={() => setReciter(r)} style={{ display:"block", width:"100%", textAlign:"left", padding:"8px 12px", borderRadius:8, background: reciter===r?C.surface2:"none", border: reciter===r?`1px solid ${C.gold}`:"1px solid transparent", color: reciter===r?C.gold:C.textMid, fontSize:13, cursor:"pointer", marginBottom:4 }}>
            {reciter===r?"✓ ":""}{r}
          </button>
        ))}
      </div>
      <div style={{ padding:"13px 0", fontSize:13, color:C.textDim }}>ওয়াক্ত v২.০ — আধুনিক উম্মাহর জন্য তৈরি</div>
    </Modal>
  );
}

// ─── Page entry animation wrapper ─────────────────────────────────────────────
function PW({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}


// ─── Quran Page ───────────────────────────────────────────────────────────────
function QuranPage({ C, audio }: { C:C; audio:AudioHook }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all"|"meccan"|"medinan">("all");
  const list = QURAN_SURAHS.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) && (filter==="all" || s.type.toLowerCase()===filter));
  return (
    <PW>
      <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
        {/* iHadis green section header */}
        <div style={{ background:"#1a6b3a", padding:"12px 18px", borderRadius:"8px 8px 0 0", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
          <div>
            <div style={{ fontSize:17, fontWeight:700, color:"#fff", fontFamily:"'Noto Serif',Georgia,serif" }}>القرآن الكريم — কুরআনুল কারীম / Holy Quran</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,.75)", marginTop:2 }}>মিশারি আলাফাসি · শুনতে / Listen ▶ চাপুন / Tap</div>
          </div>
          <div style={{ display:"flex", gap:6 }}>
            {(["all","meccan","medinan"] as const).map(f => <button key={f} onClick={() => setFilter(f)} style={{ padding:"5px 12px", borderRadius:5, background: filter===f?"rgba(255,255,255,.25)":"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.3)", color:"#fff", fontSize:12, cursor:"pointer", fontWeight: filter===f?700:400, fontFamily:"inherit" }}>{f==="all"?"সকল":f==="meccan"?"মাক্কী":"মাদানী"}</button>)}
          </div>
        </div>
        {/* Search */}
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderTop:"none", padding:"10px 14px" }}>
          <input style={{ width:"100%", background:C.surface2, border:`1px solid ${C.border}`, borderRadius:6, padding:"7px 12px", color:C.text, fontSize:13, outline:"none", fontFamily:"inherit" }} placeholder="সূরার নাম বা নম্বর দিয়ে খুঁজুন…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {/* Column header */}
        <div style={{ background:C.surface2, border:`1px solid ${C.border}`, borderTop:"none", display:"grid", gridTemplateColumns:"44px 1fr 100px 60px 110px", padding:"7px 14px", fontSize:11, fontWeight:700, color:C.textDim, letterSpacing:"0.07em" }}>
          <span>#</span><span>সূরার নাম / Surah</span><span style={{ textAlign:"right", paddingRight:28 }}>Arabic</span><span style={{ textAlign:"center" }}>আয়াত</span><span style={{ textAlign:"right" }}>Audio</span>
        </div>
        {/* Rows */}
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderTop:"none", borderRadius:"0 0 8px 8px", overflow:"hidden" }}>
          {list.map((s, i) => (
            <div key={s.num} style={{ display:"grid", gridTemplateColumns:"44px 1fr 100px 60px 110px", alignItems:"center", padding:"9px 14px", borderBottom: i<list.length-1?`1px solid ${C.border}`:"none", background: audio.current===s.num&&audio.playing?"rgba(26,107,58,.06)":"transparent", transition:"background .15s", animation:`fadeUp .35s ${i*.03}s both` }}>
              <div style={{ width:28, height:28, background:"#1a6b3a", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#fff" }}>{s.num}</div>
              <div>
                <div style={{ fontSize:14, fontWeight:600, color:C.text }}>{s.name}</div>
                <div style={{ fontSize:11, color:C.textDim }}>{s.type} · {s.type==="মাক্কী"?"Meccan":"Medinan"}</div>
              </div>
              <div style={{ fontSize:17, color:C.textMid, fontFamily:"Georgia,serif", textAlign:"right", paddingRight:20, direction:"rtl" }}>{s.arabic}</div>
              <div style={{ fontSize:12, color:C.textDim, textAlign:"center" }}>{s.verses}</div>
              <div style={{ display:"flex", justifyContent:"flex-end" }}><AudioBar n={s.num} audio={audio} C={C} /></div>
            </div>
          ))}
        </div>
      </div>
    </PW>
  );
}

// ─── Hadith Page — iHadis.com style ──────────────────────────────────────────

interface HBook  { id: string; name: string; arabic: string; hadiths: number; chapters: number; color: string; }
interface HChapter { id: number; bookId: string; english: string; arabic: string; hadiths_count: number; }
interface HHadith  { id: number; idInBook: number; chapterId: string; bookId: string; arabic: string; english: { narrator: string; text: string; }; }

const HADITH_BOOKS: HBook[] = [
  { id:"bukhari",    name:"সহীহ আল-বুখারী",  arabic:"صحيح البخاري", hadiths:7563, chapters:97,  color:"#C9A84C" },
  { id:"muslim",     name:"সহীহ মুসলিম",       arabic:"صحيح مسلم",    hadiths:7470, chapters:56,  color:"#4A8C7A" },
  { id:"abudawud",   name:"সুনানে আবু দাউদ",    arabic:"سنن أبي داود", hadiths:5274, chapters:43,  color:"#6B8EC9" },
  { id:"tirmidhi",   name:"জামে আত-তিরমিযী",  arabic:"جامع الترمذي", hadiths:3956, chapters:49,  color:"#C97A4A" },
  { id:"nasai",      name:"সুনানে নাসাঈ",    arabic:"سنن النسائي",  hadiths:5761, chapters:51,  color:"#7A6BC9" },
  { id:"ibnmajah",   name:"সুনানে ইবনে মাজাহ",    arabic:"سنن ابن ماجه", hadiths:4341, chapters:37,  color:"#C94A4A" },
  { id:"malik",      name:"মুয়াত্তা মালিক",       arabic:"موطأ مالك",    hadiths:1832, chapters:61,  color:"#4AC9A8" },
  { id:"riyadussalihin", name:"রিয়াদুস সালিহীন", arabic:"رياض الصالحين", hadiths:1906, chapters:372, color:"#A8C94A" },
];

// Rich embedded hadith data per book (chapters + sample hadiths)
const BUKHARI_CHAPTERS: HChapter[] = [
  { id:1,  bookId:"bukhari", english:"ওহী",               arabic:"بدء الوحي",          hadiths_count:7   },
  { id:2,  bookId:"bukhari", english:"ঈমান",                    arabic:"الإيمان",             hadiths_count:51  },
  { id:3,  bookId:"bukhari", english:"জ্ঞান",                 arabic:"العلم",               hadiths_count:76  },
  { id:4,  bookId:"bukhari", english:"অজু",          arabic:"الوضوء",              hadiths_count:113 },
  { id:5,  bookId:"bukhari", english:"গোসল",           arabic:"الغسل",               hadiths_count:45  },
  { id:6,  bookId:"bukhari", english:"হায়েয",         arabic:"الحيض",               hadiths_count:37  },
  { id:7,  bookId:"bukhari", english:"তায়াম্মুম",                  arabic:"التيمم",              hadiths_count:15  },
  { id:8,  bookId:"bukhari", english:"নামাজ (সালাত)",           arabic:"الصلاة",              hadiths_count:129 },
  { id:9,  bookId:"bukhari", english:"নামাজের সময়সূচী",      arabic:"مواقيت الصلاة",      hadiths_count:50  },
  { id:10, bookId:"bukhari", english:"আযান",  arabic:"الأذان",              hadiths_count:166 },
];
const MUSLIM_CHAPTERS: HChapter[] = [
  { id:1,  bookId:"muslim", english:"ঈমান",                arabic:"الإيمان",       hadiths_count:431 },
  { id:2,  bookId:"muslim", english:"পবিত্রতা",         arabic:"الطهارة",       hadiths_count:145 },
  { id:3,  bookId:"muslim", english:"হায়েয",         arabic:"الحيض",         hadiths_count:158 },
  { id:4,  bookId:"muslim", english:"নামাজ",               arabic:"الصلاة",        hadiths_count:399 },
  { id:5,  bookId:"muslim", english:"যাকাত",                arabic:"الزكاة",        hadiths_count:227 },
  { id:6,  bookId:"muslim", english:"রোজা",              arabic:"الصيام",        hadiths_count:286 },
  { id:7,  bookId:"muslim", english:"হজ",           arabic:"الحج",          hadiths_count:584 },
  { id:8,  bookId:"muslim", english:"বিবাহ",             arabic:"النكاح",        hadiths_count:242 },
  { id:9,  bookId:"muslim", english:"তালাক",              arabic:"الطلاق",        hadiths_count:135 },
  { id:10, bookId:"muslim", english:"ব্যবসা-বাণিজ্য",arabic:"البيوع",        hadiths_count:320 },
];
const ABU_DAWUD_CHAPTERS: HChapter[] = [
  { id:1,  bookId:"abudawud", english:"পবিত্রতা",         arabic:"الطهارة",       hadiths_count:400 },
  { id:2,  bookId:"abudawud", english:"নামাজ",               arabic:"الصلاة",        hadiths_count:600 },
  { id:3,  bookId:"abudawud", english:"যাকাত",                arabic:"الزكاة",        hadiths_count:110 },
  { id:4,  bookId:"abudawud", english:"রোজা",              arabic:"الصيام",        hadiths_count:90  },
  { id:5,  bookId:"abudawud", english:"হজ",           arabic:"المناسك",       hadiths_count:230 },
  { id:6,  bookId:"abudawud", english:"বিবাহ",             arabic:"النكاح",        hadiths_count:160 },
  { id:7,  bookId:"abudawud", english:"তালাক",              arabic:"الطلاق",        hadiths_count:75  },
  { id:8,  bookId:"abudawud", english:"সিয়াম (রোজা)",       arabic:"الصوم",         hadiths_count:95  },
  { id:9,  bookId:"abudawud", english:"জিহাদ",                arabic:"الجهاد",        hadiths_count:280 },
  { id:10, bookId:"abudawud", english:"কুরবানী",           arabic:"الضحايا",       hadiths_count:50  },
];
const DEFAULT_CHAPTERS: HChapter[] = [
  { id:1, bookId:"default", english:"অধ্যায় ১", arabic:"باب الأول", hadiths_count:50 },
  { id:2, bookId:"default", english:"অধ্যায় ২", arabic:"باب الثاني", hadiths_count:40 },
  { id:3, bookId:"default", english:"অধ্যায় ৩", arabic:"باب الثالث", hadiths_count:60 },
  { id:4, bookId:"default", english:"অধ্যায় ৪", arabic:"باب الرابع", hadiths_count:35 },
  { id:5, bookId:"default", english:"অধ্যায় ৫", arabic:"باب الخامس", hadiths_count:45 },
];

function getChaptersForBook(bookId: string): HChapter[] {
  if (bookId === "bukhari")  return BUKHARI_CHAPTERS;
  if (bookId === "muslim")   return MUSLIM_CHAPTERS;
  if (bookId === "abudawud") return ABU_DAWUD_CHAPTERS;
  return DEFAULT_CHAPTERS.map(c => ({ ...c, bookId }));
}

// Rich embedded hadith dataset keyed by bookId:chapterId
const EMBEDDED_HADITHS: Record<string, HHadith[]> = {
  "bukhari:1": [
    { id:1, idInBook:1, chapterId:"1", bookId:"bukhari", arabic:"حَدَّثَنَا الْحُمَيْدِيُّ عَبْدُ اللَّهِ بْنُ الزُّبَيْرِ، قَالَ حَدَّثَنَا سُفْيَانُ", english:{ narrator:"Umar bin Al-Khattab", text:"I heard Allah's Messenger (ﷺ) saying, 'The reward of deeds depends upon the intention and every person will get the reward according to what he has intended. So whoever emigrated for Allah and His Apostle, then his emigration was for Allah and His Apostle. And whoever emigrated for worldly benefits or for a woman to marry, his emigration was for what he emigrated for.'" } },
    { id:2, idInBook:2, chapterId:"1", bookId:"bukhari", arabic:"حَدَّثَنَا عَبْدُ اللَّهِ بْنُ يُوسُفَ، قَالَ أَخْبَرَنَا مَالِكٌ", english:{ narrator:"Aisha (Mother of the Faithful Believers)", text:"Al-Harith bin Hisham asked Allah's Messenger (ﷺ), 'O Allah's Messenger! How is the divine inspiration revealed to you?' Allah's Messenger (ﷺ) replied, 'Sometimes it is (revealed) like the ringing of a bell, this form of inspiration is the hardest of all and then this state passes off after I have grasped what is inspired.'" } },
    { id:3, idInBook:3, chapterId:"1", bookId:"bukhari", arabic:"حَدَّثَنَا يَحْيَى بْنُ بُكَيْرٍ، قَالَ حَدَّثَنَا اللَّيْثُ عَنْ عُقَيْلٍ", english:{ narrator:"Aisha (Mother of the Faithful Believers)", text:"The commencement of the divine inspiration to Allah's Messenger (ﷺ) was in the form of good righteous (true) dreams in his sleep. He never had a dream but that it came true like bright daylight." } },
    { id:4, idInBook:4, chapterId:"1", bookId:"bukhari", arabic:"حَدَّثَنَا مُوسَى بْنُ إِسْمَاعِيلَ قَالَ حَدَّثَنَا أَبُو عَوَانَةَ", english:{ narrator:"Jabir bin Abdullah Al-Ansari", text:"While we were in an open field, Allah's Messenger (ﷺ) said, 'Your friend Gabriel came and said: Whoever among your followers dies without worshipping anything besides Allah, will enter Paradise or will not enter the (Hell) Fire.'" } },
    { id:5, idInBook:5, chapterId:"1", bookId:"bukhari", arabic:"حَدَّثَنَا عَبْدُ اللَّهِ بْنُ مُحَمَّدٍ الْجُعْفِيُّ", english:{ narrator:"Ibn Abbas", text:"Allah's Messenger (ﷺ) was the most generous of all the people, and he used to become more generous in Ramadan when Gabriel met him. Gabriel used to meet him every night during Ramadan to revise the Qur'an." } },
    { id:6, idInBook:6, chapterId:"1", bookId:"bukhari", arabic:"حَدَّثَنَا أَبُو الْيَمَانِ الْحَكَمُ بْنُ نَافِعٍ قَالَ أَخْبَرَنَا شُعَيْبٌ", english:{ narrator:"Ibn Shihab", text:"The first one to be saved from the Holy Spirit (Gabriel) with revelation was Khadijah the daughter of Khuwaylid. The Prophet (ﷺ) said: She believed in me when others rejected me, and assisted me when others failed me, and provided me comfort when others shunned me." } },
    { id:7, idInBook:7, chapterId:"1", bookId:"bukhari", arabic:"حَدَّثَنَا عَبْدُ الْعَزِيزِ بْنُ عَبْدِ اللَّهِ", english:{ narrator:"Aisha (Mother of the Faithful Believers)", text:"Khadijah then accompanied him to her cousin Waraqa bin Naufal, who during the pre-Islamic period became a Christian and used to write the Hebrew writing and used to write of the Gospels in Hebrew as much as Allah wished him to write." } },
  ],
  "bukhari:2": [
    { id:8, idInBook:8, chapterId:"2", bookId:"bukhari", arabic:"حَدَّثَنَا عُبَيْدُ اللَّهِ بْنُ مُوسَى قَالَ أَخْبَرَنَا حَنْظَلَةُ بْنُ أَبِي سُفْيَانَ", english:{ narrator:"Abu Hurairah", text:"The Prophet (ﷺ) said, 'A Muslim is the one from whose tongue and hands the Muslims are safe; and a Muhajir (emigrant) is the one who abandons (emigrates from) what Allah has forbidden.'" } },
    { id:9, idInBook:9, chapterId:"2", bookId:"bukhari", arabic:"حَدَّثَنَا أَبُو الْيَمَانِ قَالَ أَخْبَرَنَا شُعَيْبٌ عَنِ الزُّهْرِيِّ", english:{ narrator:"Anas bin Malik", text:"The Prophet (ﷺ) said, 'None of you will have faith till he wishes for his (Muslim) brother what he likes for himself.'" } },
    { id:10, idInBook:10, chapterId:"2", bookId:"bukhari", arabic:"حَدَّثَنَا مُحَمَّدُ بْنُ عُبَيْدِ اللَّهِ قَالَ حَدَّثَنَا إِبْرَاهِيمُ بْنُ سَعْدٍ", english:{ narrator:"Abu Hurairah", text:"Allah's Messenger (ﷺ) said, 'By Him in Whose Hands my life is, none of you will have faith till he loves me more than his father and his children.'" } },
    { id:11, idInBook:11, chapterId:"2", bookId:"bukhari", arabic:"حَدَّثَنَا مُحَمَّدُ بْنُ عَرْعَرَةَ قَالَ حَدَّثَنَا شُعْبَةُ", english:{ narrator:"Anas", text:"The Prophet (ﷺ) said, 'Whoever possesses the following three qualities will have the sweetness (delight) of faith: The one to whom Allah and His Apostle becomes dearer than anything else; who loves a person and he loves him only for Allah's sake; who hates to revert to atheism as he hates to be thrown into the fire.'" } },
    { id:12, idInBook:12, chapterId:"2", bookId:"bukhari", arabic:"حَدَّثَنَا مُحَمَّدُ بْنُ الْمُثَنَّى قَالَ حَدَّثَنَا يَحْيَى", english:{ narrator:"Abdullah bin Amr", text:"A man asked the Prophet (ﷺ), 'What sort of deeds or (what qualities of) Islam are good?' The Prophet (ﷺ) replied, 'To feed (the poor) and greet those whom you know and those whom you do not know.'" } },
  ],
  "bukhari:3": [
    { id:13, idInBook:59, chapterId:"3", bookId:"bukhari", arabic:"حَدَّثَنَا مُحَمَّدُ بْنُ سَلامٍ قَالَ أَخْبَرَنَا مَرْوَانُ بْنُ مُعَاوِيَةَ الْفَزَارِيُّ", english:{ narrator:"Muawiyah", text:"I heard the Prophet (ﷺ) saying, 'If Allah wants to do good to a person, He makes him comprehend the religion. I am just a distributor, but the grant is from Allah. (And remember) that this nation (true Muslims) will keep on following Allah's teachings strictly and they will not be harmed by any one going on a different path till Allah's order (Day of Judgment) is established.'" } },
    { id:14, idInBook:60, chapterId:"3", bookId:"bukhari", arabic:"حَدَّثَنَا سَعِيدُ بْنُ عُفَيْرٍ قَالَ حَدَّثَنَا ابْنُ وَهْبٍ", english:{ narrator:"Ibn Abbas", text:"The Prophet (ﷺ) embraced me and said, 'O Allah! Bestow on him the knowledge of the Book (Qur'an).'" } },
    { id:15, idInBook:61, chapterId:"3", bookId:"bukhari", arabic:"حَدَّثَنَا عَلِيُّ بْنُ الْجَعْدِ قَالَ أَخْبَرَنَا شُعْبَةُ قَالَ أَخْبَرَنِي عَلْقَمَةُ", english:{ narrator:"Abdullah bin Masud", text:"Allah's Messenger (ﷺ) said, 'Do not wish to be like anyone except in two cases. (The first is) A person, whom Allah has given wealth and he spends it righteously; (the second is) the one whom Allah has given wisdom (the Holy Quran) and he acts according to it and teaches it to others.'" } },
    { id:16, idInBook:62, chapterId:"3", bookId:"bukhari", arabic:"حَدَّثَنَا مُسَدَّدٌ قَالَ حَدَّثَنَا بِشْرٌ قَالَ حَدَّثَنَا ابْنُ عَوْنٍ", english:{ narrator:"Anas bin Malik", text:"Allah's Messenger (ﷺ) said, 'Seeking knowledge is an obligation upon every Muslim.'" } },
  ],
  "muslim:1": [
    { id:100, idInBook:1, chapterId:"1", bookId:"muslim", arabic:"حَدَّثَنِي زُهَيْرُ بْنُ حَرْبٍ وَشَيْبَانُ بْنُ فَرُّوخَ كِلاهُمَا عَنْ جَرِيرٍ", english:{ narrator:"Abu Hurairah", text:"The Messenger of Allah (ﷺ) said: Islam is built upon five: to testify that none has the right to be worshipped but Allah and that Muhammad is the Messenger of Allah; to establish the prayer; to pay the Zakat; to perform Hajj to the House; and to fast in Ramadan." } },
    { id:101, idInBook:2, chapterId:"1", bookId:"muslim", arabic:"حَدَّثَنَا أَبُو بَكْرِ بْنُ أَبِي شَيْبَةَ وَزُهَيْرُ بْنُ حَرْبٍ جَمِيعًا عَنِ ابْنِ عُلَيَّةَ", english:{ narrator:"Jabir bin Abdullah", text:"The Messenger of Allah (ﷺ) said: Between a man and shirk and kufr there stands his giving up of prayer." } },
    { id:102, idInBook:3, chapterId:"1", bookId:"muslim", arabic:"حَدَّثَنَا يَحْيَى بْنُ يَحْيَى التَّمِيمِيُّ قَالَ قَرَأْتُ عَلَى مَالِكٍ", english:{ narrator:"Yahya ibn Yahya", text:"The Messenger of Allah (ﷺ) said: He who obeys me obeys Allah, and he who disobeys me disobeys Allah. He who obeys the ruler, obeys me, and he who disobeys the ruler, disobeys me." } },
    { id:103, idInBook:4, chapterId:"1", bookId:"muslim", arabic:"حَدَّثَنَا إِسْحَاقُ بْنُ إِبْرَاهِيمَ الْحَنْظَلِيُّ وَعَلِيُّ بْنُ خَشْرَمٍ", english:{ narrator:"Umar bin Al-Khattab", text:"I asked the Messenger of Allah (ﷺ): What is faith? He replied: Faith means that you have faith in Allah, His Angels, His Books, His Messengers, the Last Day, and that you believe in providence — both its good and bad aspects." } },
    { id:104, idInBook:5, chapterId:"1", bookId:"muslim", arabic:"حَدَّثَنَا أَبُو بَكْرِ بْنُ أَبِي شَيْبَةَ حَدَّثَنَا أَبُو مُعَاوِيَةَ وَوَكِيعٌ", english:{ narrator:"Abu Hurairah", text:"Allah's Messenger (ﷺ) said: He who died without fighting in the cause of Allah or without having felt it to be his duty (to fight in the cause of Allah), dies a kind of hypocrite's death." } },
  ],
  "muslim:2": [
    { id:200, idInBook:225, chapterId:"2", bookId:"muslim", arabic:"حَدَّثَنَا يَحْيَى بْنُ يَحْيَى التَّمِيمِيُّ", english:{ narrator:"Abu Hurairah", text:"Allah's Messenger (ﷺ) said: When a Muslim, or a believer washes his face (in the course of Wudu'), every sin he has committed with his eyes is washed away from his face along with the water, or with the last drop of water." } },
    { id:201, idInBook:226, chapterId:"2", bookId:"muslim", arabic:"حَدَّثَنَا قُتَيْبَةُ بْنُ سَعِيدٍ حَدَّثَنَا لَيْثٌ عَنِ ابْنِ عَجْلانَ", english:{ narrator:"Abu Malik al-Ashari", text:"Cleanliness is half of faith and al-Hamdu Lillah fills the scale, and Subhan Allah and al-Hamdu Lillah fill up what is between the heavens and the earth, and prayer is a light, and charity is proof (of one's faith)." } },
    { id:202, idInBook:227, chapterId:"2", bookId:"muslim", arabic:"حَدَّثَنَا عَبْدُ اللَّهِ بْنُ مَسْلَمَةَ بْنِ قَعْنَبٍ", english:{ narrator:"Uthman bin Affan", text:"He who performed ablution well, his sins would come out from his body, even coming out from under his nails." } },
  ],
  "abudawud:1": [
    { id:300, idInBook:1, chapterId:"1", bookId:"abudawud", arabic:"حَدَّثَنَا الْقَعْنَبِيُّ عَنْ مَالِكٍ عَنْ أَبِي الزِّنَادِ", english:{ narrator:"Abu Hurairah", text:"The Messenger of Allah (ﷺ) said: If there were a river at the door of any of you, and he took a bath in it five times a day, would you notice any dirt on him? They said: Not a trace of dirt would be left. He said: This is the parable of the five prayers through which Allah blots out evil deeds." } },
    { id:301, idInBook:2, chapterId:"1", bookId:"abudawud", arabic:"حَدَّثَنَا عَبْدُ اللَّهِ بْنُ مَسْلَمَةَ الْقَعْنَبِيُّ", english:{ narrator:"Abu Hurairah", text:"The Messenger of Allah (ﷺ) said regarding a man who performed ablution and left a small part of his foot dry: Go back and perform ablution properly. The man went back and performed ablution, then he offered the prayer." } },
    { id:302, idInBook:3, chapterId:"1", bookId:"abudawud", arabic:"حَدَّثَنَا مُسَدَّدٌ حَدَّثَنَا أَبُو عَوَانَةَ", english:{ narrator:"Humran", text:"Uthman b. Affan called for water to perform ablution. He washed his hands three times, then rinsed his mouth and snuffed up water and blew it out, then washed his face three times, then washed his right hand up to the elbow three times, then washed his left hand similarly, then wiped his head, then washed his right foot three times, then his left foot similarly." } },
  ],
};

function HadithPage({ C }: { C:C }) {
  const [view,           setView]          = useState<"books"|"chapters"|"hadiths"|"search">("books");
  const [selectedBook,   setSelectedBook]  = useState<HBook|null>(null);
  const [selectedChapter,setSelectedChapter] = useState<HChapter|null>(null);
  const [chapters,       setChapters]      = useState<HChapter[]>([]);
  const [hadiths,        setHadiths]       = useState<HHadith[]>([]);
  const [loading,        setLoading]       = useState(false);
  const [searchQ,        setSearchQ]       = useState("");
  const [searchInput,    setSearchInput]   = useState("");
  const [searchResults,  setSearchResults] = useState<HHadith[]>([]);
  const [speaking,       setSpeaking]      = useState<number|null>(null);
  const [bookmarked,     setBookmarked]    = useState<number[]>([]);
  const [copied,         setCopied]        = useState<number|null>(null);
  const [mobilePane,     setMobilePane]    = useState<"list"|"content">("list");

  const openBook = (book: HBook) => {
    setSelectedBook(book);
    setSelectedChapter(null);
    setHadiths([]);
    setView("chapters");
    setMobilePane("content");
    setChapters(getChaptersForBook(book.id));
  };

  const openChapter = (ch: HChapter) => {
    setSelectedChapter(ch);
    setView("hadiths");
    setMobilePane("content");
    setLoading(true);
    setTimeout(() => {
      const key = `${ch.bookId}:${ch.id}`;
      const data = EMBEDDED_HADITHS[key] || [];
      setHadiths(data);
      setLoading(false);
    }, 300);
  };

  const doSearch = () => {
    if (!searchInput.trim()) return;
    setSearchQ(searchInput);
    setView("search");
    setMobilePane("content");
    const q = searchInput.toLowerCase();
    const results: HHadith[] = [];
    for (const key of Object.keys(EMBEDDED_HADITHS)) {
      for (const h of EMBEDDED_HADITHS[key]) {
        if (h.english.text.toLowerCase().includes(q) || h.english.narrator.toLowerCase().includes(q)) {
          results.push(h);
        }
      }
    }
    setSearchResults(results);
  };

  const toggleBookmark = (id: number) => setBookmarked(b => b.includes(id) ? b.filter(x => x !== id) : [...b, id]);

  const copyHadith = (h: HHadith) => {
    const text = `Narrated by ${h.english.narrator}:\n"${h.english.text}"\n— ${HADITH_BOOKS.find(b=>b.id===h.bookId)?.name} #${h.idInBook}`;
    navigator.clipboard.writeText(text).then(() => { setCopied(h.id); setTimeout(() => setCopied(null), 1600); });
  };

  const speakHadith = (h: HHadith) => {
    if (speaking === h.id) { window.speechSynthesis.cancel(); setSpeaking(null); return; }
    setSpeaking(h.id);
    smoothSpeak(`Narrated by ${h.english.narrator}. ${h.english.text}`, () => setSpeaking(null));
  };

  const goBack = () => {
    if (view === "hadiths" || view === "search") { setView(selectedBook ? "chapters" : "books"); setMobilePane("content"); }
    else if (view === "chapters") { setView("books"); setSelectedBook(null); setMobilePane("list"); }
  };

  // ── Sidebar ──────────────────────────────────────────────────────────────────
  const Sidebar = () => (
    <div style={{ width:260, flexShrink:0, display:"flex", flexDirection:"column", gap:6 }}>
      {/* Search box */}
      <div style={{ display:"flex", gap:6, marginBottom:8 }}>
        <input
          value={searchInput} onChange={e => setSearchInput(e.target.value)}
          onKeyDown={e => e.key==="Enter" && doSearch()}
          placeholder="হাদিস অনুসন্ধান করুন…"
          style={{ flex:1, background:C.inputBg, border:`1px solid ${C.border}`, borderRadius:9, padding:"8px 12px", color:C.text, fontSize:13, outline:"none" }}
        />
        <button onClick={doSearch} style={{ background:C.gold, border:"none", borderRadius:9, padding:"8px 12px", color:"#000", fontSize:13, cursor:"pointer", fontWeight:700 }}>🔍</button>
      </div>
      {/* Book list */}
      <div style={{ fontSize:10, letterSpacing:"0.12em", color:C.textDim, marginBottom:4, paddingLeft:4 }}>হাদিস গ্রন্থসমূহ</div>
      {HADITH_BOOKS.map(book => (
        <button key={book.id} onClick={() => openBook(book)} style={{ background: selectedBook?.id===book.id ? C.surface2 : "none", border:`1px solid ${selectedBook?.id===book.id ? book.color : "transparent"}`, borderRadius:10, padding:"10px 12px", cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:10, transition:"all .15s" }}>
          <div style={{ width:4, height:36, borderRadius:2, background:book.color, flexShrink:0 }} />
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:13, fontWeight:600, color: selectedBook?.id===book.id ? C.text : C.textMid, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{book.name}</div>
            <div style={{ fontSize:10, color:C.textDim, marginTop:1 }}>{book.hadiths.toLocaleString()} হাদিস</div>
          </div>
          {selectedBook?.id===book.id && <span style={{ color:book.color, fontSize:12 }}>›</span>}
        </button>
      ))}
    </div>
  );

  // ── Chapter List ─────────────────────────────────────────────────────────────
  const ChapterList = () => (
    <div style={{ flex:1, display:"flex", flexDirection:"column", gap:0 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
        <button onClick={goBack} style={{ background:C.surface2, border:`1px solid ${C.border}`, borderRadius:8, padding:"6px 12px", color:C.textMid, fontSize:12, cursor:"pointer" }}>← পিছনে</button>
        <div>
          <div style={{ fontSize:16, fontWeight:700, color:C.text }}>{selectedBook?.name}</div>
          <div style={{ fontSize:11, color:C.textDim }}>{selectedBook?.hadiths.toLocaleString()} হাদিস · {selectedBook?.chapters} অধ্যায়</div>
        </div>
        <div style={{ marginLeft:"auto", fontSize:18, fontFamily:"Georgia,serif", color:C.textMid }}>{selectedBook?.arabic}</div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
        {chapters.map((ch, i) => (
          <button key={ch.id} onClick={() => openChapter(ch)}
            style={{ background: selectedChapter?.id===ch.id ? C.surface2 : C.surface, border:`1px solid ${selectedChapter?.id===ch.id ? (selectedBook?.color ?? C.gold) : C.border}`, borderRadius:10, padding:"12px 16px", cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:12, transition:"all .15s", animation:`fadeUp .3s ${i*.03}s both` }}>
            <div style={{ width:28, height:28, borderRadius:7, background:C.surface2, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:selectedBook?.color ?? C.gold, flexShrink:0 }}>{ch.id}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{ch.english}</div>
              <div style={{ fontSize:11, color:C.textDim, marginTop:1 }}>{ch.arabic} · {ch.hadiths_count} হাদিস</div>
            </div>
            <span style={{ color:C.textDim, fontSize:14 }}>›</span>
          </button>
        ))}
      </div>
    </div>
  );

  // ── Hadith Card ───────────────────────────────────────────────────────────────
  const HadithCard = ({ h, idx }: { h: HHadith; idx: number }) => {
    const book = HADITH_BOOKS.find(b => b.id === h.bookId);
    const isBookmarked = bookmarked.includes(h.id);
    return (
      <div style={{ background:C.surface, border:`1px solid ${speaking===h.id ? (book?.color ?? C.gold) : C.border}`, borderRadius:14, padding:20, animation:`fadeUp .35s ${idx*.05}s both`, transition:"border-color .2s" }}>
        {/* Header row */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
          <div style={{ background:book?.color ?? C.gold, borderRadius:7, padding:"3px 10px", fontSize:11, fontWeight:700, color:"#000" }}>{book?.name ?? ""}</div>
          <div style={{ background:C.surface2, border:`1px solid ${C.border}`, borderRadius:7, padding:"3px 10px", fontSize:11, color:C.textDim }}>#{h.idInBook}</div>
          <div style={{ flex:1 }} />
          <button onClick={() => toggleBookmark(h.id)} title="Bookmark" style={{ background:"none", border:"none", cursor:"pointer", fontSize:16, color: isBookmarked ? C.gold : C.textDim, transition:"color .15s" }}>
            {isBookmarked ? "🔖" : "📑"}
          </button>
          <button onClick={() => copyHadith(h)} title="Copy" style={{ background:copied===h.id?C.gold:C.surface2, border:`1px solid ${C.border}`, borderRadius:7, padding:"4px 10px", fontSize:11, cursor:"pointer", color:copied===h.id?"#000":C.textMid, transition:"all .15s" }}>
            {copied===h.id ? "✓ কপি হয়েছে" : "📋 কপি করুন"}
          </button>
          <button onClick={() => speakHadith(h)} style={{ background:speaking===h.id?(book?.color??C.gold):C.surface2, border:`1px solid ${speaking===h.id?(book?.color??C.gold):C.border}`, borderRadius:7, padding:"4px 10px", fontSize:11, cursor:"pointer", color:speaking===h.id?"#000":C.textMid, display:"flex", alignItems:"center", gap:4, transition:"all .2s" }}>
            {speaking===h.id ? <>⏹ বন্ধ করুন</> : <>🔊 শুনুন</>}
          </button>
        </div>
        {/* Arabic text */}
        <div style={{ fontSize:20, lineHeight:2.1, textAlign:"right", direction:"rtl", color:C.text, fontFamily:"Georgia,serif", marginBottom:14, padding:"12px 16px", background:C.surface2, borderRadius:10, borderRight:`3px solid ${book?.color ?? C.gold}` }}>
          {h.arabic}
        </div>
        {/* Sound wave when speaking */}
        {speaking===h.id && (
          <div style={{ display:"flex", gap:3, alignItems:"flex-end", marginBottom:12, height:20 }}>
            {Array.from({length:12}).map((_,b) => (
              <div key={b} style={{ width:3, borderRadius:2, background:book?.color??C.gold, animation:`dotBlink ${.2+b*.06}s ease-in-out infinite`, height:4+((b*5)%12) }} />
            ))}
            <span style={{ fontSize:11, color:C.textDim, marginLeft:6, alignSelf:"center" }}>পাঠ করা হচ্ছে…</span>
          </div>
        )}
        {/* Narrator */}
        <div style={{ fontSize:12, color:C.textDim, marginBottom:8, fontStyle:"italic" }}>
          Narrated by <span style={{ color:book?.color ?? C.gold, fontWeight:600, fontStyle:"normal" }}>{h.english.narrator}</span>:
        </div>
        {/* English text */}
        <div style={{ fontSize:14, lineHeight:1.9, color:C.textMid }}>
          {h.english.text}
        </div>
      </div>
    );
  };

  // ── Hadith List ───────────────────────────────────────────────────────────────
  const HadithList = () => (
    <div style={{ flex:1, display:"flex", flexDirection:"column", gap:12 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
        <button onClick={goBack} style={{ background:C.surface2, border:`1px solid ${C.border}`, borderRadius:8, padding:"6px 12px", color:C.textMid, fontSize:12, cursor:"pointer" }}>← পিছনে</button>
        <div>
          <div style={{ fontSize:15, fontWeight:700, color:C.text }}>{selectedChapter?.english}</div>
          <div style={{ fontSize:11, color:C.textDim }}>{selectedBook?.name} · {selectedChapter?.arabic}</div>
        </div>
      </div>
      {loading ? (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ background:C.surface, borderRadius:14, padding:20, height:140, animation:"pulse 1.5s ease-in-out infinite", opacity:0.5 }} />
          ))}
        </div>
      ) : hadiths.length === 0 ? (
        <div style={{ textAlign:"center", padding:48, color:C.textDim }}>
          <div style={{ fontSize:36, marginBottom:12 }}>📚</div>
          <div style={{ fontSize:14 }}>এই অধ্যায়ে এখনো হাদিস লোড হয়নি।</div>
          <div style={{ fontSize:12, marginTop:6 }}>ডেমো ডেটার জন্য বুখারী বা মুসলিম অধ্যায় ১-৩ চেষ্টা করুন।</div>
        </div>
      ) : (
        hadiths.map((h, i) => <HadithCard key={h.id} h={h} idx={i} />)
      )}
    </div>
  );

  // ── Search Results ────────────────────────────────────────────────────────────
  const SearchResultsView = () => (
    <div style={{ flex:1, display:"flex", flexDirection:"column", gap:12 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
        <button onClick={goBack} style={{ background:C.surface2, border:`1px solid ${C.border}`, borderRadius:8, padding:"6px 12px", color:C.textMid, fontSize:12, cursor:"pointer" }}>← পিছনে</button>
        <div style={{ fontSize:14, color:C.textDim }}>
          <span style={{ color:C.text, fontWeight:600 }}>{searchResults.length}</span> ফলাফল পাওয়া গেছে "<span style={{ color:C.gold }}>{searchQ}</span>"
        </div>
      </div>
      {searchResults.length === 0 ? (
        <div style={{ textAlign:"center", padding:48, color:C.textDim }}>
          <div style={{ fontSize:36, marginBottom:12 }}>🔍</div>
          <div style={{ fontSize:14 }}>কোনো ফলাফল পাওয়া যায়নি। ভিন্ন কীওয়ার্ড চেষ্টা করুন।</div>
        </div>
      ) : (
        searchResults.map((h, i) => <HadithCard key={h.id} h={h} idx={i} />)
      )}
    </div>
  );

  // ── Books Grid ─────────────────────────────────────────────────────────────────
  const BooksGrid = () => (
    <div style={{ flex:1 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:12 }}>
        {HADITH_BOOKS.map((book, i) => (
          <button key={book.id} onClick={() => openBook(book)}
            style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:20, cursor:"pointer", textAlign:"left", transition:"all .2s", animation:`fadeUp .4s ${i*.05}s both` }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = book.color; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = C.border; }}>
            <div style={{ width:40, height:40, borderRadius:10, background:`${book.color}22`, border:`1px solid ${book.color}44`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:12, fontSize:18 }}>📗</div>
            <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:4, lineHeight:1.3 }}>{book.name}</div>
            <div style={{ fontSize:13, color:C.textDim, fontFamily:"Georgia,serif", marginBottom:8, direction:"rtl", textAlign:"right" }}>{book.arabic}</div>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:C.textDim }}>
              <span>{book.hadiths.toLocaleString()} হাদিস</span>
              <span style={{ color:book.color, fontWeight:600 }}>পড়ুন →</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const ContentPane = () => {
    if (view === "books")    return <BooksGrid />;
    if (view === "chapters") return <ChapterList />;
    if (view === "hadiths")  return <HadithList />;
    if (view === "search")   return <SearchResultsView />;
    return null;
  };

  return (
    <PW>
      <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
        {/* iHadis green section header */}
        <div style={{ background:"#1a6b3a", padding:"12px 18px", borderRadius:"8px 8px 0 0", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
          <div>
            <div style={{ fontSize:17, fontWeight:700, color:"#fff", fontFamily:"'Noto Serif',Georgia,serif" }}>হাদিস সংকলন / Hadith Collection</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,.75)", marginTop:2 }}>৬টি বিশুদ্ধ গ্রন্থ (6 Authentic Books) · ৩০,০০০+ হাদিস · সুন্নাহ of Prophet ﷺ</div>
          </div>
          {bookmarked.length > 0 && (
            <div style={{ background:"rgba(255,255,255,.2)", border:"1px solid rgba(255,255,255,.3)", borderRadius:20, padding:"4px 12px", fontSize:12, color:"#fff" }}>🔖 {bookmarked.length} সংরক্ষিত</div>
          )}
        </div>
        {/* Inner two-pane layout */}
        <div className="fu1 hadith-layout" style={{ display:"flex", gap:0, alignItems:"flex-start", border:`1px solid ${C.border}`, borderTop:"none", borderRadius:"0 0 8px 8px", overflow:"hidden" }}>
          <div className="hadith-sidebar" style={{ borderRight:`1px solid ${C.border}` }}>
            <Sidebar />
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <ContentPane />
          </div>
        </div>
      </div>

      <style>{`
        .hadith-layout { flex-direction: row; }
        .hadith-sidebar { display: block; min-width: 200px; max-width: 220px; background: var(--surface, #fff); }
        @media(max-width:768px) {
          .hadith-layout { flex-direction: column; }
          .hadith-sidebar { width: 100% !important; max-width: 100% !important; }
        }
      `}</style>
    </PW>
  );
}

// ─── Tasbih Page ──────────────────────────────────────────────────────────────
function TasbihPage({ C }: { C:C }) {
  const [count, setCount]       = useState(0);
  const [sel,   setSel]         = useState(0);
  const [total, setTotal]       = useState(0);
  const [sessions, setSessions] = useState<{name:string;count:number}[]>([]);
  const target = 33; const pct = Math.min((count/target)*100,100);
  const tap = () => {
    if (count < target) { setCount(c => c+1); setTotal(t => t+1); }
    else { setSessions(s => [...s, {name:TASBIH_OPTIONS[sel],count:target}]); setCount(0); }
  };
  return (
    <PW>
      <div style={{ display:"flex", flexDirection:"column", gap:0, maxWidth:560 }}>
        {/* iHadis green section header */}
        <div style={{ background:"#1a6b3a", padding:"11px 16px", borderRadius:"8px 8px 0 0" }}>
          <div style={{ fontSize:17, fontWeight:700, color:"#fff", fontFamily:"'Noto Serif',Georgia,serif" }}>📿 তাসবিহ কাউন্টার</div>
          <div style={{ fontSize:12, color:"rgba(255,255,255,.75)", marginTop:2 }}>ডিজিটাল যিকির কাউন্টার</div>
        </div>
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderTop:"none", borderRadius:"0 0 8px 8px", padding:"16px 16px 20px" }}>
        <div className="fu1" style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {TASBIH_OPTIONS.map((t,i) => <button key={i} onClick={() => { setSel(i); setCount(0); }} style={{ padding:"7px 14px", borderRadius:20, background: sel===i?"linear-gradient(135deg,#0d4a2e,#1a6b3a)":C.surface, border:`1px solid ${sel===i?C.teal:C.border}`, color: sel===i?"#fff":C.textMid, fontSize:13, cursor:"pointer", fontWeight: sel===i?600:400 }}>{t}</button>)}
        </div>
        <div className="fu2" style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:20, padding:40, display:"flex", flexDirection:"column", alignItems:"center", gap:12, position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(circle at 50% 20%,rgba(201,168,76,.05),transparent 65%)", pointerEvents:"none" }} />
          <div style={{ fontSize:13, color:C.textDim, letterSpacing:"0.15em", textTransform:"uppercase" }}>{TASBIH_OPTIONS[sel]}</div>
          <div className="pulse-a" style={{ fontSize:96, fontWeight:900, color:C.text, lineHeight:1, fontVariantNumeric:"tabular-nums" }}>{count}</div>
          <div style={{ fontSize:13, color:C.textDim }}>এর মধ্যে {target}</div>
          <div style={{ width:"100%", height:8, background:C.surface2, borderRadius:4, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,${C.teal},${C.gold})`, borderRadius:4, transition:"width .25s ease" }} />
          </div>
          {count===target && <div style={{ fontSize:14, color:"#4ADE80", fontWeight:700 }}>✓ সম্পন্ন! চালিয়ে যেতে চাপুন</div>}
          <button onClick={tap} className="glow-a" style={{ background:"linear-gradient(135deg,#1a6b3a,#0d4a2e)", border:`1px solid ${C.teal}`, color:"#fff", borderRadius:14, padding:"17px 0", width:"100%", cursor:"pointer", fontSize:18, fontWeight:800, letterSpacing:"0.06em", marginTop:8 }}>📿 চাপুন</button>
          <button onClick={() => setCount(0)} style={{ background:"none", border:"none", color:C.textDim, fontSize:11, letterSpacing:"0.15em", cursor:"pointer" }}>কাউন্টার রিসেট করুন</button>
          <div style={{ display:"flex", gap:36, textAlign:"center" }}>
            {[[total,"আজকের মোট"],[sessions.length,"রাউন্ড"]].map(([v,l]) => <div key={String(l)}><div style={{ fontSize:22, fontWeight:800, color:C.gold }}>{v}</div><div style={{ fontSize:11, color:C.textDim }}>{l}</div></div>)}
          </div>
        </div>
        {sessions.length>0 && <div className="fu3" style={{ marginTop:12, borderTop:`1px solid ${C.border}`, paddingTop:12 }}><div style={{ fontSize:11, color:C.textDim, letterSpacing:"0.12em", marginBottom:10, fontWeight:700 }}>সেশন ইতিহাস</div>{sessions.slice(-5).reverse().map((s,i) => <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:`1px solid ${C.border}`, fontSize:13 }}><span style={{ color:C.textMid }}>{s.name}</span><span style={{ color:"#1a6b3a", fontWeight:600 }}>{s.count}×</span></div>)}</div>}
        </div>
      </div>
    </PW>
  );
}

// ─── Mosque Page ──────────────────────────────────────────────────────────────
function MosquePage({ C }: { C:C }) {
  const [sel, setSel] = useState<number|null>(null);
  return (
    <PW>
      <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
        {/* iHadis green section header */}
        <div style={{ background:"#1a6b3a", padding:"11px 16px", borderRadius:"8px 8px 0 0", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ fontSize:17, fontWeight:700, color:"#fff", fontFamily:"'Noto Serif',Georgia,serif" }}>🕌 কাছের মসজিদসমূহ</div>
          <div style={{ fontSize:12, color:"rgba(255,255,255,.75)" }}>📍 ঢাকা, বাংলাদেশ</div>
        </div>
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderTop:"none", borderRadius:"0 0 8px 8px", overflow:"hidden", padding:16, display:"flex", flexDirection:"column", gap:10 }}>
        <div className="fu1" style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, height:175, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg,#0d4a2e,#1a6b3a)", opacity:0.85 }} />
          <div className="float-a" style={{ fontSize:48, position:"relative", zIndex:1 }}>🗺️</div>
          <p style={{ color:C.textMid, marginTop:8, position:"relative", zIndex:1, fontSize:13 }}>ঢাকা · ৫টি কাছের মসজিদ</p>
        </div>
        {MOSQUES_DHAKA.map((m,i) => (
          <div key={i} onClick={() => setSel(sel===i?null:i)} style={{ background:C.surface, border:`1px solid ${sel===i?C.gold:C.border}`, borderRadius:14, padding:"15px 18px", cursor:"pointer", transition:"all .2s", animation:`fadeUp .4s ${i*.06}s both cubic-bezier(.22,1,.36,1)` }}>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:44, height:44, background:C.surface2, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{m.img}</div>
              <div style={{ flex:1 }}><div style={{ fontSize:14, fontWeight:600, color:C.text, marginBottom:2 }}>{m.name}</div><div style={{ fontSize:12, color:C.textDim }}>{m.address}</div></div>
              <div style={{ textAlign:"right", flexShrink:0 }}><div style={{ fontSize:13, color:C.gold, fontWeight:600, marginBottom:2 }}>⭐ {m.rating}</div><div style={{ fontSize:11, color:C.textDim }}>{m.dist}</div></div>
            </div>
            {sel===i && <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${C.border}`, display:"flex", gap:10 }}>
              <div style={{ flex:1, background:C.surface2, borderRadius:10, padding:"10px 14px" }}><div style={{ color:C.textDim, fontSize:11, marginBottom:2 }}>পরবর্তী নামাজ</div><div style={{ color:C.text, fontWeight:600 }}>{m.prayer}</div></div>
              <button style={{ background:`linear-gradient(135deg,#1a6b3a,#0d4a2e)`, border:"none", borderRadius:10, padding:"10px 16px", color:"#fff", fontSize:13, cursor:"pointer", fontWeight:600 }}>দিকনির্দেশনা →</button>
            </div>}
          </div>
        ))}
        </div>
      </div>
    </PW>
  );
}

// ─── News Page ────────────────────────────────────────────────────────────────
function NewsPage({ C }: { C:C }) {
  const [cat, setCat] = useState("সকল");
  const [open, setOpen] = useState<number|null>(null);
  const cats = ["সকল","বিশ্ব","সম্প্রদায়","সংস্কৃতি","অর্থনীতি"];
  const list = cat==="সকল" ? NEWS : NEWS.filter(n => n.cat===cat.toUpperCase());
  return (
    <PW>
      <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
        {/* iHadis green section header */}
        <div style={{ background:"#1a6b3a", padding:"11px 16px", borderRadius:"8px 8px 0 0", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8, marginBottom:0 }}>
          <div style={{ fontSize:17, fontWeight:700, color:"#fff", fontFamily:"'Noto Serif',Georgia,serif" }}>📰 ইসলামিক সংবাদ</div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>{cats.map(c => <button key={c} onClick={() => setCat(c)} style={{ padding:"4px 12px", borderRadius:20, background: cat===c?"rgba(255,255,255,.25)":"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.3)", color:"#fff", fontSize:12, cursor:"pointer", fontWeight: cat===c?700:400, fontFamily:"inherit" }}>{c}</button>)}</div>
        </div>
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderTop:"none", borderRadius:"0 0 8px 8px", overflow:"hidden" }}>
        {list.map((n,i) => (
          <div key={i} onClick={() => setOpen(open===i?null:i)} style={{ padding:"13px 16px", borderBottom: i<list.length-1?`1px solid ${C.border}`:"none", cursor:"pointer", transition:"background .15s", animation:`fadeUp .35s ${i*.04}s both` }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background="rgba(26,107,58,.03)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background="transparent"}>
            <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
              <div style={{ width:44, height:44, background:C.surface2, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0, border:`1px solid ${C.border}` }}>{n.img}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:11, color:C.textDim, marginBottom:3 }}><span style={{ background:"#e8f5ee", color:"#1a6b3a", border:"1px solid #c8e6d4", borderRadius:3, padding:"1px 6px", fontSize:10, fontWeight:600, marginRight:6 }}>{n.cat}</span>{n.ago}</div>
                <div style={{ fontSize:14, lineHeight:1.55, fontWeight:500, color:C.text }}>{n.title}</div>
              </div>
              <span style={{ color:C.textDim, fontSize:16, flexShrink:0, marginTop:2 }}>{open===i?"▾":"›"}</span>
            </div>
            {open===i && <div style={{ marginTop:10, fontSize:13, color:C.textMid, lineHeight:1.7, paddingTop:10, borderTop:`1px solid ${C.border}`, paddingLeft:56 }}>সম্পূর্ণ নিবন্ধের পূর্বদর্শন। প্রোডাকশন অ্যাপে এটি নিউজ API থেকে লোড হবে।<button style={{ display:"inline-block", marginLeft:12, background:"#1a6b3a", border:"none", borderRadius:5, padding:"5px 14px", color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>পড়ুন →</button></div>}
          </div>
        ))}
        </div>
      </div>
    </PW>
  );
}

// ─── Prayer Times Page (iHadis-style) ─────────────────────────────────────────
interface PTiming { Fajr:string; Sunrise:string; Dhuhr:string; Asr:string; Maghrib:string; Isha:string; Imsak:string; Midnight:string; }
interface PDay   { date:{ readable:string; gregorian:{day:string;month:{number:number;en:string};year:string;weekday:{en:string}}; hijri:{day:string;month:{number:number;en:string;ar:string};year:string} }; timings:PTiming; }

const DHAKA_LAT  = 23.7639;
const DHAKA_LNG  = 90.3889;
const CALC_METHOD = 1; // ইউনিভার্সিটি অব ইসলামিক সায়েন্সেস, করাচি (Bangladesh standard)

const PRAYER_META: Record<string,(typeof themes.dark)["gold"]|string> = {};
const PT_INFO: {key:keyof PTiming; label:string; arabic:string; icon:string; color:string; desc:string}[] = [
  { key:"Imsak",   label:"ইমসাক",   arabic:"إمساك",  icon:"🌑", color:"#5A6480", desc:"রোজা শুরু"    },
  { key:"Fajr",    label:"ফজর",    arabic:"الفجر",  icon:"🌙", color:"#7A8DC9", desc:"ফজরের নামাজ"          },
  { key:"Sunrise", label:"সূর্যোদয়", arabic:"الشروق", icon:"🌅", color:"#C9A84C", desc:"সূর্য ওঠে"            },
  { key:"Dhuhr",   label:"যোহর",   arabic:"الظهر",  icon:"☀️", color:"#C9884C", desc:"যোহরের নামাজ"        },
  { key:"Asr",     label:"আসর",     arabic:"العصر",  icon:"🌤", color:"#4AC97A", desc:"আসরের নামাজ"     },
  { key:"Maghrib", label:"মাগরিব", arabic:"المغرب", icon:"🌇", color:"#C94A6A", desc:"সূর্যাস্ত / ইফতার"       },
  { key:"Isha",    label:"এশা",    arabic:"العشاء", icon:"✨", color:"#9A4AC9", desc:"এশার নামাজ"         },
];

function fmt12(t: string): { h: string; m: string; ampm: string } {
  const [hh, mm] = t.replace(" (BST)","").replace(" (UTC+6)","").split(":");
  const h = parseInt(hh,10), m = mm.substring(0,2);
  const ampm = h < 12 ? "AM" : "PM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return { h: String(h12).padStart(2,"0"), m, ampm };
}

function toMinutes(t: string): number {
  const [hh, mm] = t.replace(" (BST)","").replace(" (UTC+6)","").split(":");
  return parseInt(hh,10)*60 + parseInt(mm.substring(0,2),10);
}

function PrayerTimesPage({ C }: { C: C }) {
  const [tab,        setTab]       = useState<"today"|"weekly"|"monthly">("today");
  const [todayData,  setTodayData] = useState<PDay|null>(null);
  const [weekData,   setWeekData]  = useState<PDay[]>([]);
  const [monthData,  setMonthData] = useState<PDay[]>([]);
  const [loading,    setLoading]   = useState(true);
  const [error,      setError]     = useState("");
  const [calcMethod, setCalcMethod]= useState<number>(CALC_METHOD);
  const [school,     setSchool]    = useState<0|1>(0);

  // Clock: use ref for display (no re-render), state for next-prayer recalc (once/min)
  const nowDisplayRef = useRef(new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",second:"2-digit"}));
  const [nowMins, setNowMins] = useState(() => { const n = new Date(); return n.getHours()*60+n.getMinutes(); });
  const clockElRef = useRef<HTMLSpanElement|null>(null);
  useEffect(() => {
    const t = setInterval(() => {
      const now = new Date();
      const str = now.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
      nowDisplayRef.current = str;
      // Update DOM directly — avoids React re-render entirely
      if (clockElRef.current) clockElRef.current.textContent = str;
      // Update mins only when minute changes (for next-prayer highlight)
      const m = now.getHours()*60+now.getMinutes();
      if (m !== nowMins) setNowMins(m);
    }, 1000);
    return () => clearInterval(t);
  }, [nowMins]);

  // Fetch data — only re-runs when calcMethod or school change
  useEffect(() => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2,"0");
    const mm = String(today.getMonth()+1).padStart(2,"0");
    const yyyy = today.getFullYear();
    setLoading(true); setError("");
    const todayURL = `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${DHAKA_LAT}&longitude=${DHAKA_LNG}&method=${calcMethod}&school=${school}`;
    const monthURL = `https://api.aladhan.com/v1/calendar/${yyyy}/${mm}?latitude=${DHAKA_LAT}&longitude=${DHAKA_LNG}&method=${calcMethod}&school=${school}`;
    Promise.all([
      fetch(todayURL).then(r => r.json()),
      fetch(monthURL).then(r => r.json()),
    ]).then(([td, md]) => {
      if (td.code === 200) setTodayData({ date: td.data.date, timings: td.data.timings });
      if (md.code === 200) {
        const allDays: PDay[] = md.data.map((d: {date:PDay["date"];timings:PTiming}) => ({ date:d.date, timings:d.timings }));
        setMonthData(allDays);
        const todayNum = today.getDate();
        const idx = allDays.findIndex(d => parseInt(d.date.gregorian.day,10) === todayNum);
        setWeekData(allDays.slice(Math.max(0,idx), Math.min(allDays.length, idx+7)));
      }
      setLoading(false);
    }).catch(() => { setError("নামাজের সময় লোড করা যায়নি।"); setLoading(false); });
  }, [calcMethod, school]);

  // Pure derivations — no components, no hooks
  const getNowMins = () => nowMins;
  const getNextPrayer = (timings: PTiming) => {
    const now = getNowMins();
    for (const p of ["Fajr","Dhuhr","Asr","Maghrib","Isha"] as (keyof PTiming)[])
      if (toMinutes(timings[p]) > now) return p;
    return "Fajr";
  };
  const getCountdown = (timings: PTiming, prayer: keyof PTiming) => {
    let diff = toMinutes(timings[prayer]) - getNowMins();
    if (diff < 0) diff += 1440;
    return `${Math.floor(diff/60)}h ${String(diff%60).padStart(2,"0")}m`;
  };

  const nextPrayer = todayData ? getNextPrayer(todayData.timings) : null;
  const fasting_duration = todayData ? (() => {
    const diff = toMinutes(todayData.timings.Maghrib) - toMinutes(todayData.timings.Imsak);
    return `${Math.floor(diff/60)}h ${diff%60}m`;
  })() : "--";
  const todayNum = new Date().getDate();

  const TABS = [
    { id:"today" as const,   label:"আজ / Today",       icon:"🕐" },
    { id:"weekly" as const,  label:"সাপ্তাহিক / Week", icon:"📅" },
    { id:"monthly" as const, label:"মাসিক / Month",    icon:"🗓️" },
  ];

  // Skeleton (plain JSX variable, not a component)
  const skeleton = (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {[1,2,3,4,5].map(i => <div key={i} style={{ height:68, background:C.surface2, borderRadius:10, opacity:0.6 }} />)}
    </div>
  );

  // ── TODAY JSX ──
  const todayJSX = loading ? skeleton : error ? (
    <div style={{ textAlign:"center", padding:40, color:C.textDim }}>
      <div style={{ fontSize:32, marginBottom:8 }}>⚠️</div>{error}
    </div>
  ) : !todayData ? null : (() => {
    const t = todayData.timings;
    const hDate = todayData.date.hijri;
    const gDate = todayData.date.gregorian;
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        {/* Hero card */}
        <div style={{ background: C.text==="#e8f5ee" ? "linear-gradient(135deg,#1A2830,#0F1820)" : "linear-gradient(135deg,#0d4a2e,#1a6b3a)", border:`1px solid ${C.border}`, borderRadius:14, padding:22, position:"relative", overflow:"hidden" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12 }}>
            <div>
              <div style={{ fontSize:11, letterSpacing:"0.12em", color:"rgba(255,255,255,.6)", marginBottom:5 }}>আজ · Today — ঢাকা, Bangladesh</div>
              <div style={{ fontSize:20, fontWeight:800, color:"#fff", marginBottom:3 }}>{gDate.weekday.en}, {gDate.day} {gDate.month.en} {gDate.year}</div>
              <div style={{ fontSize:14, color:"#a3e4b8", fontFamily:"Georgia,serif" }}>{hDate.day} {hDate.month.ar} {hDate.year} AH</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <span ref={clockElRef} style={{ fontSize:30, fontWeight:900, color:"#fff", fontVariantNumeric:"tabular-nums", letterSpacing:"-0.02em", display:"block" }}>{nowDisplayRef.current}</span>
              <div style={{ fontSize:11, color:"rgba(255,255,255,.6)", marginTop:3 }}>Asia/Dhaka (UTC+6)</div>
              {nextPrayer && (
                <div style={{ marginTop:8, background:"rgba(255,255,255,.15)", border:"1px solid rgba(255,255,255,.25)", borderRadius:20, padding:"4px 12px", fontSize:12, color:"#fff" }}>
                  পরবর্তী / Next: <b>{nextPrayer}</b> — {getCountdown(t, nextPrayer as keyof PTiming)}
                </div>
              )}
            </div>
          </div>
          <div style={{ marginTop:16, display:"flex", gap:14, flexWrap:"wrap" }}>
            <div style={{ background:"rgba(255,255,255,.1)", borderRadius:8, padding:"8px 14px", flex:1, minWidth:110 }}>
              <div style={{ fontSize:10, color:"rgba(255,255,255,.6)", marginBottom:3 }}>সেহরি শেষ / Suhoor End</div>
              <div style={{ fontSize:16, fontWeight:800, color:"#fff" }}>{fmt12(t.Imsak).h}:{fmt12(t.Imsak).m} <span style={{ fontSize:11 }}>{fmt12(t.Imsak).ampm}</span></div>
            </div>
            <div style={{ background:"rgba(255,255,255,.1)", borderRadius:8, padding:"8px 14px", flex:1, minWidth:110 }}>
              <div style={{ fontSize:10, color:"rgba(255,255,255,.6)", marginBottom:3 }}>ইফতার / Iftar (Maghrib)</div>
              <div style={{ fontSize:16, fontWeight:800, color:"#fff" }}>{fmt12(t.Maghrib).h}:{fmt12(t.Maghrib).m} <span style={{ fontSize:11 }}>{fmt12(t.Maghrib).ampm}</span></div>
            </div>
            <div style={{ background:"rgba(255,255,255,.1)", borderRadius:8, padding:"8px 14px", flex:1, minWidth:110 }}>
              <div style={{ fontSize:10, color:"rgba(255,255,255,.6)", marginBottom:3 }}>রোজার সময় / Fast Duration</div>
              <div style={{ fontSize:16, fontWeight:800, color:"#fff" }}>{fasting_duration}</div>
            </div>
          </div>
        </div>

        {/* Prayer rows */}
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, overflow:"hidden" }}>
          {PT_INFO.map((p, i) => {
            const f = fmt12(t[p.key]);
            const isNext = nextPrayer === p.key;
            return (
              <div key={p.key} style={{ display:"flex", alignItems:"center", gap:14, padding:"13px 18px", borderBottom: i<PT_INFO.length-1?`1px solid ${C.border}`:"none", background: isNext?"rgba(26,107,58,.07)":"transparent", borderLeft: isNext?"3px solid #1a6b3a":"3px solid transparent", transition:"background .15s" }}>
                <div style={{ width:38, height:38, borderRadius:9, background:`${p.color}18`, border:`1px solid ${p.color}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, flexShrink:0 }}>{p.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                    <span style={{ fontSize:15, fontWeight:700, color: isNext?"#1a6b3a":C.text }}>{p.label}</span>
                    <span style={{ fontSize:12, color:C.textDim, fontFamily:"Georgia,serif" }}>{p.arabic}</span>
                    <span style={{ fontSize:11, color:C.textDim }}>/ {p.desc}</span>
                    {isNext && <span style={{ fontSize:10, background:"#1a6b3a", color:"#fff", borderRadius:10, padding:"1px 8px", fontWeight:700 }}>NEXT ▶</span>}
                  </div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontSize:22, fontWeight:800, color: isNext?"#1a6b3a":C.text, fontVariantNumeric:"tabular-nums" }}>{f.h}:{f.m}</div>
                  <div style={{ fontSize:10, color:C.textDim }}>{f.ampm}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Method switcher */}
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:10, padding:16 }}>
          <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:10 }}>⚙️ হিসাব পদ্ধতি / Calculation Method</div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:10 }}>
            {([[1,"করাচি"],[3,"MWL"],[2,"ISNA"],[5,"মিশর"],[4,"মক্কা"]] as [number,string][]).map(([id,name]) => (
              <button key={id} onClick={() => setCalcMethod(id)} style={{ padding:"5px 12px", borderRadius:6, background:calcMethod===id?"#1a6b3a":C.surface2, border:`1px solid ${calcMethod===id?"#1a6b3a":C.border}`, color:calcMethod===id?"#fff":C.textMid, fontSize:12, cursor:"pointer", fontWeight:calcMethod===id?700:400, fontFamily:"inherit" }}>{name}</button>
            ))}
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <span style={{ fontSize:12, color:C.textDim }}>মাযহাব / School:</span>
            {([[0,"শাফেয়ী / Shafi"],[1,"হানাফি / Hanafi"]] as [number,string][]).map(([v,n]) => (
              <button key={v} onClick={() => setSchool(v as 0|1)} style={{ padding:"4px 12px", borderRadius:6, background:school===v?"#1a6b3a":C.surface2, border:`1px solid ${school===v?"#1a6b3a":C.border}`, color:school===v?"#fff":C.textMid, fontSize:12, cursor:"pointer", fontWeight:school===v?700:400, fontFamily:"inherit" }}>{n}</button>
            ))}
          </div>
        </div>
      </div>
    );
  })();

  // ── WEEKLY JSX ──
  const weeklyJSX = loading ? skeleton : !weekData.length ? (
    <div style={{ textAlign:"center", padding:40, color:C.textDim }}>কোনো ডেটা নেই / No data</div>
  ) : (
    <div style={{ overflowX:"auto", WebkitOverflowScrolling:"touch" as React.CSSProperties["WebkitOverflowScrolling"] }}>
      <table style={{ width:"100%", borderCollapse:"collapse", minWidth:560 }}>
        <thead>
          <tr style={{ background:C.surface2, borderBottom:`2px solid ${C.border}` }}>
            <th style={{ textAlign:"left", padding:"9px 14px", fontSize:11, color:C.textDim, fontWeight:700 }}>তারিখ / Date</th>
            {(["ফজর/Fajr","সূর্যোদয়/Sunrise","যোহর/Dhuhr","আসর/Asr","মাগরিব/Maghrib","এশা/Isha"] as string[]).map(p => (
              <th key={p} style={{ padding:"9px 8px", fontSize:10, color:C.textDim, fontWeight:700, textAlign:"center", whiteSpace:"nowrap" }}>{p}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weekData.map((d) => {
            const isToday = parseInt(d.date.gregorian.day,10) === todayNum;
            return (
              <tr key={d.date.readable} style={{ background: isToday?"rgba(26,107,58,.07)":"transparent", borderBottom:`1px solid ${C.border}` }}>
                <td style={{ padding:"11px 14px" }}>
                  <div style={{ fontSize:13, fontWeight:isToday?700:500, color:isToday?"#1a6b3a":C.text }}>{d.date.gregorian.weekday.en.substring(0,3)}</div>
                  <div style={{ fontSize:11, color:C.textDim }}>{d.date.gregorian.day} {d.date.gregorian.month.en.substring(0,3)}</div>
                  {isToday && <div style={{ fontSize:9, color:"#1a6b3a", fontWeight:700 }}>আজ / Today</div>}
                </td>
                {(["Fajr","Sunrise","Dhuhr","Asr","Maghrib","Isha"] as (keyof PTiming)[]).map(p => {
                  const f = fmt12(d.timings[p]);
                  return (
                    <td key={p} style={{ padding:"11px 8px", textAlign:"center" }}>
                      <div style={{ fontSize:13, fontWeight:600, color:isToday?"#1a6b3a":C.textMid }}>{f.h}:{f.m}</div>
                      <div style={{ fontSize:9, color:C.textDim }}>{f.ampm}</div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  // ── MONTHLY JSX ──
  const monthlyJSX = loading ? skeleton : !monthData.length ? (
    <div style={{ textAlign:"center", padding:40, color:C.textDim }}>কোনো ডেটা নেই / No data</div>
  ) : (() => {
    const month = monthData[0]?.date.gregorian.month.en ?? "";
    const year  = monthData[0]?.date.gregorian.year ?? "";
    return (
      <div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
          <div style={{ fontSize:17, fontWeight:700, color:C.text }}>{month} {year}</div>
          <div style={{ fontSize:12, color:C.textDim }}>{monthData.length} days</div>
        </div>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", minWidth:600 }}>
            <thead>
              <tr style={{ background:C.surface2, borderBottom:`2px solid ${C.border}` }}>
                {["দিন","তারিখ","ফজর","সূর্যোদয়","যোহর","আসর","মাগরিব","এশা"].map(h => (
                  <th key={h} style={{ padding:"8px 6px", fontSize:10, color:C.textDim, fontWeight:700, textAlign:"center", whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthData.map((d) => {
                const dn = parseInt(d.date.gregorian.day,10);
                const isToday = dn === todayNum;
                return (
                  <tr key={d.date.readable} style={{ background:isToday?"rgba(26,107,58,.07)":"transparent", borderBottom:`1px solid ${C.border}` }}>
                    <td style={{ padding:"8px 6px", textAlign:"center" }}>
                      <div style={{ fontSize:11, color:isToday?"#1a6b3a":C.textDim }}>{d.date.gregorian.weekday.en.substring(0,3)}</div>
                      {isToday && <div style={{ fontSize:8, color:"#1a6b3a", fontWeight:800 }}>●</div>}
                    </td>
                    <td style={{ padding:"8px 6px", textAlign:"center", whiteSpace:"nowrap" }}>
                      <div style={{ fontSize:12, fontWeight:isToday?700:400, color:isToday?"#1a6b3a":C.text }}>{d.date.gregorian.day}</div>
                      <div style={{ fontSize:9, color:C.textDim }}>{d.date.hijri.day} {d.date.hijri.month.ar}</div>
                    </td>
                    {(["Fajr","Sunrise","Dhuhr","Asr","Maghrib","Isha"] as (keyof PTiming)[]).map(p => {
                      const f = fmt12(d.timings[p]);
                      return (
                        <td key={p} style={{ padding:"8px 6px", textAlign:"center", whiteSpace:"nowrap" }}>
                          <div style={{ fontSize:11, fontWeight:isToday?700:400, color:isToday?"#1a6b3a":C.textMid }}>{f.h}:{f.m}</div>
                          <div style={{ fontSize:9, color:C.textDim }}>{f.ampm}</div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  })();

  return (
    <PW>
      <div style={{ display:"flex", flexDirection:"column", gap:0, maxWidth:980 }}>
        {/* Green section header with tabs */}
        <div style={{ background:"#1a6b3a", padding:"11px 16px", borderRadius:"8px 8px 0 0", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
          <div style={{ fontSize:16, fontWeight:700, color:"#fff", fontFamily:"'Noto Serif',Georgia,serif" }}>🕐 নামাজের সময়সূচী / Prayer Times — ঢাকা</div>
          <div style={{ display:"flex", gap:5 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ padding:"5px 12px", borderRadius:5, background:tab===t.id?"rgba(255,255,255,.25)":"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.3)", color:"#fff", fontSize:12, cursor:"pointer", fontWeight:tab===t.id?700:400, display:"flex", alignItems:"center", gap:5, fontFamily:"inherit", whiteSpace:"nowrap" }}>
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>
        </div>
        {/* Content */}
        <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderTop:"none", borderRadius:"0 0 8px 8px", padding:18 }}>
          {tab==="today"   && todayJSX}
          {tab==="weekly"  && weeklyJSX}
          {tab==="monthly" && monthlyJSX}
        </div>
      </div>
    </PW>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────
function HomePage({ C, audio, goNews, profile }: { C:C; audio:AudioHook; goNews:()=>void; profile:UserProfile }) {
  const [tasbih, setTasbih] = useState(33);
  const [countdown, setCountdown] = useState("01:24:05");
  useEffect(() => {
    const t = setInterval(() => {
      const now = new Date(), tgt = new Date(); tgt.setHours(16,45,0);
      const d = Math.max(0, Math.floor((tgt.getTime()-now.getTime())/1000));
      setCountdown(`${String(Math.floor(d/3600)).padStart(2,"0")}:${String(Math.floor((d%3600)/60)).padStart(2,"0")}:${String(d%60).padStart(2,"0")}`);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <PW>
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        {/* iHadis green section header */}
        <div style={{ background:"#1a6b3a", padding:"11px 16px", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ fontSize:16, fontWeight:700, color:"#fff", fontFamily:"'Noto Serif',Georgia,serif" }}>🏠 হোম — ওয়াক্ত</div>
          <div style={{ fontSize:12, color:"rgba(255,255,255,.75)" }}>{profile.city}</div>
        </div>

        {/* Greeting */}
        <div className="fu" style={{ display:"flex", alignItems:"center", gap:14 }}>
          <Avatar profile={profile} size={50} border={`2px solid ${C.gold}`} />
          <div>
            <div style={{ fontSize:16, fontWeight:700, color:C.text }}>আস্সালামু আলাইকুম, {profile.name.split(" ")[0]} 👋</div>
            <div style={{ fontSize:12, color:C.textDim }}>{profile.city} · আজকের আসর {countdown} পরে</div>
          </div>
        </div>

        {/* Ramadan hero */}
        <div className="fu1 hero-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <div style={{ background:"linear-gradient(135deg,#0d4a2e,#1a6b3a)", borderRadius:16, padding:24, position:"relative", overflow:"hidden", border:"1px solid #2a7a50", minHeight:155 }}>
            <div style={{ position:"absolute", inset:0, background:"radial-gradient(circle at 75% 50%,rgba(46,204,113,.18),transparent 65%)", pointerEvents:"none" }} />
            <div style={{ fontSize:10, letterSpacing:"0.15em", color:"#90EEC0", marginBottom:4 }}>রমজান বিশেষ</div>
            <div style={{ fontSize:19, fontWeight:700, color:C.text, marginBottom:10 }}>সেহরি শেষ</div>
            <div><span className="pulse-a" style={{ fontSize:42, fontWeight:900, color:C.gold, lineHeight:1, display:"inline-block" }}>05:08</span><span style={{ fontSize:14, color:C.textMid, verticalAlign:"super" }}> AM</span></div>
            <div style={{ fontSize:13, color:C.textMid, marginTop:8 }}>বাকি আছে: <b style={{ color:C.text }}>২ঘ ১৪মি</b></div>
            <div style={{ position:"absolute", right:10, bottom:8, fontSize:52, opacity:0.1 }}>🌅</div>
          </div>
          <div style={{ background:"linear-gradient(135deg,#1A2535,#101820)", borderRadius:16, padding:24, position:"relative", overflow:"hidden", border:"1px solid #1E3048", minHeight:155 }}>
            <div style={{ position:"absolute", inset:0, background:"radial-gradient(circle at 25% 50%,rgba(30,60,100,.2),transparent 65%)", pointerEvents:"none" }} />
            <div style={{ fontSize:10, letterSpacing:"0.15em", color:"#6888AA", marginBottom:4 }}>পরবর্তী মাইলস্টোন</div>
            <div style={{ fontSize:19, fontWeight:700, color:C.text, marginBottom:10 }}>ইফতার শুরু</div>
            <div><span style={{ fontSize:42, fontWeight:900, color:"#4A7A9A", lineHeight:1 }}>06:00</span><span style={{ fontSize:14, color:C.textMid, verticalAlign:"super" }}> PM</span></div>
            <div style={{ fontSize:13, color:C.textMid, marginTop:8 }}>অবস্থান: <b style={{ color:C.text }}>{profile.city}</b></div>
            <div style={{ position:"absolute", right:10, bottom:8, fontSize:52, opacity:0.1 }}>🌙</div>
          </div>
        </div>

        {/* Prayer times */}
        <div className="fu2" style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, fontSize:15, fontWeight:600, color:C.text, flexWrap:"wrap", gap:8 }}>
            <span>🕐 নামাজের সময়</span>
            <span style={{ background:C.surface2, border:`1px solid ${C.border}`, borderRadius:20, padding:"5px 14px", fontSize:12, color:C.gold, fontWeight:600 }}>আসর {countdown} পরে</span>
          </div>
          <div className="prayers-r" style={{ display:"flex", gap:8 }}>
            {PRAYERS.map(p => (
              <div key={p.name} className="p-card" style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"13px 6px", borderRadius:12, background: p.active?"linear-gradient(135deg,#2A3D35,#1C2B25)":C.surface2, border: p.active?`1px solid ${C.teal}`:"1px solid transparent", gap:5, position:"relative" }}>
                {p.active && <div style={{ position:"absolute", top:7, right:7, width:7, height:7, background:"#EF4444", borderRadius:"50%", animation:"pulse 1.6s ease-in-out infinite" }} />}
                <div style={{ fontSize:18 }}>{p.icon}</div>
                <div style={{ fontSize:10, letterSpacing:"0.1em", color:C.textDim }}>{p.name.toUpperCase()}</div>
                <div style={{ fontSize:14, fontWeight:700, color:C.text }}>{p.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 2-column */}
        <div className="fu3 home-2c" style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:20 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:24, position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:0, right:0, width:120, height:120, background:"radial-gradient(circle,rgba(201,168,76,.05),transparent 70%)", pointerEvents:"none" }} />
              <div style={{ fontSize:10, letterSpacing:"0.18em", color:C.textDim, marginBottom:14 }}>দৈনিক আয়াত</div>
              <div style={{ fontSize:24, textAlign:"right", lineHeight:1.9, marginBottom:16, color:C.text, fontFamily:"Georgia,serif", direction:"rtl" }}>إِنَّ مَعَ الْعُسْرِ يُسْرًا</div>
              <div style={{ fontSize:14, color:C.textMid, fontStyle:"italic", marginBottom:8, lineHeight:1.7 }}>"নিশ্চয়ই কষ্টের সাথেই রয়েছে স্বস্তি।"</div>
              <div style={{ fontSize:12, color:C.textDim, marginBottom:16 }}>সূরা আশ-শারহ · আয়াত ৬</div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={() => smoothSpeak("নিশ্চয়ই কষ্টের সাথেই রয়েছে স্বস্তি। সূরা আশ-শারহ, আয়াত ৬।")} style={{ background:C.surface2, border:`1px solid ${C.border}`, borderRadius:8, padding:"7px 16px", fontSize:12, color:C.textMid, cursor:"pointer" }}>🔊 শুনুন</button>
                <button style={{ background:C.surface2, border:`1px solid ${C.border}`, borderRadius:8, padding:"7px 16px", fontSize:12, color:C.textMid, cursor:"pointer" }}>↗ শেয়ার</button>
              </div>
            </div>
            <div className="mini-2c" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:18 }}>
                <div style={{ fontSize:10, letterSpacing:"0.18em", color:C.textDim, marginBottom:10 }}>দৈনিক হাদিস</div>
                <div style={{ fontSize:13, color:C.textMid, fontStyle:"italic", lineHeight:1.7, marginBottom:10 }}>"{HADITHS[0].text}"</div>
                <div style={{ fontSize:11, color:C.textDim }}>{HADITHS[0].ref}</div>
              </div>
              <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:18, display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                <div style={{ fontSize:10, letterSpacing:"0.18em", color:C.textDim }}>দ্রুত তাসবিহ</div>
                <div className="pulse-a" style={{ fontSize:46, fontWeight:900, lineHeight:1, color:C.text }}>{tasbih}</div>
                <div style={{ fontSize:10, letterSpacing:"0.15em", color:C.textDim }}>সুবহানআল্লাহ</div>
                <button onClick={() => setTasbih(c => c+1)} style={{ background:"linear-gradient(135deg,#2A5A4A,#1A3A2A)", border:`1px solid ${C.teal}`, color:C.text, borderRadius:10, padding:"10px 0", width:"100%", cursor:"pointer", fontSize:13, fontWeight:700, marginTop:4 }}>📿 চাপুন</button>
                <button onClick={() => setTasbih(0)} style={{ background:"none", border:"none", color:C.textDim, fontSize:10, cursor:"pointer" }}>রিসেট</button>
              </div>
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:18 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14, fontSize:14, fontWeight:600, color:C.text }}><span>📰 ইসলামিক সংবাদ</span><span onClick={goNews} style={{ fontSize:12, color:C.textDim, cursor:"pointer" }}>সব দেখুন</span></div>
              {NEWS.slice(0,3).map((n,i) => (
                <div key={i} style={{ display:"flex", gap:12, paddingBottom:10, borderBottom: i<2?`1px solid ${C.border}`:"none", marginBottom: i<2?10:0 }}>
                  <div style={{ width:44, height:44, background:C.surface2, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{n.img}</div>
                  <div><div style={{ fontSize:12, lineHeight:1.5, color:C.text, marginBottom:3 }}>{n.title}</div><div style={{ fontSize:10, color:C.textDim }}>{n.cat} · {n.ago}</div></div>
                </div>
              ))}
            </div>
            <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:16 }}>
              <div style={{ fontSize:11, color:C.textDim, letterSpacing:"0.12em", marginBottom:12 }}>দ্রুত শুনুন</div>
              {[{n:1,name:"আল-ফাতিহা"},{n:36,name:"ইয়া-সিন"},{n:67,name:"আল-মুলক"}].map(s => (
                <div key={s.n} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:`1px solid ${C.border}` }}>
                  <span style={{ fontSize:13, color:C.text }}>{s.name}</span>
                  <AudioBar n={s.n} audio={audio} C={C} />
                </div>
              ))}
            </div>
            <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:18, display:"flex", gap:12 }}>
              <div style={{ fontSize:26 }}>🧭</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:600, color:C.text, marginBottom:4 }}>কিবলা নির্ণয়</div>
                <div style={{ fontSize:12, color:C.textMid, marginBottom:10 }}>ঢাকা থেকে মক্কা: ~২৯০°</div>
                <button style={{ background:C.surface2, border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 16px", color:C.text, fontSize:13, cursor:"pointer", width:"100%" }}>কম্পাস খুলুন</button>
              </div>
            </div>
          </div>
        </div>

        {/* Articles */}
        <div className="fu4">
          <div style={{ fontSize:17, fontWeight:700, color:C.text, marginBottom:14 }}>প্রস্তাবিত নিবন্ধ</div>
          <div className="art-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            {ARTICLES.map((a,i) => (
              <div key={i} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:16, display:"flex", gap:14, cursor:"pointer" }}>
                <div style={{ width:70, height:62, background:"linear-gradient(135deg,#1a6b3a,#0d4a2e)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:900, color:"#fff", flexShrink:0 }}>{a.num}</div>
                <div><div style={{ fontSize:13, lineHeight:1.6, fontWeight:500, marginBottom:5, color:C.text }}>{a.title}</div><div style={{ fontSize:11, color:C.textDim }}>{a.read} · {a.ago}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PW>
  );
}

// ─── Social Icons ─────────────────────────────────────────────────────────────
const FbIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
const IgIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>;
const DbkIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.953-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308 2.3-1.555 3.936-4.02 4.395-6.87zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.025-8.04 6.4 1.73 1.358 3.92 2.166 6.29 2.166 1.42 0 2.77-.29 4.006-.814zm-9.88-2.58c.232-.4 3.045-5.055 8.332-6.765.135-.045.27-.084.405-.12-.26-.585-.54-1.167-.832-1.74C7.17 11.775 2.206 11.71 1.756 11.7l-.004.312c0 2.633.998 5.037 2.634 6.855zm-2.42-8.955c.46.008 4.683.026 9.477-1.248-1.698-3.018-3.53-5.558-3.8-5.928-2.868 1.35-5.01 3.99-5.676 7.18zM9.6 2.052c.282.38 2.145 2.914 3.822 6 3.645-1.365 5.19-3.44 5.373-3.702-1.81-1.61-4.19-2.586-6.795-2.586-.823 0-1.622.1-2.4.285zm10.335 3.483c-.218.29-1.935 2.493-5.724 4.04.24.49.47.985.68 1.486.08.18.15.36.22.53 3.41-.43 6.8.26 7.14.33-.02-2.42-.88-4.64-2.316-6.386z"/></svg>;

const SOCIALS: {href:string;icon:React.ReactNode;label:string;handle:string}[] = [];


// ─── Mobile Bottom Nav items ──────────────────────────────────────────────────
const MOB_NAV: { id: Page; icon: string; label: string }[] = [
  { id:"Prayer",      icon:"🕌",  label:"হোম"   },
  { id:"Quran",       icon:"📖",  label:"কুরআন"  },
  { id:"PrayerTimes", icon:"🕐",  label:"সময়"  },
  { id:"Tasbih",      icon:"📿",  label:"তাসবিহ" },
  { id:"Hadith",      icon:"📚",  label:"হাদিস" },
];

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const [page,         setPage]         = useState<Page>("Prayer");
  const [search,       setSearch]       = useState("");
  const [dark,         setDark]         = useState(false);
  const [showProfile,  setShowProfile]  = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [toast,        setToast]        = useState("");
  const [profile,      setProfile]      = useState<UserProfile>(DEFAULT_PROFILE);
  const [mobMenu,      setMobMenu]      = useState(false);
  const audio = useAudio();

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2400); };
  const handleSetProfile = (p: UserProfile) => { setProfile(p); showToast("✓ Profile updated!"); };

  const C = dark ? themes.dark : themes.light;
  const ALL_PAGES: Page[] = ["Prayer","Quran","Hadith","Tasbih","Mosque","News","PrayerTimes"];

  const renderCurrentPage = () => {
    switch (page) {
      case "Prayer":      return <HomePage        C={C} audio={audio} goNews={() => setPage("News")} profile={profile} />;
      case "Quran":       return <QuranPage       C={C} audio={audio} />;
      case "Hadith":      return <HadithPage      C={C} />;
      case "Tasbih":      return <TasbihPage      C={C} />;
      case "Mosque":      return <MosquePage      C={C} />;
      case "News":        return <NewsPage        C={C} />;
      case "PrayerTimes": return <PrayerTimesPage C={C} />;
    }
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <style>{`:root { --border: ${C.border}; --surface2: ${C.surface2}; --textDim: ${C.textDim}; }`}</style>

      <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Hind Siliguri','Segoe UI',sans-serif", display:"flex", flexDirection:"column", transition:"background .25s,color .25s" }}>

        {/* ══ TOP UTILITY BAR ══ */}
        <div className="util-bar" style={{ background: dark ? "#0b1a10" : "#0d4a2e", borderBottom:"1px solid rgba(255,255,255,.1)", padding:"0 20px", height:38, justifyContent:"space-between" }}>
          {/* Left: logo mark */}
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:16 }}>🕋</span>
            <span style={{ fontSize:13, color:"rgba(255,255,255,.7)", fontFamily:"'Noto Serif',serif" }}>ওয়াক্ত — ইসলামিক লাইফ কম্প্যানিয়ন</span>
          </div>
          {/* Right: search + profile */}
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div className="searchbar" style={{ alignItems:"center", background:"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.2)", borderRadius:6, padding:"4px 10px", gap:6 }}>
              <span style={{ fontSize:11, opacity:.7, color:"#fff" }}>🔍</span>
              <input style={{ background:"none", border:"none", outline:"none", color:"#fff", fontSize:12, width:140 }} placeholder="হাদিস, কুরআন অনুসন্ধান করুন…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button onClick={() => setDark(d => !d)} style={{ background:"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.2)", borderRadius:6, width:28, height:28, fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff" }}>{dark?"☀️":"🌙"}</button>
            <button onClick={() => setShowProfile(true)} style={{ background:"none", border:"none", cursor:"pointer", padding:0 }}>
              <div style={{ width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg,#2ecc71,#1a6b3a)", border:"2px solid rgba(255,255,255,.35)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, overflow:"hidden" }}>
                {profile.avatar ? <img src={profile.avatar} alt="av" style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : "👤"}
              </div>
            </button>
          </div>
        </div>

        {/* ══ MAIN GREEN NAV ══ */}
        <nav style={{ background: dark ? "#0f1f16" : "#1a6b3a", position:"sticky", top:0, zIndex:200, boxShadow:"0 2px 8px rgba(0,0,0,.2)" }}>
          <div style={{ maxWidth:1320, margin:"0 auto", padding:"0 16px", display:"flex", alignItems:"center", gap:0 }}>
            {/* Logo */}
            <div onClick={() => setPage("Prayer")} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", padding:"0 16px 0 0", borderRight:"1px solid rgba(255,255,255,.2)", height:46, userSelect:"none", flexShrink:0, marginRight:6 }}>
              <span className="float-a" style={{ fontSize:18 }}>🕌</span>
              <span style={{ fontSize:17, fontWeight:800, color:"#fff", fontFamily:"'Noto Serif',Georgia,serif", letterSpacing:"0.04em" }}>Waqt</span>
            </div>

            {/* Desktop nav links */}
            <div className="desk-nav" style={{ alignItems:"center", flex:1, overflow:"hidden" }}>
              {ALL_PAGES.map(item => (
                <button key={item} onClick={() => setPage(item)}
                  className={`nav-link${page===item?" active":""}`}>
                  {item==="Prayer" ? "🏠 হোম" : item==="Quran" ? "📖 কুরআন / Quran" : item==="Hadith" ? "📚 হাদিস / Hadith" : item==="Tasbih" ? "📿 তাসবিহ" : item==="Mosque" ? "🕌 মসজিদ" : item==="News" ? "📰 সংবাদ / News" : "🕐 নামাজ / Prayer Times"}
                </button>
              ))}
            </div>

            {/* Right: settings + hamburger */}
            <div style={{ display:"flex", alignItems:"center", gap:6, marginLeft:"auto" }}>
              <button onClick={() => setShowSettings(true)} className="hide-sm" style={{ background:"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.2)", borderRadius:6, padding:"5px 12px", color:"#fff", fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>⚙️ সেটিংস</button>
              <button onClick={() => setMobMenu(o => !o)} style={{ display:"none", background:"none", border:"none", cursor:"pointer", fontSize:20, color:"#fff", padding:4 }} className="show-sm">☰</button>
            </div>
          </div>

          {/* Mobile dropdown */}
          {mobMenu && (
            <div style={{ background: dark ? "#0b1a10" : "#0d4a2e", borderTop:"1px solid rgba(255,255,255,.1)" }}>
              {ALL_PAGES.map(item => (
                <button key={item} onClick={() => { setPage(item); setMobMenu(false); }}
                  style={{ display:"block", width:"100%", textAlign:"left", background: page===item?"rgba(46,204,113,.15)":"none", border:"none", borderLeft: page===item?"3px solid #2ecc71":"3px solid transparent", color: page===item?"#2ecc71":"rgba(255,255,255,.85)", fontSize:14, fontWeight: page===item?700:400, cursor:"pointer", padding:"12px 20px", fontFamily:"inherit" }}>
                  {item==="Prayer" ? "🏠 হোম" : item==="Quran" ? "📖 কুরআন / Quran" : item==="Hadith" ? "📚 হাদিস / Hadith" : item==="Tasbih" ? "📿 তাসবিহ" : item==="Mosque" ? "🕌 মসজিদ" : item==="News" ? "📰 সংবাদ / News" : "🕐 নামাজ / Prayer Times"}
                </button>
              ))}
              <div style={{ height:1, background:"rgba(255,255,255,.1)", margin:"4px 0" }} />
              <button onClick={() => { setShowSettings(true); setMobMenu(false); }} style={{ display:"block", width:"100%", textAlign:"left", background:"none", border:"none", color:"rgba(255,255,255,.7)", fontSize:14, cursor:"pointer", padding:"12px 20px", fontFamily:"inherit" }}>⚙️ সেটিংস</button>
            </div>
          )}
        </nav>

        {/* ══ BREADCRUMB BAR ══ */}
        <div style={{ background: dark ? C.surface : "#fff", borderBottom:`1px solid ${C.border}` }}>
          <div style={{ maxWidth:1320, margin:"0 auto" }}>
            <div className="breadcrumb" style={{ color:C.textDim }}>
              <button className="breadcrumb-link" onClick={() => setPage("Prayer")} style={{ color:"#1a6b3a" }}>হোম</button>
              <span>›</span>
              <span style={{ color:C.text, fontWeight:600 }}>
                {page==="Prayer" ? "হোম / Home" : page==="Quran" ? "কুরআন / Quran" : page==="Hadith" ? "হাদিস / Hadith" : page==="Tasbih" ? "তাসবিহ / Tasbih" : page==="Mosque" ? "মসজিদ / Mosque" : page==="News" ? "সংবাদ / News" : "নামাজের সময় / Prayer Times"}
              </span>
            </div>
          </div>
        </div>

        {/* ══ BODY: FULL WIDTH CONTENT ══ */}
        <div style={{ flex:1 }}>
          <div style={{ maxWidth:1320, margin:"0 auto" }}>
            <main style={{ padding:"24px 24px 60px", background:C.bg }}>
              {renderCurrentPage()}
            </main>
          </div>
        </div>

        {/* ══ FOOTER ══ */}
        <footer style={{ background: dark ? C.surface : "#1a6b3a", color: dark ? C.text : "#fff", borderTop:`1px solid ${dark ? C.border : "rgba(255,255,255,.15)"}` }}>
          {/* Top footer */}
          <div style={{ maxWidth:1320, margin:"0 auto", padding:"32px 20px 24px" }}>
            <div className="foot-cols" style={{ display:"flex", gap:40, justifyContent:"space-between", flexWrap:"wrap" }}>
              {/* Brand */}
              <div style={{ maxWidth:260 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                  <span style={{ fontSize:22 }}>🕌</span>
                  <span style={{ fontWeight:800, fontSize:18, fontFamily:"'Noto Serif',Georgia,serif" }}>Waqt</span>
                </div>
                <p style={{ fontSize:13, opacity:.8, lineHeight:1.7, marginBottom:14 }}>আধুনিক উম্মাহর জন্য তৈরি। প্রতিদিন মুসলিমদের দ্বীনের সাথে যুক্ত রাখতে সাহায্য করে।</p>
                <div style={{ fontSize:12, opacity:.65 }}>তৈরি করেছেন <strong>SHAHIB H</strong></div>
              </div>
              {/* Features */}
              <div>
                <div style={{ fontSize:12, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:12, opacity:.7 }}>বৈশিষ্ট্য</div>
                {["নামাজের সময়","কুরআন অডিও","হাদিস সংকলন","তাসবিহ কাউন্টার","মসজিদ খুঁজুন"].map(l => (
                  <div key={l} style={{ fontSize:13, opacity:.8, marginBottom:8, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity="1"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity=".8"}>
                    <span style={{ fontSize:10, opacity:.6 }}>›</span> {l}
                  </div>
                ))}
              </div>
              {/* Pages */}
              <div>
                <div style={{ fontSize:12, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:12, opacity:.7 }}>পেইজ</div>
                {["শর্তাবলী","গোপনীয়তা","যোগাযোগ","সহায়তা"].map(l => (
                  <div key={l} style={{ fontSize:13, opacity:.8, marginBottom:8, cursor:"pointer" }}>{l}</div>
                ))}
              </div>
              {/* About */}
              <div>
                <div style={{ fontSize:12, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:12, opacity:.7 }}>অ্যাপ সম্পর্কে / About</div>
                <div style={{ fontSize:13, opacity:.8, lineHeight:1.7 }}>
                  <div style={{ marginBottom:8 }}>📿 ডিজিটাল যিকির কাউন্টার</div>
                  <div style={{ marginBottom:8 }}>🕐 লাইভ নামাজের সময়</div>
                  <div style={{ marginBottom:8 }}>📖 কুরআন তিলাওয়াত</div>
                  <div>📚 হাদিস সংকলন</div>
                </div>
              </div>
            </div>
          </div>
          {/* Bottom bar */}
          <div style={{ borderTop: dark ? `1px solid ${C.border}` : "1px solid rgba(255,255,255,.15)", padding:"14px 20px" }}>
            <div style={{ maxWidth:1320, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
              <div style={{ fontSize:12, opacity:.65 }}>© ২০২৬ Waqt · তৈরি করেছেন / by <strong>SHAHIB H</strong></div>
              <div style={{ fontSize:12, opacity:.65 }}>আধুনিক উম্মাহর জন্য / Built for the Modern Ummah 🌙</div>
            </div>
          </div>
        </footer>

        {/* ══ MOBILE BOTTOM NAV ══ */}
        <nav style={{ display:"none", position:"fixed", bottom:0, left:0, right:0, zIndex:150, background: dark ? C.navBg : "#1a6b3a", borderTop:`1px solid ${dark ? C.border : "rgba(255,255,255,.2)"}` }} className="mob-nav">
          <div style={{ display:"flex", width:"100%" }}>
            {MOB_NAV.map(item => (
              <button key={item.id} onClick={() => setPage(item.id)}
                style={{ flex:1, background:"none", border:"none", cursor:"pointer", padding:"10px 4px 8px", display:"flex", flexDirection:"column", alignItems:"center", gap:3, position:"relative", fontFamily:"inherit" }}>
                <span style={{ fontSize:20 }}>{item.icon}</span>
                <span style={{ fontSize:10, color: page===item.id ? "#2ecc71" : "rgba(255,255,255,.7)", fontWeight: page===item.id ? 700 : 400 }}>{item.label}</span>
                {page===item.id && <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:22, height:3, background:"#2ecc71", borderRadius:"0 0 4px 4px" }} />}
              </button>
            ))}
          </div>
        </nav>

        {/* ══ MODALS ══ */}
        {showProfile  && <ProfileModal onClose={() => setShowProfile(false)}  C={C} profile={profile} setProfile={handleSetProfile} />}
        {showSettings && <SettingsModal onClose={() => setShowSettings(false)} dark={dark} setDark={setDark} C={C} />}
        {toast && <Toast msg={toast} />}
      </div>
    </>
  );
}