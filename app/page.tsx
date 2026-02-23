"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Page = "Prayer" | "Quran" | "Hadith" | "Tasbih" | "Mosque" | "News" | "Database";

interface UserProfile {
  name: string;
  email: string;
  city: string;
  avatar: string | null;
  joinDate: string;
}

interface UserStats {
  daysStreak: number;
  juzRead: number;
  tasbihTotal: number;
  prayersLogged: number;
  surahsListened: number;
  lastActive: string;
}

interface ActivityLog {
  id: number;
  type: "prayer" | "quran" | "tasbih" | "hadith";
  label: string;
  time: string;
  date: string;
}

// ─── Static Data ──────────────────────────────────────────────────────────────
const PRAYERS = [
  { name: "Fajr",    icon: "🌙", time: "04:22" },
  { name: "Dhuhr",   icon: "☀️",  time: "01:05" },
  { name: "Asr",     icon: "🌤",  time: "04:45", active: true },
  { name: "Maghrib", icon: "🌇", time: "06:42" },
  { name: "Isha",    icon: "✨", time: "08:15" },
];

const QURAN_SURAHS = [
  { num: 1,   name: "Al-Fatihah", arabic: "الفاتحة",  verses: 7,   type: "Meccan"  },
  { num: 2,   name: "Al-Baqarah", arabic: "البقرة",   verses: 286, type: "Medinan" },
  { num: 3,   name: "Ali Imran",  arabic: "آل عمران", verses: 200, type: "Medinan" },
  { num: 4,   name: "An-Nisa",    arabic: "النساء",   verses: 176, type: "Medinan" },
  { num: 5,   name: "Al-Maidah",  arabic: "المائدة",  verses: 120, type: "Medinan" },
  { num: 6,   name: "Al-Anam",    arabic: "الأنعام",  verses: 165, type: "Meccan"  },
  { num: 7,   name: "Al-Araf",    arabic: "الأعراف",  verses: 206, type: "Meccan"  },
  { num: 8,   name: "Al-Anfal",   arabic: "الأنفال",  verses: 75,  type: "Medinan" },
  { num: 36,  name: "Ya-Sin",     arabic: "يس",       verses: 83,  type: "Meccan"  },
  { num: 55,  name: "Ar-Rahman",  arabic: "الرحمن",   verses: 78,  type: "Medinan" },
  { num: 67,  name: "Al-Mulk",    arabic: "الملك",    verses: 30,  type: "Meccan"  },
  { num: 112, name: "Al-Ikhlas",  arabic: "الإخلاص", verses: 4,   type: "Meccan"  },
  { num: 113, name: "Al-Falaq",   arabic: "الفلق",    verses: 5,   type: "Meccan"  },
  { num: 114, name: "An-Nas",     arabic: "الناس",    verses: 6,   type: "Meccan"  },
];

const HADITHS = [
  { id: 1, text: "The best among you are those who learn the Quran and teach it.", ref: "Sahih al-Bukhari 5027", narrator: "Uthman ibn Affan", category: "Knowledge" },
  { id: 2, text: "None of you truly believes until he loves for his brother what he loves for himself.", ref: "Sahih al-Bukhari 13", narrator: "Anas ibn Malik", category: "Faith" },
  { id: 3, text: "Speak good or remain silent.", ref: "Sahih al-Bukhari 6018", narrator: "Abu Hurairah", category: "Character" },
  { id: 4, text: "The strong man is not the one who overcomes people by strength, but the one who controls himself while in anger.", ref: "Sahih al-Bukhari 6114", narrator: "Abu Hurairah", category: "Character" },
  { id: 5, text: "Make things easy and do not make them difficult, cheer people up and do not drive them away.", ref: "Sahih al-Bukhari 69", narrator: "Anas ibn Malik", category: "Conduct" },
  { id: 6, text: "Whoever believes in Allah and the Last Day should speak a good word or remain silent.", ref: "Sahih al-Bukhari 6136", narrator: "Abu Hurairah", category: "Speech" },
];

const NEWS = [
  { title: "Preparations complete for upcoming Hajj season 2025",     cat: "WORLD",     ago: "4 HOURS AGO",  img: "🕋" },
  { title: "New Global Zakat Fund initiative launched for education",  cat: "COMMUNITY", ago: "1 DAY AGO",    img: "🤲" },
  { title: "Exhibition featuring rare 14th-century manuscripts opens", cat: "CULTURE",   ago: "3 DAYS AGO",   img: "📜" },
  { title: "Islamic finance sector grows 15% in Southeast Asia",       cat: "FINANCE",   ago: "5 DAYS AGO",   img: "💰" },
  { title: "New mosque breaks ground in downtown Toronto",             cat: "WORLD",     ago: "1 WEEK AGO",   img: "🕌" },
  { title: "Quran memorization championship draws 500 participants",   cat: "COMMUNITY", ago: "2 WEEKS AGO",  img: "📖" },
];

const ARTICLES = [
  { title: "Optimizing Your Routine for Last 10 Days of Ramadan",            read: "8 min",  ago: "2 days ago", num: "1" },
  { title: "The Architecture of Spirituality: Understanding Islamic Design", read: "12 min", ago: "5 days ago", num: "2" },
];

const MOSQUES_DHAKA = [
  { name: "Baitul Mukarram National Mosque", dist: "1.2 km", address: "Purana Paltan, Dhaka-1000", rating: 4.9, prayer: "Asr: 04:45", img: "🕌" },
  { name: "Star Mosque (Tara Masjid)",       dist: "2.4 km", address: "Armanitola, Old Dhaka",    rating: 4.8, prayer: "Asr: 04:45", img: "⭐" },
  { name: "Khan Mohammad Mridha Mosque",     dist: "3.1 km", address: "Lalbagh, Old Dhaka",       rating: 4.7, prayer: "Asr: 04:40", img: "🏛️" },
  { name: "Hussaini Dalan",                  dist: "3.8 km", address: "Old Dhaka",                rating: 4.6, prayer: "Asr: 04:45", img: "🏰" },
  { name: "Chawkbazar Shahi Mosque",         dist: "4.5 km", address: "Chawkbazar, Old Dhaka",    rating: 4.7, prayer: "Asr: 04:40", img: "🕌" },
];

const TASBIH_OPTIONS = ["Subhan Allah", "Alhamdulillah", "Allahu Akbar", "La ilaha illallah", "Astaghfirullah"];
const getSurahAudio  = (n: number) => `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${n}.mp3`;

const DEFAULT_PROFILE: UserProfile = {
  name: "Shahib Hasan",
  email: "shahibhasan0@gmail.com",
  city: "Dhaka, Bangladesh",
  avatar: null,
  joinDate: "February 2026",
};

const DEFAULT_STATS: UserStats = {
  daysStreak: 142, juzRead: 5, tasbihTotal: 1240,
  prayersLogged: 28, surahsListened: 12, lastActive: "Today",
};

const SAMPLE_LOGS: ActivityLog[] = [
  { id: 1, type: "prayer",  label: "Fajr Prayer Logged",     time: "04:30 AM", date: "Today"     },
  { id: 2, type: "quran",   label: "Listened to Al-Fatihah", time: "05:12 AM", date: "Today"     },
  { id: 3, type: "tasbih",  label: "SubhanAllah ×33",        time: "06:00 AM", date: "Today"     },
  { id: 4, type: "hadith",  label: "Read Hadith #3",         time: "07:45 AM", date: "Today"     },
  { id: 5, type: "prayer",  label: "Dhuhr Prayer Logged",    time: "01:10 PM", date: "Today"     },
  { id: 6, type: "quran",   label: "Listened to Ya-Sin",     time: "02:00 PM", date: "Yesterday" },
  { id: 7, type: "tasbih",  label: "Alhamdulillah ×99",      time: "03:30 PM", date: "Yesterday" },
  { id: 8, type: "prayer",  label: "Asr Prayer Logged",      time: "04:50 PM", date: "Yesterday" },
];

