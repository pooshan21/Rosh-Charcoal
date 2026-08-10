import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle } from "lucide-react";
import { client, rupee, waLink } from "../lib/api";
import { Reveal } from "../components/Reveal";

const statusStyle = {
  Available: "text-[#3d6b4a]", Sold: "text-[#8a4a3d]", Commissioned: "text-[#A38A5C]",
  "Private Collection": "text-[#A38A5C]", "Not for Sale": "text-[#74726B]",
};

export default function OriginalArtworks() {
  const [works, setWorks] = useState([]);
  useEffect(() => { client.get("/artworks").then((r) => setWorks(r.data)).catch(() => setWorks([])); }, []);

  return (
    <div className="pt-[84px]">
      <section className="px-6 md:px-12 max-w-[1400px] mx-auto pt-24 pb-16">
        <Reveal>
          <p className="label">Original Artworks</p>
          <h1 className="font-serif font-light text-5xl md:text-7xl mt-5 leading-[1.02]">One drawing. One owner. One story.</h1>
          <p className="mt-8 text-[#4a4a46] max-w-2xl leading-relaxed text-lg">
            Each original is a unique, hand-drawn work on fine paper — the actual charcoal and graphite laid down by the artist's hand. Larger, singular, and collected as an heirloom. When an original is acquired, it is gone; no second version is ever made.
          </p>
        </Reveal>
      </section>

      <section className="px-6 md:px-12 max-w-[1500px] mx-auto pb-28 space-y-24 md:space-y-32">
        {works.map((art, i) => (
          <Reveal key={art.slug} delay={0.04}>
            <article className={`grid md:grid-cols-2 gap-10 md:gap-16 items-center ${i % 2 ? "md:[direction:rtl]" : ""}`}>
              <Link to={`/artwork/${art.slug}`} className="group block [direction:ltr] overflow-hidden bg-[#ECE8E1]">
                <img src={art.main_image} alt={art.alt || art.title} loading="lazy" className="w-full h-auto object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]" />
              </Link>
              <div className="[direction:ltr]">
                <div className="flex items-center gap-4">
                  <span className="font-mono-label">{String(i + 1).padStart(2, "0")}</span>
                  <span className={`text-[0.7rem] uppercase tracking-[0.18em] ${statusStyle[art.availability] || "text-[#74726B]"}`}>{art.availability}</span>
                </div>
                <h2 className="font-serif font-light text-4xl md:text-5xl mt-4">{art.title}</h2>
                <p className="text-[#74726B] mt-2">{art.medium} · {art.year}</p>
                {art.statement && <p className="mt-6 font-serif text-2xl italic leading-snug text-[#2b2b28] max-w-lg">"{art.statement}"</p>}
                <dl className="mt-7 space-y-2 text-sm border-t border-[#e0dbd1] pt-6 max-w-md">
                  {[["Surface", art.surface], ["Dimensions", art.dimensions], ["Framing", art.framing]].map(([k, v]) => v && (
                    <div key={k} className="grid grid-cols-[120px_1fr] gap-4">
                      <dt className="font-mono-label !text-[0.65rem]">{k}</dt><dd className="text-[#2b2b28]">{v}</dd>
                    </div>
                  ))}
                </dl>
                <p className="font-serif text-2xl mt-6">
                  {art.price_visibility === "show" && art.price != null ? rupee(art.price) : art.price_visibility === "hide" ? "" : "Price on request"}
                </p>
                <div className="mt-7 flex flex-wrap gap-5 items-center">
                  {art.availability === "Available" ? (
                    <a href={waLink(`Hello Rosh, I'd like to acquire the original "${art.title}".`)} target="_blank" rel="noreferrer" className="btn-charcoal"><MessageCircle size={15} /> Acquire this original</a>
                  ) : (
                    <Link to="/commissions" className="btn-charcoal">Commission your own <ArrowRight size={15} /></Link>
                  )}
                  <Link to={`/artwork/${art.slug}`} className="link-underline text-sm">View details</Link>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </section>

      <section className="bg-[#171614] text-[#F6F3EE] px-6 md:px-12 py-28 text-center">
        <Reveal>
          <p className="label !text-[#C8B58C]">Prefer a piece of your own?</p>
          <h2 className="font-serif font-light text-4xl md:text-5xl mt-5 max-w-2xl mx-auto">Commission a one-of-a-kind portrait</h2>
          <div className="mt-10 flex flex-wrap gap-6 justify-center items-center">
            <Link to="/commissions" className="btn-charcoal inverse">Start a Commission <ArrowRight size={15} /></Link>
            <Link to="/prints" className="link-underline text-sm text-[#cfccc4]">Browse affordable prints</Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
