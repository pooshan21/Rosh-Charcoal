import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, Mail, ChevronLeft, ChevronRight } from "lucide-react";
import { client, CONTACT, waLink, rupee } from "../lib/api";
import { Reveal } from "../components/Reveal";
import ArtworkCard from "../components/ArtworkCard";
import NotFound from "./NotFound";

export default function ArtworkDetail() {
  const { slug } = useParams();
  const [data, setData] = useState(undefined);
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    setData(undefined); setActive(0);
    client.get(`/artworks/${slug}`).then((r) => setData(r.data)).catch(() => setData(null));
  }, [slug]);

  const art = data?.artwork;
  const images = art?.images?.length ? art.images : art ? [art.main_image] : [];

  const nav = useCallback((dir) => setActive((a) => (a + dir + images.length) % images.length), [images.length]);
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") nav(1);
      if (e.key === "ArrowLeft") nav(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, nav]);

  if (data === null) return <NotFound />;
  if (!art) return <div className="pt-[160px] px-10 pb-40 text-[#73736E]">Loading…</div>;

  const available = art.availability === "Available";
  const pageUrl = typeof window !== "undefined" ? window.location.href : "";
  const wa = waLink(`Hello Rosh, I'm interested in "${art.title}". ${pageUrl}`);

  return (
    <div className="pt-[84px]">
      <div className="px-6 md:px-10 max-w-[1500px] mx-auto pt-10">
        <nav className="text-xs text-[#73736E] font-mono-label">
          <Link to="/" className="link-underline">Home</Link> / <Link to="/gallery" className="link-underline">Gallery</Link> / <span className="text-[#171614]">{art.title}</span>
        </nav>
      </div>

      <section className="px-6 md:px-10 max-w-[1500px] mx-auto grid lg:grid-cols-[1.3fr_1fr] gap-14 pt-10 pb-28">
        <div>
          <Reveal>
            <button onClick={() => setLightbox(true)} className="block w-full bg-[#EAE7E1] cursor-zoom-in" data-testid="artwork-main-image">
              <img src={images[active]} alt={art.alt || art.title} className="w-full h-auto" />
            </button>
          </Reveal>
          {images.length > 1 && (
            <div className="flex gap-3 mt-4">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActive(i)} className={`w-20 h-20 overflow-hidden border ${active === i ? "border-[#171614]" : "border-transparent opacity-60"}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:pt-6">
          <Reveal>
            <p className="label">{art.category}</p>
            <h1 className="font-serif font-light text-4xl md:text-5xl mt-3">{art.title}</h1>
            <p className="text-[#73736E] mt-3">{art.medium} · {art.year}</p>

            <dl className="mt-9 space-y-3 text-sm border-t border-[#e2ded5] pt-7">
              {[["Medium", art.medium], ["Surface", art.surface], ["Dimensions", art.dimensions], ["Framing", art.framing], ["Availability", art.availability]].map(([k, v]) => v && (
                <div key={k} className="grid grid-cols-[130px_1fr] gap-4">
                  <dt className="text-[#a8a599] font-mono-label uppercase text-xs tracking-wider pt-0.5">{k}</dt>
                  <dd className="text-[#2b2b28]">{v}</dd>
                </div>
              ))}
              <div className="grid grid-cols-[130px_1fr] gap-4">
                <dt className="text-[#a8a599] font-mono-label uppercase text-xs tracking-wider pt-0.5">Price</dt>
                <dd className="text-[#2b2b28]">{art.price_visibility === "show" && art.price != null ? rupee(art.price) : art.price_visibility === "hide" ? "—" : "Price on request"}</dd>
              </div>
            </dl>

            {art.statement && <p className="mt-9 font-serif text-2xl italic leading-snug text-[#2b2b28]">"{art.statement}"</p>}

            <div className="mt-10 flex flex-col gap-3">
              {available ? (
                <a href={wa} target="_blank" rel="noreferrer" data-testid="enquire-cta" className="btn-charcoal justify-center"><MessageCircle size={16} /> Enquire About This Artwork</a>
              ) : (
                <Link to="/commissions" data-testid="similar-cta" className="btn-charcoal justify-center">Request a Similar Portrait</Link>
              )}
              <a href={`mailto:${CONTACT.email}?subject=${encodeURIComponent("Enquiry: " + art.title)}`} className="link-underline text-sm inline-flex items-center gap-2 justify-center"><Mail size={15} /> Enquire by email</a>
            </div>

            {data.related?.[0] && (
              <Link to={`/journal`} className="link-underline text-sm text-[#A38A5C] mt-8 inline-block">Read the story behind this work →</Link>
            )}
          </Reveal>
        </div>
      </section>

      {data.related?.length > 0 && (
        <section className="bg-[#EAE7E1] px-6 md:px-10 py-24">
          <div className="max-w-[1500px] mx-auto">
            <h2 className="font-serif font-light text-3xl md:text-4xl mb-12">More from the Gallery</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {data.related.map((a, i) => <ArtworkCard key={a.slug} art={a} index={i} />)}
            </div>
          </div>
        </section>
      )}

      <AnimatePresence>
        {lightbox && (
          <motion.div className="fixed inset-0 z-[300] bg-[#171614]/95 flex items-center justify-center p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" data-testid="lightbox">
            <button onClick={() => setLightbox(false)} aria-label="Close" className="absolute top-6 right-6 text-[#F6F3EE]"><X size={30} /></button>
            {images.length > 1 && <button onClick={() => nav(-1)} aria-label="Previous" className="absolute left-4 md:left-10 text-[#F6F3EE]"><ChevronLeft size={36} /></button>}
            <img src={images[active]} alt={art.alt} className="max-h-[88vh] max-w-full object-contain" />
            {images.length > 1 && <button onClick={() => nav(1)} aria-label="Next" className="absolute right-4 md:right-10 text-[#F6F3EE]"><ChevronRight size={36} /></button>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