// ─── Themes ───────────────────────────────────────────────────────────────────
const themes = {
  dark: {
    bg: "#0A0D14", surface: "#111520", surface2: "#181F30",
    border: "#1E2840", gold: "#C9A84C", text: "#E8EAF0",
    textDim: "#5A6480", textMid: "#8A96B0", teal: "#1F6B5A",
    navBg: "#0D1020", shadow: "rgba(0,0,0,0.6)", inputBg: "#181F30",
    starColor: "rgba(255,255,255,0.9)", success: "#22C55E",
  },
  light: {
    bg: "#F4F6FB", surface: "#FFFFFF", surface2: "#F0F3FA",
    border: "#DDE3F0", gold: "#B8860B", text: "#1A1F2E",
    textDim: "#7080A0", textMid: "#4A5570", teal: "#1F6B5A",
    navBg: "#FFFFFF", shadow: "rgba(0,0,0,0.08)", inputBg: "#F0F3FA",
    starColor: "rgba(180,190,255,0.65)", success: "#16A34A",
  },
};
type C = typeof themes.dark;

// ─── Global CSS ───────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { overflow-x: hidden; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #2A3550; border-radius: 3px; }

  @keyframes fadeUp  { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn  { from { opacity:0; } to { opacity:1; } }
  @keyframes scaleIn { from { opacity:0; transform:scale(.92) translateY(12px); } to { opacity:1; transform:scale(1) translateY(0); } }
  @keyframes popIn   { from { opacity:0; transform:scale(.78); } to { opacity:1; transform:scale(1); } }
  @keyframes pulse   { 0%,100%{ transform:scale(1); opacity:1; } 50%{ transform:scale(1.18); opacity:.7; } }
  @keyframes float   { 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(-7px); } }
  @keyframes glow    { 0%,100%{ box-shadow:0 0 8px rgba(201,168,76,.3); } 50%{ box-shadow:0 0 22px rgba(201,168,76,.7); } }
  @keyframes dotBlink{ 0%,100%{ transform:scaleY(.4); } 50%{ transform:scaleY(1); } }
  @keyframes spin    { to { transform:rotate(360deg); } }
  @keyframes slideUp { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }

  .fu  { animation: fadeUp  .5s  cubic-bezier(.22,1,.36,1) both; }
  .fu1 { animation: fadeUp  .5s  .07s cubic-bezier(.22,1,.36,1) both; }
  .fu2 { animation: fadeUp  .5s  .14s cubic-bezier(.22,1,.36,1) both; }
  .fu3 { animation: fadeUp  .5s  .21s cubic-bezier(.22,1,.36,1) both; }
  .fu4 { animation: fadeUp  .5s  .28s cubic-bezier(.22,1,.36,1) both; }
  .fu5 { animation: fadeUp  .5s  .35s cubic-bezier(.22,1,.36,1) both; }
  .sci { animation: scaleIn .32s cubic-bezier(.22,1,.36,1) both; }
  .float-a { animation: float 3.5s ease-in-out infinite; }
  .glow-a  { animation: glow  2.5s ease-in-out infinite; }
  .pulse-a { animation: pulse 2s   ease-in-out infinite; }

  /* ─ Mobile helpers ─ */
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
    .db-cards  { grid-template-columns:1fr 1fr !important; }
    .foot-top  { flex-direction:column !important; }
    .foot-links{ display:none !important; }
    .prayers-r { flex-wrap:wrap !important; }
    .p-card    { min-width:calc(33.3% - 6px) !important; flex: none !important; }
  }
  @media(max-width:480px){
    .p-card    { min-width:calc(50% - 4px) !important; }
    .db-cards  { grid-template-columns:1fr !important; }
  }
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
function useAudio() {
  const ref    = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [playing,  setPlaying]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [current,  setCurrent]  = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const play = useCallback((n: number) => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (ref.current) { ref.current.pause(); ref.current = null; }
    if (current === n && playing) { setPlaying(false); setCurrent(null); return; }
    setLoading(true); setCurrent(n); setProgress(0);
    const a = new Audio(getSurahAudio(n)); ref.current = a;
    const tick = () => {
      if (!ref.current || ref.current.paused) return;
      setProgress(ref.current.currentTime); setDuration(ref.current.duration || 0);
      rafRef.current = requestAnimationFrame(tick);
    };
    a.addEventListener("canplay", () => { setLoading(false); a.play(); setPlaying(true); rafRef.current = requestAnimationFrame(tick); });
    a.addEventListener("ended",   () => { if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; } setPlaying(false); setProgress(0); setCurrent(null); });
    a.addEventListener("error",   () => { if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; } setLoading(false); setPlaying(false); });
    a.load();
  }, [current, playing]);

  const seek = useCallback((pct: number) => { if (ref.current) ref.current.currentTime = pct * (ref.current.duration || 0); }, []);
  useEffect(() => () => { ref.current?.pause(); if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);
  return { play, seek, playing, loading, current, progress, duration };
}
type AudioHook = ReturnType<typeof useAudio>;

// ─── Audio Bar ────────────────────────────────────────────────────────────────
function AudioBar({ n, audio, C }: { n: number; audio: AudioHook; C: C }) {
  const isThis = audio.current === n;
  const pct    = isThis && audio.duration ? (audio.progress / audio.duration) * 100 : 0;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, minWidth: isThis ? 110 : 40, transition:"min-width .2s" }}>
      <button onClick={() => audio.play(n)} style={{ width:33, height:33, borderRadius:"50%", background: isThis&&audio.playing ? C.gold : C.surface2, border:`1px solid ${isThis&&audio.playing ? C.gold : C.border}`, color: isThis&&audio.playing ? "#000" : C.text, fontSize:12, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all .2s" }}>
        {isThis&&audio.loading ? "⟳" : isThis&&audio.playing ? "⏸" : "▶"}
      </button>
      <div style={{ flex:1, height:4, background:C.border, borderRadius:2, cursor:"pointer", minWidth:55, opacity: isThis?1:0, pointerEvents: isThis?"auto":"none", transition:"opacity .2s" }}
        onClick={e => { const r=(e.currentTarget as HTMLElement).getBoundingClientRect(); audio.seek((e.clientX-r.left)/r.width); }}>
        <div style={{ height:"100%", width:`${pct}%`, background:C.gold, borderRadius:2, willChange:"width", transform:"translateZ(0)" }} />
      </div>
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
    <div style={{ position:"fixed", bottom:80, left:"50%", transform:"translateX(-50%)", background:"#C9A84C", color:"#000", padding:"10px 22px", borderRadius:24, fontWeight:700, fontSize:13, zIndex:10000, animation:"popIn .3s ease", whiteSpace:"nowrap", boxShadow:"0 8px 24px rgba(0,0,0,.3)" }}>
      {msg}
    </div>
  );
}

// ─── Avatar Display ───────────────────────────────────────────────────────────
function Avatar({ profile, size = 36, border }: { profile: UserProfile; size?: number; border?: string }) {
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:"linear-gradient(135deg,#C9A84C,#8B6914)", border: border ?? "none", display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*.4, overflow:"hidden", flexShrink:0 }}>
      {profile.avatar
        ? <img src={profile.avatar} alt="avatar" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
        : <span>👤</span>
      }
    </div>
  );
}

