import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { rupee } from "../lib/api";
import { Reveal } from "../components/Reveal";

const editions = [
  { title: "Study Print — A5", size: "15 × 21 cm", edition: "Open edition", paper: "310gsm cotton rag, giclée", price: 1800, image: "https://images.pexels.com/photos/7608653/pexels-photo-7608653.jpeg?auto=compress&cs=tinysrgb&w=1000" },
  { title: "Portrait Print — A4", size: "21 × 29 cm", edition: "Limited to 50", paper: "310gsm cotton rag, giclée", price: 3200, image: "https://images.unsplash.com/photo-1593472807861-5bb884af28f6?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000" },
  { title: "Statement Print — A3", size: "30 × 42 cm", edition: "Limited to 25", paper: "Hahnemühle museum etching", price: 5400, image: "https://images.unsplash.com/photo-1612641605722-60c66c66530c?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000" },
  { title: "Collector Print — A2", size: "42 × 59 cm", edition: "Limited to 15, signed", paper: "Hahnemühle museum etching", price: 8900, image: "https://images.unsplash.com/photo-1748200099986-5ed2ca9ae4a6?crop=entropy&cs=srgb&fm=jpg&q=85&w=1000" },
];

const notes = [
  ["Editioned & numbered", "Each limited print is numbered and comes with a signed certificate. Open editions stay available so a favourite piece is never out of reach."],
  ["Archival quality", "Printed with pigment inks on cotton-rag and museum-etching papers rated to last a century without fading."],
  ["Ships worldwide", "Rolled in protective tubes or flat-packed for larger sizes, dispatched with tracked, insured delivery."],
];

export default function Prints() {
  return (
    <div className="pt-[84px]">
      <section className="px-6 md:px-12 max-w-[1400px] mx-auto pt-24 pb-16">
        <Reveal>
          <p className="label">Fine-Art Prints</p>
          <h1 className="font-serif font-light text-5xl md:text-7xl mt-5 leading-[1.02]">Bring the work home, approachably</h1>
          <p className="mt-8 text-[#4a4a46] max-w-2xl leading-relaxed text-lg">
            Prints are faithful, archival reproductions of Rosh Charcoal's drawings — editioned studies and portraits offered at accessible price points. A considered way to live with the work without commissioning an original.
          </p>
        </Reveal>
      </section>

      <section className="px-6 md:px-12 max-w-[1400px] mx-auto pb-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-16">
          {editions.map((e, i) => (
            <Reveal key={e.title} delay={(i % 4) * 0.06}>
              <div className="group">
                <div className="overflow-hidden bg-[#ECE8E1] aspect-[3/4]">
                  <img src={e.image} alt={e.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-[1.1s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]" />
                </div>
                <p className="label mt-6">{e.edition}</p>
                <h3 className="font-serif text-2xl mt-2">{e.title}</h3>
                <p className="text-[#74726B] text-sm mt-1">{e.size} · {e.paper}</p>
                <p className="font-serif text-xl mt-4">{rupee(e.price)}</p>
                <Link to={`/contact`} className="link-underline text-sm mt-3 inline-block">Enquire to order →</Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-[#ECE8E1] px-6 md:px-12 py-24">
        <div className="max-w-[1200px] mx-auto grid md:grid-cols-3 gap-14">
          {notes.map((n, i) => (
            <Reveal key={n[0]} delay={i * 0.08}>
              <span className="font-mono-label">0{i + 1}</span>
              <h3 className="font-serif text-2xl mt-4">{n[0]}</h3>
              <p className="text-[#4a4a46] mt-3 leading-relaxed">{n[1]}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-12 py-28 max-w-[1000px] mx-auto text-center">
        <Reveal>
          <p className="label">Looking for something singular?</p>
          <h2 className="font-serif font-light text-4xl md:text-5xl mt-5 leading-tight">Prints are editioned. Originals are one-of-a-kind.</h2>
          <p className="mt-6 text-[#4a4a46] max-w-xl mx-auto leading-relaxed">If you'd prefer a unique, hand-drawn piece that exists only once, explore the original artworks or commission your own portrait.</p>
          <div className="mt-10 flex flex-wrap gap-6 justify-center items-center">
            <Link to="/original-artworks" className="btn-charcoal">View Original Artworks <ArrowRight size={15} /></Link>
            <Link to="/commissions" className="link-underline text-sm">Commission a Portrait</Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
