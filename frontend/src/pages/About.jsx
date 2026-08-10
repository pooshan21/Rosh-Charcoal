import { Link } from "react-router-dom";
import Marquee from "react-fast-marquee";
import { ArrowRight, Instagram } from "lucide-react";
import { CONTACT } from "../lib/api";
import { Reveal } from "../components/Reveal";

const process = [
  ["Reference", "It begins with a photograph that carries meaning — a glance, a moment, a person."],
  ["Composition", "I decide how the figure sits on the paper, where the light falls, what to leave as breath."],
  ["First layers", "Soft charcoal establishes the largest shapes and the darkest darks. Nothing precious yet."],
  ["Detailing", "Slowly, the face arrives — the eyes, the small asymmetries that make a person themselves."],
  ["Presentation", "Fixed, protected, and prepared to become a keepsake that will outlast us all."],
];

export default function About() {
  return (
    <div className="pt-[84px]">
      <section className="px-6 md:px-10 max-w-[1300px] mx-auto pt-20 pb-24 grid md:grid-cols-2 gap-16 items-center">
        <Reveal>
          <p className="label">The Artist</p>
          <h1 className="font-serif font-light text-5xl md:text-7xl mt-4 leading-[1.0]">Rosh Charcoal</h1>
          <p className="mt-8 text-[#4a4a46] leading-relaxed">I work in charcoal and graphite because they are honest materials. They smudge, they resist, they record the pressure of the hand. There is nowhere to hide — only tone and the grain of the paper.</p>
          <p className="mt-4 text-[#4a4a46] leading-relaxed">Portraiture, for me, is a form of attention. To draw someone is to look at them for a very long time, until likeness gives way to presence. I'm less interested in copying a face than in preserving the feeling of being in a room with it.</p>
          <p className="mt-4 text-[#4a4a46] leading-relaxed">Every commission is a small act of remembering — for a family, a milestone, a person who mattered. I take that quietly, seriously.</p>
        </Reveal>
        <Reveal delay={0.12}>
          <img src="https://images.unsplash.com/photo-1589637458063-7b054f0c18ab?crop=entropy&cs=srgb&fm=jpg&q=90&w=1100" alt="Rosh Charcoal's hand drawing with charcoal" className="w-full h-[600px] object-cover" />
        </Reveal>
      </section>

      <section className="py-6 border-y border-[#e2ded5] overflow-hidden">
        <Marquee speed={34} gradient={false}>
          <span className="font-serif italic text-4xl md:text-6xl text-[#c9c5bc] mx-10">From reference to remembrance</span>
          <span className="font-serif italic text-4xl md:text-6xl text-[#c9c5bc] mx-10">·</span>
          <span className="font-serif italic text-4xl md:text-6xl text-[#c9c5bc] mx-10">The making of a portrait</span>
          <span className="font-serif italic text-4xl md:text-6xl text-[#c9c5bc] mx-10">·</span>
        </Marquee>
      </section>

      <section className="px-6 md:px-10 py-24 max-w-[1100px] mx-auto">
        <Reveal><p className="label">The Process</p><h2 className="font-serif font-light text-4xl md:text-5xl mt-3 mb-14">The making of a portrait</h2></Reveal>
        {process.map((p, i) => (
          <Reveal key={i} delay={i * 0.05}>
            <div className="grid md:grid-cols-[auto_1fr_1.6fr] gap-4 md:gap-12 py-8 border-t border-[#e2ded5]">
              <span className="font-mono-label text-[#A38A5C]">0{i + 1}</span>
              <h3 className="font-serif text-2xl md:text-3xl">{p[0]}</h3>
              <p className="text-[#4a4a46] leading-relaxed">{p[1]}</p>
            </div>
          </Reveal>
        ))}
      </section>

      <section className="bg-[#171614] text-[#F6F3EE] px-6 md:px-10 py-28 text-center">
        <Reveal>
          <h2 className="font-serif font-light text-4xl md:text-5xl max-w-2xl mx-auto">Explore the work, or begin your own</h2>
          <div className="mt-10 flex flex-wrap gap-6 justify-center items-center">
            <Link to="/gallery" className="btn-charcoal inverse">View the Gallery <ArrowRight size={16} /></Link>
            <Link to="/commissions" className="link-underline text-sm text-[#cfccc4]">Commission a Portrait</Link>
            <Link to="/journal" className="link-underline text-sm text-[#cfccc4]">Read the Journal</Link>
            <a href={CONTACT.instagram} target="_blank" rel="noreferrer" className="link-underline text-sm text-[#cfccc4] inline-flex items-center gap-2"><Instagram size={15} /> Instagram</a>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