// ─── Profile Modal ─────────────────────────────────────────────────────────────
function ProfileModal({ onClose, C, profile, setProfile, stats }: {
  onClose: () => void; C: C;
  profile: UserProfile; setProfile: (p: UserProfile) => void;
  stats: UserStats;
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
          <div style={{ width:90, height:90, borderRadius:"50%", background:"linear-gradient(135deg,#C9A84C,#8B6914)", border:`3px solid ${C.gold}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:38, overflow:"hidden", margin:"0 auto 6px", boxShadow:`0 0 0 4px ${C.surface},0 0 0 6px ${C.border}` }}>
            {draft.avatar
              ? <img src={draft.avatar} alt="avatar" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
              : <span>👤</span>
            }
          </div>
          {/* Camera button */}
          <button
            onClick={() => fileRef.current?.click()}
            title="Upload photo"
            style={{ position:"absolute", bottom:6, right:-4, width:30, height:30, borderRadius:"50%", background:C.gold, border:`2px solid ${C.surface}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, color:"#000", boxShadow:"0 2px 8px rgba(0,0,0,.3)" }}>
            📷
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleAvatarChange} />
        </div>

        {draft.avatar && (
          <button onClick={() => setDraft(d => ({ ...d, avatar: null }))}
            style={{ background:"none", border:"none", color:C.textDim, fontSize:11, cursor:"pointer", display:"block", margin:"4px auto 0" }}>
            Remove photo
          </button>
        )}

        <h2 style={{ fontSize:20, fontWeight:700, color:C.text, marginTop:10 }}>My Profile</h2>
        <p style={{ fontSize:12, color:C.textDim, marginTop:3 }}>Member since {profile.joinDate}</p>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        {/* Editable fields */}
        {([["FULL NAME","name"],["EMAIL","email"],["CITY","city"]] as [string, keyof UserProfile][]).map(([label, key]) => (
          <div key={label}>
            <div style={{ fontSize:11, color:C.textDim, letterSpacing:"0.06em" }}>{label}</div>
            <input style={inp} value={String(draft[key] ?? "")} onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))} />
          </div>
        ))}

        {/* Stats */}
        <div style={{ background:C.surface2, border:`1px solid ${C.border}`, borderRadius:12, padding:16 }}>
          <div style={{ fontSize:11, color:C.textDim, marginBottom:12, letterSpacing:"0.06em" }}>YOUR STATS</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", textAlign:"center", gap:8 }}>
            {[[stats.daysStreak,"Day Streak 🔥"],[stats.juzRead,"Juz Read"],[stats.tasbihTotal.toLocaleString(),"Tasbih"]].map(([v,l]) => (
              <div key={String(l)}>
                <div style={{ fontSize:22, fontWeight:800, color:C.gold }}>{v}</div>
                <div style={{ fontSize:11, color:C.textDim }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <button onClick={save} style={{ background: saved ? C.success : `linear-gradient(135deg,${C.gold},${C.teal})`, border:"none", borderRadius:12, padding:"13px 0", color:"#fff", fontSize:15, fontWeight:700, cursor:"pointer", transition:"background .3s", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          {saved ? "✓ Saved!" : "Save Changes"}
        </button>
      </div>
    </Modal>
  );
}

// ─── Settings Modal ───────────────────────────────────────────────────────────
function SettingsModal({ onClose, dark, setDark, C }: { onClose:()=>void; dark:boolean; setDark:(v:boolean)=>void; C:C }) {
  const [notif,   setNotif]   = useState(true);
  const [adhan,   setAdhan]   = useState(true);
  const [reciter, setReciter] = useState("Mishary Alafasy");
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
      <h2 style={{ fontSize:20, fontWeight:700, color:C.text, marginBottom:4 }}>⚙️ Settings</h2>
      <p style={{ fontSize:13, color:C.textDim, marginBottom:20 }}>Customize your experience</p>
      <Toggle label="Dark Mode"     sub="Toggle dark / light theme"  val={dark}  fn={() => setDark(!dark)} />
      <Toggle label="Notifications" sub="Prayer time reminders"      val={notif} fn={() => setNotif(v => !v)} />
      <Toggle label="Adhan Alert"   sub="Play adhan at prayer times" val={adhan} fn={() => setAdhan(v => !v)} />
      <div style={{ padding:"13px 0", borderBottom:`1px solid ${C.border}` }}>
        <div style={{ fontSize:14, fontWeight:500, color:C.text, marginBottom:8 }}>Reciter</div>
        {["Mishary Alafasy","Abdul Rahman Al-Sudais","Saad Al-Ghamdi"].map(r => (
          <button key={r} onClick={() => setReciter(r)} style={{ display:"block", width:"100%", textAlign:"left", padding:"8px 12px", borderRadius:8, background: reciter===r?C.surface2:"none", border: reciter===r?`1px solid ${C.gold}`:"1px solid transparent", color: reciter===r?C.gold:C.textMid, fontSize:13, cursor:"pointer", marginBottom:4 }}>
            {reciter===r?"✓ ":""}{r}
          </button>
        ))}
      </div>
      <div style={{ padding:"13px 0", fontSize:13, color:C.textDim }}>Waqt v2.0 — Built for the Modern Ummah</div>
    </Modal>
  );
}

// ─── Page entry animation wrapper ─────────────────────────────────────────────
function PW({ children, k }: { children: React.ReactNode; k: string }) {
  return <div key={k} style={{ animation:"fadeUp .45s cubic-bezier(.22,1,.36,1) both" }}>{children}</div>;
}

// ─── Database Page ─────────────────────────────────────────────────────────────
function DatabasePage({ C, profile, stats, logs }: { C:C; profile:UserProfile; stats:UserStats; logs:ActivityLog[] }) {
  const [tab, setTab] = useState<"overview"|"activity"|"export">("overview");

  const typeIcon  = (t: string) => ({ prayer:"🕌", quran:"📖", tasbih:"📿", hadith:"📜" }[t] ?? "📋");
  const typeColor = (t: string) => ({ prayer:C.teal, quran:C.gold, tasbih:"#8B5CF6", hadith:"#EC4899" }[t] ?? C.textDim);

  const rows = [
    { f:"Name",            v: profile.name,                         tbl:"users" },
    { f:"Email",           v: profile.email,                        tbl:"users" },
    { f:"City",            v: profile.city,                         tbl:"users" },
    { f:"Join Date",       v: profile.joinDate,                     tbl:"users" },
    { f:"Avatar",          v: profile.avatar ? "Uploaded ✓" : "—", tbl:"users" },
    { f:"Days Streak",     v: String(stats.daysStreak),             tbl:"stats" },
    { f:"Juz Read",        v: String(stats.juzRead),                tbl:"stats" },
    { f:"Total Tasbih",    v: stats.tasbihTotal.toLocaleString(),   tbl:"stats" },
    { f:"Prayers Logged",  v: String(stats.prayersLogged),          tbl:"stats" },
    { f:"Surahs Listened", v: String(stats.surahsListened),         tbl:"stats" },
    { f:"Last Active",     v: stats.lastActive,                     tbl:"stats" },
  ];

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify({ profile, stats, activityLog: logs }, null, 2)], { type:"application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = "waqt-data.json"; a.click(); URL.revokeObjectURL(url);
  };
  const exportCSV = () => {
    const csv = "Field,Value,Table\n" + rows.map(r => `"${r.f}","${r.v}","${r.tbl}"`).join("\n");
    const blob = new Blob([csv], { type:"text/csv" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = "waqt-data.csv"; a.click(); URL.revokeObjectURL(url);
  };

  const Tb = ({ id, label }: { id: typeof tab; label:string }) => (
    <button onClick={() => setTab(id)} style={{ padding:"8px 16px", borderRadius:20, background: tab===id?C.gold:C.surface2, border:`1px solid ${tab===id?C.gold:C.border}`, color: tab===id?"#000":C.textMid, fontSize:13, fontWeight: tab===id?700:400, cursor:"pointer", transition:"all .2s" }}>{label}</button>
  );

  return (
    <PW k="db">
      <div style={{ display:"flex", flexDirection:"column", gap:24, maxWidth:900 }}>
        {/* Header */}
        <div className="fu" style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:48, height:48, borderRadius:14, background:`linear-gradient(135deg,${C.teal},${C.gold})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>🗄️</div>
          <div>
            <h2 style={{ fontSize:26, fontWeight:700, color:C.text }}>User Database</h2>
            <p style={{ fontSize:13, color:C.textDim }}>All your data stored locally · Last synced: {stats.lastActive}</p>
          </div>
        </div>

        {/* Summary cards */}
        <div className="fu1 db-cards" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
          {[
            { icon:"👤", label:"Profile Fields", val:"5",             color:C.gold    },
            { icon:"📊", label:"Stats Tracked",  val:"6",             color:C.teal    },
            { icon:"📋", label:"Activity Logs",  val:String(logs.length), color:"#8B5CF6" },
            { icon:"💾", label:"Data Size",       val:"~2 KB",         color:"#EC4899" },
          ].map(s => (
            <div key={s.label} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:"16px 12px", textAlign:"center" }}>
              <div style={{ fontSize:22, marginBottom:6 }}>{s.icon}</div>
              <div style={{ fontSize:22, fontWeight:800, color:s.color }}>{s.val}</div>
              <div style={{ fontSize:11, color:C.textDim, marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="fu2" style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <Tb id="overview" label="📋 Overview" />
          <Tb id="activity" label="📈 Activity Log" />
          <Tb id="export"   label="💾 Export" />
        </div>

        {/* ── Overview ── */}
        {tab === "overview" && (
          <div className="fu2" style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {/* Data table */}
            <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, overflow:"hidden" }}>
              <div style={{ padding:"12px 18px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ background:C.surface2, border:`1px solid ${C.border}`, borderRadius:6, padding:"2px 10px", fontSize:11, color:C.gold, fontWeight:700 }}>TABLE</span>
                <span style={{ fontWeight:700, color:C.text }}>users + stats</span>
                <span style={{ fontSize:11, color:C.textDim, marginLeft:"auto" }}>{rows.length} records</span>
              </div>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead>
                    <tr style={{ background:C.surface2 }}>
                      {["Field","Value","Table"].map(h => <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontSize:11, color:C.textDim, fontWeight:700, letterSpacing:"0.08em", whiteSpace:"nowrap" }}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r,i) => (
                      <tr key={r.f} style={{ borderTop:`1px solid ${C.border}`, background: i%2===0?"transparent":C.surface2 }}>
                        <td style={{ padding:"10px 16px", fontSize:13, color:C.textDim, whiteSpace:"nowrap" }}>{r.f}</td>
                        <td style={{ padding:"10px 16px", fontSize:13, color:C.text, fontWeight:500, maxWidth:240, wordBreak:"break-all" }}>{r.v}</td>
                        <td style={{ padding:"10px 16px" }}>
                          <span style={{ background: r.tbl==="users"?"rgba(201,168,76,.12)":"rgba(31,107,90,.12)", color: r.tbl==="users"?C.gold:C.teal, border:`1px solid ${r.tbl==="users"?C.gold:C.teal}`, borderRadius:6, padding:"2px 8px", fontSize:10, fontWeight:700 }}>{r.tbl}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Schema */}
            <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
              <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:14 }}>📐 Schema</div>
              {[
                { name:"users",    fields:"id · name · email · city · avatar · joinDate",                                      color:C.gold    },
                { name:"stats",    fields:"userId · daysStreak · juzRead · tasbihTotal · prayersLogged · surahsListened · lastActive", color:C.teal    },
                { name:"activity", fields:"id · userId · type · label · time · date",                                          color:"#8B5CF6" },
              ].map(s => (
                <div key={s.name} style={{ background:C.surface2, border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 14px", marginBottom:8 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:s.color, marginBottom:3 }}>{s.name}</div>
                  <div style={{ fontSize:11, color:C.textDim, fontFamily:"monospace" }}>{s.fields}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Activity ── */}
        {tab === "activity" && (
          <div className="fu2" style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {logs.map((log, i) => (
              <div key={log.id} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, padding:"12px 16px", display:"flex", alignItems:"center", gap:14, animation:`fadeUp .4s ${i*0.05}s both cubic-bezier(.22,1,.36,1)` }}>
                <div style={{ width:38, height:38, borderRadius:10, background:`${typeColor(log.type)}22`, border:`1px solid ${typeColor(log.type)}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>{typeIcon(log.type)}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:500, color:C.text }}>{log.label}</div>
                  <div style={{ fontSize:11, color:C.textDim, marginTop:2 }}>{log.date} · {log.time}</div>
                </div>
                <span style={{ background:`${typeColor(log.type)}18`, color:typeColor(log.type), border:`1px solid ${typeColor(log.type)}44`, borderRadius:6, padding:"2px 10px", fontSize:10, fontWeight:700, textTransform:"uppercase", flexShrink:0 }}>{log.type}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Export ── */}
        {tab === "export" && (
          <div className="fu2" style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:24 }}>
              <div style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:8 }}>💾 Download Your Data</div>
              <p style={{ fontSize:13, color:C.textDim, lineHeight:1.7, marginBottom:16 }}>Export all your Waqt data including profile, stats, and activity logs. Your data belongs to you.</p>
              <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                <button onClick={exportJSON} style={{ background:`linear-gradient(135deg,${C.gold},#8B6914)`, border:"none", borderRadius:12, padding:"12px 22px", color:"#000", fontSize:14, fontWeight:700, cursor:"pointer" }}>📄 Export JSON</button>
                <button onClick={exportCSV}  style={{ background:C.surface2, border:`1px solid ${C.border}`, borderRadius:12, padding:"12px 22px", color:C.text, fontSize:14, fontWeight:600, cursor:"pointer" }}>📊 Export CSV</button>
              </div>
            </div>
            <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
              <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:12 }}>🔒 Privacy</div>
              {["All data is stored locally in your browser — no cloud server.","Your profile picture is encoded locally as Base64.","Exporting does not send data anywhere external.","Clearing browser storage will delete all saved data."].map(t => (
                <div key={t} style={{ display:"flex", gap:10, marginBottom:10 }}>
                  <span style={{ color:C.teal, flexShrink:0 }}>✓</span>
                  <span style={{ fontSize:13, color:C.textMid, lineHeight:1.6 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PW>
  );
}

// ─── Quran Page ───────────────────────────────────────────────────────────────
function QuranPage({ C, audio }: { C:C; audio:AudioHook }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all"|"meccan"|"medinan">("all");
  const list = QURAN_SURAHS.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) && (filter==="all" || s.type.toLowerCase()===filter));
  return (
    <PW k="quran">
      <div style={{ display:"flex", flexDirection:"column", gap:16, maxWidth:860 }}>
        <div className="fu"><h2 style={{ fontSize:26, fontWeight:700, color:C.text, marginBottom:4 }}>القرآن الكريم</h2><p style={{ fontSize:13, color:C.textDim }}>Mishary Alafasy · Tap ▶ to listen</p></div>
        <div className="fu1" style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <input style={{ flex:1, minWidth:150, background:C.inputBg, border:`1px solid ${C.border}`, borderRadius:10, padding:"9px 14px", color:C.text, fontSize:13, outline:"none" }} placeholder="Search surah…" value={search} onChange={e => setSearch(e.target.value)} />
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {(["all","meccan","medinan"] as const).map(f => <button key={f} onClick={() => setFilter(f)} style={{ padding:"8px 12px", borderRadius:8, background: filter===f?C.gold:C.surface, border:`1px solid ${filter===f?C.gold:C.border}`, color: filter===f?"#000":C.textMid, fontSize:12, cursor:"pointer", fontWeight: filter===f?700:400, textTransform:"capitalize" }}>{f==="all"?"All":f[0].toUpperCase()+f.slice(1)}</button>)}
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {list.map((s, i) => (
            <div key={s.num} style={{ background:C.surface, border:`1px solid ${audio.current===s.num&&audio.playing?C.gold:C.border}`, borderRadius:12, padding:"13px 18px", transition:"border-color .2s,box-shadow .2s", boxShadow: audio.current===s.num&&audio.playing?`0 0 14px rgba(201,168,76,.18)`:"none", animation:`fadeUp .45s ${i*.04}s both cubic-bezier(.22,1,.36,1)` }}>
              <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:34, height:34, background:C.surface2, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:C.gold, flexShrink:0 }}>{s.num}</div>
                <div style={{ flex:1 }}><div style={{ fontSize:14, fontWeight:600, color:C.text, marginBottom:2 }}>{s.name}</div><div style={{ fontSize:11, color:C.textDim }}>{s.verses} verses · {s.type}</div></div>
                <div style={{ fontSize:16, color:C.textMid, fontFamily:"Georgia,serif", marginRight:10 }}>{s.arabic}</div>
                <AudioBar n={s.num} audio={audio} C={C} />
              </div>
              {audio.current===s.num && <div style={{ display:"flex", gap:3, paddingTop:8, alignItems:"flex-end" }}>{[1,2,3,4,5,6].map(b => <div key={b} style={{ width:3, height:4+b*2, background:C.gold, borderRadius:2, animation:`dotBlink ${.3+b*.12}s ease-in-out infinite` }} />)}<span style={{ fontSize:11, color:C.textDim, marginLeft:6 }}>Now Playing</span></div>}
            </div>
          ))}
        </div>
      </div>
    </PW>
  );
}

