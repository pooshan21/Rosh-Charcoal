import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause } from "lucide-react";

// A muted, cinematic process sequence — charcoal being laid down, stroke by stroke.
// Reliable, dependency-free "film" moment: slow Ken-Burns cross-fades with grain + timecode.
const frames = [
  { src: "https://images.unsplash.com/photo-1589637458063-7b054f0c18ab?crop=entropy&cs=srgb&fm=jpg&q=90&w=1600", cap: "First marks" },
  { src: "https://images.unsplash.com/photo-1611414779790-abb3e1ec462e?crop=entropy&cs=srgb&fm=jpg&q=90&w=1600", cap: "Building the form" },
  { src: "https://images.unsplash.com/photo-1674643925879-d457c6e93801?crop=entropy&cs=srgb&fm=jpg&q=90&w=1600", cap: "Layering tone" },
  { src: "https://images.pexels.com/photos/7608653/pexels-photo-7608653.jpeg?auto=compress&cs=tinysrgb&w=1600", cap: "Final detailing" },
];

export default function StudioFilm() {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const timer = useRef(null);

  useEffect(() => {
    if (!playing) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    timer.current = setInterval(() => setI((p) => (p + 1) % frames.length), 3800);
    return () => clearInterval(timer.current);
  }, [playing]);

  return (
    <section className="bg-[#171614] text-[#F6F3EE] px-6 md:px-12 py-24 md:py-32" data-testid="studio-film">
      <div className="max-w-[1300px] mx-auto">
        <p className="label !text-[#C8B58C]">Studio Film</p>
        <h2 className="font-serif font-light text-4xl md:text-5xl mt-4 mb-12">Stroke by stroke</h2>
        <div className="relative aspect-video overflow-hidden bg-[#0f0e0d] group">
          <AnimatePresence mode="sync">
            <motion.img
              key={i}
              src={frames[i].src}
              alt={frames[i].cap}
              initial={{ opacity: 0, scale: 1.12 }}
              animate={{ opacity: 1, scale: 1.0 }}
              exit={{ opacity: 0 }}
              transition={{ opacity: { duration: 1.3, ease: "easeInOut" }, scale: { duration: 4.2, ease: "linear" } }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>
          {/* film grain + vignette */}
          <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 0 140px 40px rgba(0,0,0,0.55)" }} />
          <div className="absolute inset-0 pointer-events-none opacity-[0.12]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />

          {/* top bar: timecode + rec */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between font-mono-label !text-[0.6rem] !text-[#F6F3EE]/70">
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#C8B58C] animate-pulse" /> Rec · Studio</span>
            <span>00:0{i}:{(i * 38) % 60 < 10 ? "0" : ""}{(i * 38) % 60}</span>
          </div>

          {/* caption + control */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <span className="font-serif italic text-2xl md:text-3xl drop-shadow">{frames[i].cap}</span>
            <button onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause" : "Play"} data-testid="film-toggle"
              className="w-11 h-11 rounded-full border border-[#F6F3EE]/50 flex items-center justify-center backdrop-blur-sm hover:bg-[#F6F3EE] hover:text-[#171614] transition-colors">
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>
          </div>

          {/* progress ticks */}
          <div className="absolute bottom-0 left-0 right-0 flex gap-1 px-4 pb-2">
            {frames.map((_, k) => (
              <button key={k} onClick={() => setI(k)} aria-label={`Frame ${k + 1}`} className={`h-[3px] flex-1 transition-colors ${k === i ? "bg-[#C8B58C]" : "bg-[#F6F3EE]/25"}`} />
            ))}
          </div>
        </div>
        <p className="mt-6 text-[#a8a396] text-sm max-w-xl leading-relaxed">A quiet look at how a portrait comes to life — from the first faint marks to the final, deliberate details.</p>
      </div>
    </section>
  );
}
