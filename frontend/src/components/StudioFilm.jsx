import { useState, useEffect } from "react";
import { Play } from "lucide-react";

// Real muted, looping charcoal process clip (MP4/H.264), click-to-play with poster.
const POSTER = "https://images.unsplash.com/photo-1589637458063-7b054f0c18ab?crop=entropy&cs=srgb&fm=jpg&q=90&w=1600";

export default function StudioFilm() {
  const [playing, setPlaying] = useState(false);
  const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => { if (!reduce) setPlaying(true); }, [reduce]);

  return (
    <section className="bg-[#171614] text-[#F6F3EE] px-6 md:px-12 py-24 md:py-32" data-testid="studio-film">
      <div className="max-w-[1300px] mx-auto">
        <p className="label !text-[#C8B58C]">Studio Film</p>
        <h2 className="font-serif font-light text-4xl md:text-5xl mt-4 mb-12">Stroke by stroke</h2>
        <div className="relative aspect-video overflow-hidden bg-[#0f0e0d] group">
          {playing ? (
            <video
              data-testid="studio-video"
              className="absolute inset-0 w-full h-full object-cover"
              src="/studio-process.mp4"
              autoPlay muted loop playsInline preload="metadata" poster={POSTER}
            />
          ) : (
            <button onClick={() => setPlaying(true)} aria-label="Play studio film" className="absolute inset-0 w-full h-full">
              <img src={POSTER} alt="Charcoal portrait in progress" className="absolute inset-0 w-full h-full object-cover" />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="w-16 h-16 rounded-full border border-[#F6F3EE]/70 flex items-center justify-center backdrop-blur-sm group-hover:bg-[#F6F3EE] group-hover:text-[#171614] transition-colors"><Play size={22} /></span>
              </span>
            </button>
          )}
          <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 0 140px 40px rgba(0,0,0,0.45)" }} />
          <div className="absolute inset-0 pointer-events-none opacity-[0.1]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
          <div className="absolute top-4 left-4 flex items-center gap-2 font-mono-label !text-[0.6rem] !text-[#F6F3EE]/70">
            <span className="w-2 h-2 rounded-full bg-[#C8B58C] animate-pulse" /> Studio Process
          </div>
        </div>
        <p className="mt-6 text-[#a8a396] text-sm max-w-xl leading-relaxed">
          Studio Process — a portrait in charcoal, 2026. A quiet look at how a piece comes to life, from the first faint marks to the final details.
        </p>
      </div>
    </section>
  );
}