// ─── Hadith Page ──────────────────────────────────────────────────────────────
function HadithPage({ C }: { C:C }) {
  const [cat, setCat] = useState("All");
  const [speaking, setSpeaking] = useState<number|null>(null);
  const cats = ["All","Faith","Knowledge","Character","Conduct","Speech"];
  const list = cat==="All" ? HADITHS : HADITHS.filter(h => h.category===cat);
  const speak = (h: typeof HADITHS[0]) => {
    if (speaking===h.id) { window.speechSynthesis.cancel(); setSpeaking(null); return; }
    setSpeaking(h.id);
    smoothSpeak(`${h.text}  ...  Narrated by ${h.narrator}. ${h.ref}.`, () => setSpeaking(null));
  };
  return (
    <PW k="hadith">
      <div style={{ display:"flex", flexDirection:"column", gap:16, maxWidth:860 }}>
        <div className="fu"><h2 style={{ fontSize:26, fontWeight:700, color:C.text, marginBottom:4 }}>Hadith Collection</h2><p style={{ fontSize:13, color:C.textDim }}>Tap 🔊 for smooth audio recitation</p></div>
        <div className="fu1" style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {cats.map(c => <button key={c} onClick={() => setCat(c)} style={{ padding:"6px 14px", borderRadius:20, background: cat===c?C.gold:C.surface, border:`1px solid ${cat===c?C.gold:C.border}`, color: cat===c?"#000":C.textMid, fontSize:12, cursor:"pointer", fontWeight: cat===c?700:400 }}>{c}</button>)}
        </div>
        {list.map((h, i) => (
          <div key={h.id} style={{ background:C.surface, border:`1px solid ${speaking===h.id?C.gold:C.border}`, borderRadius:14, padding:22, transition:"border-color .3s", animation:`fadeUp .45s ${i*.07}s both cubic-bezier(.22,1,.36,1)` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
              <span style={{ background:C.surface2, border:`1px solid ${C.border}`, borderRadius:20, padding:"3px 10px", fontSize:11, color:C.textDim }}>{h.category}</span>
              <button onClick={() => speak(h)} style={{ background: speaking===h.id?C.gold:C.surface2, border:`1px solid ${speaking===h.id?C.gold:C.border}`, borderRadius:20, padding:"5px 12px", fontSize:12, cursor:"pointer", color: speaking===h.id?"#000":C.textMid, display:"flex", alignItems:"center", gap:5, transition:"all .2s" }}>
                {speaking===h.id?<>⏹ <span style={{ fontSize:11 }}>Stop</span></>:<>🔊 <span style={{ fontSize:11 }}>Listen</span></>}
              </button>
            </div>
            {speaking===h.id && <div style={{ display:"flex", gap:3, alignItems:"flex-end", marginBottom:14, height:22 }}>{Array.from({length:14}).map((_,b) => <div key={b} style={{ width:3, borderRadius:2, background:C.gold, animation:`dotBlink ${.22+b*.065}s ease-in-out infinite`, height:4+((b*7)%14) }} />)}<span style={{ fontSize:11, color:C.textDim, marginLeft:8, alignSelf:"center" }}>Reciting…</span></div>}
            <div style={{ fontSize:15, fontStyle:"italic", lineHeight:1.8, color:C.textMid, marginBottom:16 }}>"{h.text}"</div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:13, fontWeight:600, color:C.text }}>{h.narrator}</span>
              <span style={{ fontSize:11, color:C.textDim }}>{h.ref}</span>
            </div>
          </div>
        ))}
      </div>
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
    <PW k="tasbih">
      <div style={{ display:"flex", flexDirection:"column", gap:20, maxWidth:560 }}>
        <div className="fu"><h2 style={{ fontSize:26, fontWeight:700, color:C.text, marginBottom:4 }}>Tasbih Counter</h2><p style={{ fontSize:13, color:C.textDim }}>Digital dhikr counter</p></div>
        <div className="fu1" style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {TASBIH_OPTIONS.map((t,i) => <button key={i} onClick={() => { setSel(i); setCount(0); }} style={{ padding:"7px 14px", borderRadius:20, background: sel===i?"linear-gradient(135deg,#2A4A3A,#1A3A2A)":C.surface, border:`1px solid ${sel===i?C.teal:C.border}`, color: sel===i?C.text:C.textMid, fontSize:13, cursor:"pointer", fontWeight: sel===i?600:400 }}>{t}</button>)}
        </div>
        <div className="fu2" style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:20, padding:40, display:"flex", flexDirection:"column", alignItems:"center", gap:12, position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(circle at 50% 20%,rgba(201,168,76,.05),transparent 65%)", pointerEvents:"none" }} />
          <div style={{ fontSize:13, color:C.textDim, letterSpacing:"0.15em", textTransform:"uppercase" }}>{TASBIH_OPTIONS[sel]}</div>
          <div className="pulse-a" style={{ fontSize:96, fontWeight:900, color:C.text, lineHeight:1, fontVariantNumeric:"tabular-nums" }}>{count}</div>
          <div style={{ fontSize:13, color:C.textDim }}>of {target}</div>
          <div style={{ width:"100%", height:8, background:C.surface2, borderRadius:4, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,${C.teal},${C.gold})`, borderRadius:4, transition:"width .25s ease" }} />
          </div>
          {count===target && <div style={{ fontSize:14, color:"#4ADE80", fontWeight:700 }}>✓ Complete! Tap to continue</div>}
          <button onClick={tap} className="glow-a" style={{ background:"linear-gradient(135deg,#2A5A4A,#1A3A2A)", border:`1px solid ${C.teal}`, color:C.text, borderRadius:14, padding:"17px 0", width:"100%", cursor:"pointer", fontSize:18, fontWeight:800, letterSpacing:"0.06em", marginTop:8 }}>📿 TAP</button>
          <button onClick={() => setCount(0)} style={{ background:"none", border:"none", color:C.textDim, fontSize:11, letterSpacing:"0.15em", cursor:"pointer" }}>RESET COUNTER</button>
          <div style={{ display:"flex", gap:36, textAlign:"center" }}>
            {[[total,"Total Today"],[sessions.length,"Rounds"]].map(([v,l]) => <div key={String(l)}><div style={{ fontSize:22, fontWeight:800, color:C.gold }}>{v}</div><div style={{ fontSize:11, color:C.textDim }}>{l}</div></div>)}
          </div>
        </div>
        {sessions.length>0 && <div className="fu3" style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:18 }}><div style={{ fontSize:11, color:C.textDim, letterSpacing:"0.12em", marginBottom:10 }}>SESSION HISTORY</div>{sessions.slice(-5).reverse().map((s,i) => <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:`1px solid ${C.border}`, fontSize:13 }}><span style={{ color:C.textMid }}>{s.name}</span><span style={{ color:C.gold, fontWeight:600 }}>{s.count}×</span></div>)}</div>}
      </div>
    </PW>
  );
}

// ─── Mosque Page ──────────────────────────────────────────────────────────────
function MosquePage({ C }: { C:C }) {
  const [sel, setSel] = useState<number|null>(null);
  return (
    <PW k="mosque">
      <div style={{ display:"flex", flexDirection:"column", gap:16, maxWidth:860 }}>
        <div className="fu"><h2 style={{ fontSize:26, fontWeight:700, color:C.text, marginBottom:4 }}>Nearby Mosques</h2><p style={{ fontSize:13, color:C.textDim }}>📍 Dhaka, Bangladesh</p></div>
        <div className="fu1" style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, height:175, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg,#1A2B1A,#0F1A1A)", opacity:0.85 }} />
          <div className="float-a" style={{ fontSize:48, position:"relative", zIndex:1 }}>🗺️</div>
          <p style={{ color:C.textMid, marginTop:8, position:"relative", zIndex:1, fontSize:13 }}>Dhaka · 5 nearby mosques</p>
        </div>
        {MOSQUES_DHAKA.map((m,i) => (
          <div key={i} onClick={() => setSel(sel===i?null:i)} style={{ background:C.surface, border:`1px solid ${sel===i?C.gold:C.border}`, borderRadius:14, padding:"15px 18px", cursor:"pointer", transition:"all .2s", animation:`fadeUp .4s ${i*.06}s both cubic-bezier(.22,1,.36,1)` }}>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:44, height:44, background:C.surface2, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{m.img}</div>
              <div style={{ flex:1 }}><div style={{ fontSize:14, fontWeight:600, color:C.text, marginBottom:2 }}>{m.name}</div><div style={{ fontSize:12, color:C.textDim }}>{m.address}</div></div>
              <div style={{ textAlign:"right", flexShrink:0 }}><div style={{ fontSize:13, color:C.gold, fontWeight:600, marginBottom:2 }}>⭐ {m.rating}</div><div style={{ fontSize:11, color:C.textDim }}>{m.dist}</div></div>
            </div>
            {sel===i && <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${C.border}`, display:"flex", gap:10 }}>
              <div style={{ flex:1, background:C.surface2, borderRadius:10, padding:"10px 14px" }}><div style={{ color:C.textDim, fontSize:11, marginBottom:2 }}>NEXT PRAYER</div><div style={{ color:C.text, fontWeight:600 }}>{m.prayer}</div></div>
              <button style={{ background:`linear-gradient(135deg,${C.teal},#1A3A2A)`, border:"none", borderRadius:10, padding:"10px 16px", color:C.text, fontSize:13, cursor:"pointer", fontWeight:600 }}>Directions →</button>
            </div>}
          </div>
        ))}
      </div>
    </PW>
  );
}

