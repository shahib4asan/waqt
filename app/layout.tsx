import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Waqt — Built for the Modern Ummah",
  description: "Prayer times, Quran audio, Hadith, Tasbih and more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: #0A0D14; }
          @keyframes fadeSlideUp  { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
          @keyframes fadeIn       { from{opacity:0} to{opacity:1} }
          @keyframes scaleIn      { from{opacity:0;transform:scale(.93)} to{opacity:1;transform:scale(1)} }
          @keyframes pulse        { 0%,100%{transform:scale(1);opacity:.85} 50%{transform:scale(1.07);opacity:1} }
          @keyframes glow         { 0%,100%{box-shadow:0 0 10px rgba(201,168,76,.25)} 50%{box-shadow:0 0 24px rgba(201,168,76,.65)} }
          @keyframes float        { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
          @keyframes dotBlink     { 0%,100%{opacity:1} 50%{opacity:.15} }
          @keyframes spin         { from{transform:rotate(0)} to{transform:rotate(360deg)} }
          .fsu  { animation:fadeSlideUp .5s ease both }
          .fsu1 { animation:fadeSlideUp .5s .08s ease both }
          .fsu2 { animation:fadeSlideUp .5s .16s ease both }
          .fsu3 { animation:fadeSlideUp .5s .24s ease both }
          .fsu4 { animation:fadeSlideUp .5s .32s ease both }
          .pulse-a { animation:pulse 2.6s ease-in-out infinite }
          .float-a { animation:float 3.2s ease-in-out infinite }
          .glow-a  { animation:glow  2.2s ease-in-out infinite }
          .spin-a  { animation:spin  1s linear infinite }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