// ─── News Page ────────────────────────────────────────────────────────────────
function NewsPage({ C }: { C:C }) {
  const [cat, setCat] = useState("All");
  const [open, setOpen] = useState<number|null>(null);
  const cats = ["All","World","Community","Culture","Finance"];
  const list = cat==="All" ? NEWS : NEWS.filter(n => n.cat===cat.toUpperCase());
  return (
    <PW k="news">
      <div style={{ display:"flex", flexDirection:"column", gap:16, maxWidth:860 }}>
        <div className="fu"><h2 style={{ fontSize:26, fontWeight:700, color:C.text, marginBottom:4 }}>Islamic News</h2><p style={{ fontSize:13, color:C.textDim }}>Latest from the Ummah</p></div>
        <div className="fu1" style={{ display:"flex", gap:8, flexWrap:"wrap" }}>{cats.map(c => <button key={c} onClick={() => setCat(c)} style={{ padding:"6px 14px", borderRadius:20, background: cat===c?C.gold:C.surface, border:`1px solid ${cat===c?C.gold:C.border}`, color: cat===c?"#000":C.textMid, fontSize:12, cursor:"pointer", fontWeight: cat===c?700:400 }}>{c}</button>)}</div>
        {list.map((n,i) => (
          <div key={i} onClick={() => setOpen(open===i?null:i)} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:"15px 18px", cursor:"pointer", animation:`fadeUp .4s ${i*.06}s both cubic-bezier(.22,1,.36,1)` }}>
            <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
              <div style={{ width:50, height:50, background:C.surface2, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{n.img}</div>
              <div style={{ flex:1 }}><div style={{ fontSize:10, color:C.textDim, letterSpacing:"0.1em", marginBottom:4 }}>{n.cat} · {n.ago}</div><div style={{ fontSize:14, lineHeight:1.5, fontWeight:500, color:C.text }}>{n.title}</div></div>
            </div>
            {open===i && <div style={{ marginTop:12, fontSize:13, color:C.textMid, lineHeight:1.7, paddingTop:12, borderTop:`1px solid ${C.border}` }}>Full article preview. In a production app, the complete content would load from a news API.<button style={{ display:"block", marginTop:10, background:C.gold, border:"none", borderRadius:8, padding:"8px 16px", color:"#000", fontSize:12, fontWeight:600, cursor:"pointer" }}>Read Full Article →</button></div>}
          </div>
        ))}
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
    <PW k="home">
      <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

        {/* Greeting */}
        <div className="fu" style={{ display:"flex", alignItems:"center", gap:14 }}>
          <Avatar profile={profile} size={50} border={`2px solid ${C.gold}`} />
          <div>
            <div style={{ fontSize:16, fontWeight:700, color:C.text }}>Assalamu Alaikum, {profile.name.split(" ")[0]} 👋</div>
            <div style={{ fontSize:12, color:C.textDim }}>{profile.city} · Today&apos;s Asr in {countdown}</div>
          </div>
        </div>

        {/* Ramadan hero */}
        <div className="fu1 hero-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <div style={{ background:"linear-gradient(135deg,#243830,#182820)", borderRadius:16, padding:24, position:"relative", overflow:"hidden", border:"1px solid #2A4A38", minHeight:155 }}>
            <div style={{ position:"absolute", inset:0, background:"radial-gradient(circle at 75% 50%,rgba(42,122,90,.18),transparent 65%)", pointerEvents:"none" }} />
            <div style={{ fontSize:10, letterSpacing:"0.15em", color:"#6BA88A", marginBottom:4 }}>RAMADAN SPECIAL</div>
            <div style={{ fontSize:19, fontWeight:700, color:C.text, marginBottom:10 }}>Sehri Ends</div>
            <div><span className="pulse-a" style={{ fontSize:42, fontWeight:900, color:C.gold, lineHeight:1, display:"inline-block" }}>04:15</span><span style={{ fontSize:14, color:C.textMid, verticalAlign:"super" }}> AM</span></div>
            <div style={{ fontSize:13, color:C.textMid, marginTop:8 }}>Remaining: <b style={{ color:C.text }}>2h 14m</b></div>
            <div style={{ position:"absolute", right:10, bottom:8, fontSize:52, opacity:0.1 }}>🌅</div>
          </div>
          <div style={{ background:"linear-gradient(135deg,#1A2535,#101820)", borderRadius:16, padding:24, position:"relative", overflow:"hidden", border:"1px solid #1E3048", minHeight:155 }}>
            <div style={{ position:"absolute", inset:0, background:"radial-gradient(circle at 25% 50%,rgba(30,60,100,.2),transparent 65%)", pointerEvents:"none" }} />
            <div style={{ fontSize:10, letterSpacing:"0.15em", color:"#6888AA", marginBottom:4 }}>NEXT MILESTONE</div>
            <div style={{ fontSize:19, fontWeight:700, color:C.text, marginBottom:10 }}>Iftar Starts</div>
            <div><span style={{ fontSize:42, fontWeight:900, color:"#4A7A9A", lineHeight:1 }}>06:42</span><span style={{ fontSize:14, color:C.textMid, verticalAlign:"super" }}> PM</span></div>
            <div style={{ fontSize:13, color:C.textMid, marginTop:8 }}>Location: <b style={{ color:C.text }}>{profile.city}</b></div>
            <div style={{ position:"absolute", right:10, bottom:8, fontSize:52, opacity:0.1 }}>🌙</div>
          </div>
        </div>

        {/* Prayer times */}
        <div className="fu2" style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, fontSize:15, fontWeight:600, color:C.text, flexWrap:"wrap", gap:8 }}>
            <span>🕐 Prayer Times</span>
            <span style={{ background:C.surface2, border:`1px solid ${C.border}`, borderRadius:20, padding:"5px 14px", fontSize:12, color:C.gold, fontWeight:600 }}>Asr in {countdown}</span>
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
              <div style={{ fontSize:10, letterSpacing:"0.18em", color:C.textDim, marginBottom:14 }}>DAILY AYAH</div>
              <div style={{ fontSize:24, textAlign:"right", lineHeight:1.9, marginBottom:16, color:C.text, fontFamily:"Georgia,serif", direction:"rtl" }}>إِنَّ مَعَ الْعُسْرِ يُسْرًا</div>
              <div style={{ fontSize:14, color:C.textMid, fontStyle:"italic", marginBottom:8, lineHeight:1.7 }}>"For indeed, with hardship [will be] ease."</div>
              <div style={{ fontSize:12, color:C.textDim, marginBottom:16 }}>Surah Ash-Sharh · Ayah 6</div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={() => smoothSpeak("For indeed, with hardship will be ease. Surah Ash-Sharh, Ayah 6.")} style={{ background:C.surface2, border:`1px solid ${C.border}`, borderRadius:8, padding:"7px 16px", fontSize:12, color:C.textMid, cursor:"pointer" }}>🔊 Listen</button>
                <button style={{ background:C.surface2, border:`1px solid ${C.border}`, borderRadius:8, padding:"7px 16px", fontSize:12, color:C.textMid, cursor:"pointer" }}>↗ Share</button>
              </div>
            </div>
            <div className="mini-2c" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:18 }}>
                <div style={{ fontSize:10, letterSpacing:"0.18em", color:C.textDim, marginBottom:10 }}>DAILY HADITH</div>
                <div style={{ fontSize:13, color:C.textMid, fontStyle:"italic", lineHeight:1.7, marginBottom:10 }}>"{HADITHS[0].text}"</div>
                <div style={{ fontSize:11, color:C.textDim }}>{HADITHS[0].ref}</div>
              </div>
              <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:18, display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                <div style={{ fontSize:10, letterSpacing:"0.18em", color:C.textDim }}>QUICK TASBIH</div>
                <div className="pulse-a" style={{ fontSize:46, fontWeight:900, lineHeight:1, color:C.text }}>{tasbih}</div>
                <div style={{ fontSize:10, letterSpacing:"0.15em", color:C.textDim }}>SUBHAN ALLAH</div>
                <button onClick={() => setTasbih(c => c+1)} style={{ background:"linear-gradient(135deg,#2A5A4A,#1A3A2A)", border:`1px solid ${C.teal}`, color:C.text, borderRadius:10, padding:"10px 0", width:"100%", cursor:"pointer", fontSize:13, fontWeight:700, marginTop:4 }}>📿 TAP</button>
                <button onClick={() => setTasbih(0)} style={{ background:"none", border:"none", color:C.textDim, fontSize:10, cursor:"pointer" }}>RESET</button>
              </div>
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:18 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14, fontSize:14, fontWeight:600, color:C.text }}><span>📰 Islamic News</span><span onClick={goNews} style={{ fontSize:12, color:C.textDim, cursor:"pointer" }}>View All</span></div>
              {NEWS.slice(0,3).map((n,i) => (
                <div key={i} style={{ display:"flex", gap:12, paddingBottom:10, borderBottom: i<2?`1px solid ${C.border}`:"none", marginBottom: i<2?10:0 }}>
                  <div style={{ width:44, height:44, background:C.surface2, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{n.img}</div>
                  <div><div style={{ fontSize:12, lineHeight:1.5, color:C.text, marginBottom:3 }}>{n.title}</div><div style={{ fontSize:10, color:C.textDim }}>{n.cat} · {n.ago}</div></div>
                </div>
              ))}
            </div>
            <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:16 }}>
              <div style={{ fontSize:11, color:C.textDim, letterSpacing:"0.12em", marginBottom:12 }}>QUICK LISTEN</div>
              {[{n:1,name:"Al-Fatihah"},{n:36,name:"Ya-Sin"},{n:67,name:"Al-Mulk"}].map(s => (
                <div key={s.n} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:`1px solid ${C.border}` }}>
                  <span style={{ fontSize:13, color:C.text }}>{s.name}</span>
                  <AudioBar n={s.n} audio={audio} C={C} />
                </div>
              ))}
            </div>
            <div style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:18, display:"flex", gap:12 }}>
              <div style={{ fontSize:26 }}>🧭</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:600, color:C.text, marginBottom:4 }}>Qibla Finder</div>
                <div style={{ fontSize:12, color:C.textMid, marginBottom:10 }}>From Dhaka to Makkah: ~290°</div>
                <button style={{ background:C.surface2, border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 16px", color:C.text, fontSize:13, cursor:"pointer", width:"100%" }}>Open Compass</button>
              </div>
            </div>
          </div>
        </div>

        {/* Articles */}
        <div className="fu4">
          <div style={{ fontSize:17, fontWeight:700, color:C.text, marginBottom:14 }}>Recommended Articles</div>
          <div className="art-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            {ARTICLES.map((a,i) => (
              <div key={i} style={{ background:C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:16, display:"flex", gap:14, cursor:"pointer" }}>
                <div style={{ width:70, height:62, background:"linear-gradient(135deg,#2A3D35,#1A2B25)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:900, color:C.gold, flexShrink:0 }}>{a.num}</div>
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

const SOCIALS = [
  { href:"https://facebook.com/shahibhasan0",  icon:<FbIcon />,  label:"Facebook",  handle:"@shahibhasan0"  },
  { href:"https://instagram.com/shahibhasan_", icon:<IgIcon />,  label:"Instagram", handle:"@shahibhasan_"  },
  { href:"https://dribbble.com/shnitu",         icon:<DbkIcon />, label:"Dribbble",  handle:"shnitu"        },
];

// ─── Mobile Bottom Nav items ──────────────────────────────────────────────────
const MOB_NAV: { id: Page; icon: string; label: string }[] = [
  { id:"Prayer",   icon:"🕌", label:"Prayer"  },
  { id:"Quran",    icon:"📖", label:"Quran"   },
  { id:"Tasbih",   icon:"📿", label:"Tasbih"  },
  { id:"Mosque",   icon:"🗺️", label:"Mosque"  },
  { id:"Database", icon:"🗄️", label:"Data"    },
];

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const [page,         setPage]         = useState<Page>("Prayer");
  const [search,       setSearch]       = useState("");
  const [dark,         setDark]         = useState(true);
  const [showProfile,  setShowProfile]  = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [toast,        setToast]        = useState("");
  const [profile,      setProfile]      = useState<UserProfile>(DEFAULT_PROFILE);
  const [stats]                         = useState<UserStats>(DEFAULT_STATS);
  const [logs]                          = useState<ActivityLog[]>(SAMPLE_LOGS);
  const [mobMenu,      setMobMenu]      = useState(false);
  const audio = useAudio();

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2400); };
  const handleSetProfile = (p: UserProfile) => { setProfile(p); showToast("✓ Profile updated!"); };

  const C = dark ? themes.dark : themes.light;
  const ALL_PAGES: Page[] = ["Prayer","Quran","Hadith","Tasbih","Mosque","News","Database"];

  const CurrentPage = () => {
    switch (page) {
      case "Prayer":   return <HomePage   C={C} audio={audio} goNews={() => setPage("News")} profile={profile} />;
      case "Quran":    return <QuranPage  C={C} audio={audio} />;
      case "Hadith":   return <HadithPage C={C} />;
      case "Tasbih":   return <TasbihPage C={C} />;
      case "Mosque":   return <MosquePage C={C} />;
      case "News":     return <NewsPage   C={C} />;
      case "Database": return <DatabasePage C={C} profile={profile} stats={stats} logs={logs} />;
    }
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <FallingStars starColor={C.starColor} />

      <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Segoe UI','Helvetica Neue',sans-serif", display:"flex", flexDirection:"column", transition:"background .3s,color .3s", position:"relative", zIndex:1 }}>

        {/* ════ NAVBAR ════ */}
        <nav style={{ background:C.navBg, borderBottom:`1px solid ${C.border}`, position:"sticky", top:0, zIndex:200, backdropFilter:"blur(16px)", boxShadow:`0 2px 20px ${C.shadow}` }}>
          <div style={{ maxWidth:1280, margin:"0 auto", padding:"0 18px", height:58, display:"flex", alignItems:"center", gap:8 }}>

            {/* Logo */}
            <div onClick={() => setPage("Prayer")} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", marginRight:10, userSelect:"none", flexShrink:0 }}>
              <span className="float-a" style={{ fontSize:22 }}>🕌</span>
              <span style={{ fontSize:20, fontWeight:800, color:C.gold, fontFamily:"Georgia,serif", letterSpacing:"0.05em" }}>Waqt</span>
            </div>

            {/* Desktop nav */}
            <div className="desk-nav" style={{ alignItems:"center", gap:2, flex:1 }}>
              {ALL_PAGES.map(item => (
                <button key={item} onClick={() => setPage(item)}
                  style={{ background:"none", border:"none", color: page===item?C.text:C.textMid, fontSize:13, fontWeight: page===item?700:500, cursor:"pointer", padding:"0 10px", height:58, position:"relative", transition:"color .2s", whiteSpace:"nowrap" }}>
                  {item}
                  {page===item && <div style={{ position:"absolute", bottom:0, left:"50%", transform:"translateX(-50%)", width:"55%", height:2.5, background:`linear-gradient(90deg,${C.teal},${C.gold})`, borderRadius:"2px 2px 0 0" }} />}
                </button>
              ))}
            </div>

            {/* Right side */}
            <div style={{ display:"flex", alignItems:"center", gap:8, marginLeft:"auto" }}>
              <div className="searchbar" style={{ alignItems:"center", background:C.surface2, border:`1px solid ${C.border}`, borderRadius:10, padding:"6px 12px", gap:6 }}>
                <span style={{ fontSize:11, opacity:.45 }}>🔍</span>
                <input style={{ background:"none", border:"none", outline:"none", color:C.text, fontSize:13, width:110 }} placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <button onClick={() => setDark(d => !d)} style={{ background:C.surface2, border:`1px solid ${C.border}`, borderRadius:10, width:38, height:38, fontSize:15, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{dark?"☀️":"🌙"}</button>
              <button onClick={() => setShowSettings(true)} className="hide-sm" style={{ background:C.surface2, border:`1px solid ${C.border}`, borderRadius:10, width:38, height:38, fontSize:15, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>⚙️</button>
              {/* Nav avatar — shows uploaded photo */}
              <button onClick={() => setShowProfile(true)} style={{ background:"none", border:"none", cursor:"pointer", padding:0 }} className="glow-a">
                <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#C9A84C,#8B6914)", border:`2px solid ${C.gold}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, overflow:"hidden" }}>
                  {profile.avatar ? <img src={profile.avatar} alt="av" style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : "👤"}
                </div>
              </button>
              {/* Hamburger */}
              <button onClick={() => setMobMenu(o => !o)} style={{ display:"none", background:"none", border:"none", cursor:"pointer", fontSize:20, color:C.text, padding:4 }} className="show-sm">☰</button>
            </div>
          </div>

          {/* Mobile dropdown */}
          {mobMenu && (
            <div style={{ background:C.navBg, borderBottom:`1px solid ${C.border}` }}>
              {ALL_PAGES.map(item => (
                <button key={item} onClick={() => { setPage(item); setMobMenu(false); }}
                  style={{ display:"block", width:"100%", textAlign:"left", background: page===item?C.surface2:"none", border:"none", color: page===item?C.gold:C.textMid, fontSize:14, fontWeight: page===item?700:400, cursor:"pointer", padding:"12px 20px" }}>
                  {item}
                </button>
              ))}
              <div style={{ height:1, background:C.border }} />
              <button onClick={() => { setShowSettings(true); setMobMenu(false); }} style={{ display:"block", width:"100%", textAlign:"left", background:"none", border:"none", color:C.textMid, fontSize:14, cursor:"pointer", padding:"12px 20px" }}>⚙️ Settings</button>
            </div>
          )}
        </nav>

        {/* ════ MAIN ════ */}
        <main style={{ flex:1, padding:"28px 0 110px" }}>
          <div style={{ maxWidth:1280, margin:"0 auto", padding:"0 18px" }}>
            <CurrentPage />
          </div>
        </main>

        {/* ════ FOOTER ════ */}
        <footer style={{ background:C.surface, borderTop:`1px solid ${C.border}`, padding:"32px 18px 24px" }}>
          <div style={{ maxWidth:1280, margin:"0 auto" }}>
            <div className="foot-top" style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24, flexWrap:"wrap", gap:24 }}>
              {/* Brand */}
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                  <span style={{ fontSize:20 }}>🕌</span>
                  <span style={{ fontWeight:800, color:C.gold, fontSize:17, fontFamily:"Georgia,serif" }}>Waqt</span>
                </div>
                <div style={{ fontSize:12, color:C.textDim, maxWidth:200, lineHeight:1.65, marginBottom:10 }}>Built for the Modern Ummah. Helping Muslims stay connected to their faith every day.</div>
                <div style={{ fontSize:12, color:C.textMid }}>✨ Developed by <strong style={{ color:C.gold }}>SHAHIB H</strong></div>
              </div>

              {/* Links */}
              <div className="foot-links" style={{ display:"flex", gap:36 }}>
                <div>
                  <div style={{ fontSize:10, color:C.textDim, letterSpacing:"0.1em", marginBottom:10 }}>PRODUCT</div>
                  {["Terms","Privacy","Contact","Help Center"].map(l => <div key={l} style={{ fontSize:13, color:C.textMid, cursor:"pointer", marginBottom:6 }}>{l}</div>)}
                </div>
                <div>
                  <div style={{ fontSize:10, color:C.textDim, letterSpacing:"0.1em", marginBottom:10 }}>FEATURES</div>
                  {["Prayer Times","Quran Audio","Tasbih","Mosque Finder"].map(l => <div key={l} style={{ fontSize:13, color:C.textMid, cursor:"pointer", marginBottom:6 }}>{l}</div>)}
                </div>
              </div>

              {/* Socials */}
              <div>
                <div style={{ fontSize:10, color:C.textDim, letterSpacing:"0.1em", marginBottom:12 }}>CONNECT WITH SHAHIB</div>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {SOCIALS.map(s => (
                    <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                      style={{ display:"flex", alignItems:"center", gap:10, color:C.textMid, textDecoration:"none", fontSize:13, padding:"8px 12px", borderRadius:10, border:`1px solid ${C.border}`, background:C.surface2, transition:"all .2s", minWidth:185 }}
                      onMouseEnter={e => { const el=e.currentTarget as HTMLElement; el.style.borderColor=C.gold; el.style.color=C.gold; el.style.background=C.surface; }}
                      onMouseLeave={e => { const el=e.currentTarget as HTMLElement; el.style.borderColor=C.border; el.style.color=C.textMid; el.style.background=C.surface2; }}>
                      <span>{s.icon}</span>
                      <span style={{ fontWeight:600 }}>{s.label}</span>
                      <span style={{ fontSize:11, opacity:.65, marginLeft:2 }}>{s.handle}</span>
                      <span style={{ marginLeft:"auto", fontSize:11, opacity:.45 }}>↗</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ height:1, background:C.border, marginBottom:16 }} />
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
              <div style={{ fontSize:11, color:C.textDim, letterSpacing:"0.06em" }}>
                © 2026 WAQT · DEVELOPED BY <strong style={{ color:C.gold }}>SHAHIB H</strong> · BUILT FOR THE MODERN UMMAH
              </div>
              <div style={{ display:"flex", gap:12 }}>
                {SOCIALS.map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                    style={{ color:C.textDim, display:"flex", alignItems:"center", transition:"color .2s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color=C.gold}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color=C.textDim}>
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </footer>

        {/* ════ MOBILE BOTTOM NAV ════ */}
        <nav style={{ display:"none", position:"fixed", bottom:0, left:0, right:0, zIndex:150, background:C.navBg, borderTop:`1px solid ${C.border}`, backdropFilter:"blur(16px)" }} className="mob-nav">
          <div style={{ display:"flex", width:"100%" }}>
            {MOB_NAV.map(item => (
              <button key={item.id} onClick={() => setPage(item.id)}
                style={{ flex:1, background:"none", border:"none", cursor:"pointer", padding:"10px 4px 8px", display:"flex", flexDirection:"column", alignItems:"center", gap:3, position:"relative" }}>
                <span style={{ fontSize:20 }}>{item.icon}</span>
                <span style={{ fontSize:10, color: page===item.id?C.gold:C.textDim, fontWeight: page===item.id?700:400 }}>{item.label}</span>
                {page===item.id && <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:22, height:2.5, background:C.gold, borderRadius:"0 0 4px 4px" }} />}
              </button>
            ))}
          </div>
        </nav>

        {/* ════ MODALS ════ */}
        {showProfile  && <ProfileModal onClose={() => setShowProfile(false)}  C={C} profile={profile} setProfile={handleSetProfile} stats={stats} />}
        {showSettings && <SettingsModal onClose={() => setShowSettings(false)} dark={dark} setDark={setDark} C={C} />}
        {toast && <Toast msg={toast} />}
      </div>
    </>
  );
}