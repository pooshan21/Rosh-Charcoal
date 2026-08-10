import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import Marquee from "react-fast-marquee";
import { ArrowRight, ArrowUpRight, Instagram, MessageCircle } from "lucide-react";
import { client, CONTACT, waLink } from "../lib/api";
import { Reveal, LineReveal } from "../components/Reveal";
import ArtworkCard from "../components/ArtworkCard";

const chapters = [
  { n: "01", t: "Observation", d: "Every portrait begins with looking — really looking — until a face stops being a likeness and becomes a presence." },
  { n: "02", t: "Memory", d: "Charcoal remembers the pressure of the hand. It holds the softness of a moment the way memory does — imperfectly, tenderly." },
  { n: "03", t: "Emotion", d: "Grey is where feeling lives. Without colour to distract, what remains is the quiet weight of a person's inner world." },
];

export default function Home() {
  const [featured, setFeatured] = useState(null);
  const [works, setWorks] = useState([]);
  const [posts, setPosts] = useState([]);
  const [testi, setTesti] = useState([]);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 700], [0, 120]);

  useEffect(() => {
    client.get("/artworks").then((r) => {
      setWorks(r.data.slice(0, 8));
      setFeatured(r.data.find((a) => a.featured) || r.data[0]);
    }).catch(() => {});
    client.get("/journal").then((r) => setPosts(r.data.slice(0, 3))).catch(() => setPosts([]));
    client.get("/testimonials").then((r) => setTesti(r.data)).catch(() => {});
  }, []);

  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-screen bg-[#171614] text-[#F6F3EE] pt-[84px] overflow-hidden">
        <div className="max-w-[1500px] mx-auto px-6 md:px-10 grid lg:grid-cols-[1fr_0.9fr] gap-10 items-center min-h-[calc(100vh-84px)] py-12">
          <div className="order-2 lg:order-1">
            <motion.p className="label !text-[#a8a599]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              Charcoal & Graphite Portraits
            </motion.p>
            <h1 className="font-serif font-light text-5xl sm:text-6xl lg:text-7xl leading-[0.98] mt-6 tracking-tight">
              <LineReveal lines={["Stories,", "captured"]} delay={0.15} />
              <span className="reveal-line">
                <motion.span className="block italic text-[#a8a599]" initial={{ y: "110%" }} animate={{ y: "0%" }} transition={{ duration: 1.1, delay: 0.39, ease: [0.22, 1, 0.36, 1] }}>
                  in charcoal.
                </motion.span>
              </span>
            </h1>
            <motion.p className="mt-8 text-[#cfccc4] max-w-md leading-relaxed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
              Rosh Charcoal creates original portraits and custom commissioned charcoal artwork for collectors and clients worldwide.
            </motion.p>
            <motion.div className="mt-10 flex flex-wrap items-center gap-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }}>
              <Link to="/gallery" data-testid="hero-gallery-cta" className="btn-charcoal inverse">
                Explore the Gallery <ArrowRight size={16} />
              </Link>
              <Link to="/commissions" data-testid="hero-commission-cta" className="link-underline text-sm text-[#cfccc4]">
                Commission a Portrait
              </Link>
            </motion.div>
          </div>

          <motion.div className="order-1 lg:order-2 relative" style={{ y: heroY }}>
            <motion.div
              initial={{ clipPath: "inset(100% 0 0 0)" }}
              animate={{ clipPath: "inset(0% 0 0 0)" }}
              transition={{ duration: 1.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              {featured && (
                <>
                  <img src={featured.main_image} alt={featured.alt} className="w-full h-[62vh] lg:h-[80vh] object-cover" />
                  <Link to={`/artwork/${featured.slug}`} data-testid="hero-featured-link" className="absolute bottom-4 left-4 bg-[#171614]/60 backdrop-blur px-4 py-2 text-xs text-[#F6F3EE] link-underline">
                    Featured — {featured.title}, {featured.year}
                  </Link>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>
        <motion.div className="absolute bottom-6 left-1/2 -translate-x-1/2 label !text-[#6f6d64]" animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2.4 }}>
          Scroll
        </motion.div>
      </section>

      {/* SELECTED WORKS */}
      <section className="px-6 md:px-10 py-24 md:py-32">
        <div className="max-w-[1500px] mx-auto">
          <Reveal className="flex items-end justify-between mb-16 flex-wrap gap-4">
            <div>
              <p className="label">Selected Works</p>
              <h2 className="font-serif font-light text-4xl md:text-5xl mt-3">A curated wall</h2>
            </div>
            <Link to="/gallery" className="link-underline text-sm">View Full Gallery →</Link>
          </Reveal>
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 [column-fill:_balance]">
            {works.map((art, i) => (
              <Reveal key={art.slug} delay={(i % 3) * 0.08} className="mb-8 break-inside-avoid">
                <ArtworkCard art={art} index={i} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="py-8 border-y border-[#e2ded5] overflow-hidden">
        <Marquee speed={38} gradient={false}>
          {["Portraiture", "·", "Memory", "·", "Charcoal", "·", "Observation", "·", "Emotion", "·", "Graphite", "·"].map((w, i) => (
            <span key={i} className="font-serif italic text-4xl md:text-6xl text-[#c9c5bc] mx-8">{w}</span>
          ))}
        </Marquee>
      </section>

      {/* ARTIST INTRO */}
      <section className="px-6 md:px-10 py-24 md:py-32">
        <div className="max-w-[1300px] mx-auto grid md:grid-cols-2 gap-14 items-center">
          <Reveal>
            <img src="https://images.unsplash.com/photo-1611414779790-abb3e1ec462e?crop=entropy&cs=srgb&fm=jpg&q=90&w=1200" alt="Rosh Charcoal drawing a portrait in the studio" className="w-full h-[560px] object-cover" />
          </Reveal>
          <Reveal delay={0.1}>
            <p className="label">The Artist</p>
            <h2 className="font-serif font-light text-4xl md:text-5xl mt-4 leading-tight">Drawn from observation, held in memory</h2>
            <p className="mt-7 text-[#4a4a46] leading-relaxed">
              I work almost entirely in charcoal and graphite because they let me listen. There is no colour to hide behind — only tone, pressure, and the grain of the paper. My portraits are less about likeness and more about presence: the version of a person that photographs rarely catch.
            </p>
            <p className="mt-4 text-[#4a4a46] leading-relaxed">
              Each piece is hand-drawn, slowly, from a photograph that means something to you.
            </p>
            <Link to="/about" className="btn-charcoal mt-9">Meet the Artist <ArrowRight size={16} /></Link>
          </Reveal>
        </div>
      </section>

      {/* COMMISSION FEATURE */}
      <section className="bg-[#171614] text-[#F6F3EE] px-6 md:px-10 py-28 md:py-36">
        <div className="max-w-[1300px] mx-auto grid md:grid-cols-[1fr_1fr] gap-16 items-center">
          <Reveal>
            <p className="label !text-[#a8a599]">Commissions</p>
            <h2 className="font-serif font-light text-4xl md:text-6xl mt-4 leading-[1.02]">A portrait made for someone unforgettable</h2>
            <p className="mt-8 text-[#cfccc4] leading-relaxed max-w-lg">
              Share a reference photograph and receive a hand-drawn charcoal or graphite portrait — for keepsakes, gifts, milestones, memorials, weddings, and anniversaries. A meaningful object, not a transaction.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link to="/commissions" data-testid="home-start-commission" className="btn-charcoal inverse">Start a Commission <ArrowRight size={16} /></Link>
              <Link to="/pricing" className="link-underline text-sm text-[#cfccc4]">View Pricing</Link>
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <img src="https://images.unsplash.com/photo-1761726114786-eba9854b440d?crop=entropy&cs=srgb&fm=jpg&q=90&w=1000" alt="A framed charcoal portrait" className="w-full h-[520px] object-cover" />
          </Reveal>
        </div>
      </section>

      {/* MANIFESTO CHAPTERS */}
      <section className="px-6 md:px-10 py-24 md:py-32">
        <div className="max-w-[1300px] mx-auto">
          {chapters.map((c, i) => (
            <Reveal key={c.n} delay={i * 0.05}>
              <div className="grid md:grid-cols-[auto_1fr] gap-6 md:gap-16 py-10 border-t border-[#e2ded5]">
                <span className="font-mono-label text-[#A38A5C] text-sm">{c.n}</span>
                <div className="grid md:grid-cols-[1fr_1.4fr] gap-4 md:gap-16">
                  <h3 className="font-serif text-3xl md:text-4xl">{c.t}</h3>
                  <p className="text-[#4a4a46] leading-relaxed">{c.d}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      {testi.length > 0 && (
        <section className="bg-[#EAE7E1] px-6 md:px-10 py-24 md:py-32">
          <div className="max-w-[1300px] mx-auto">
            <Reveal><p className="label mb-14">In their words</p></Reveal>
            <div className="grid md:grid-cols-3 gap-12">
              {testi.slice(0, 3).map((t, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <blockquote className="font-serif text-2xl leading-snug italic text-[#2b2b28]">"{t.quote}"</blockquote>
                  <p className="mt-6 text-sm text-[#73736E]">{t.name}, {t.city} — {t.type}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* JOURNAL */}
      {posts.length > 0 && (
        <section className="px-6 md:px-10 py-24 md:py-32">
          <div className="max-w-[1500px] mx-auto">
            <Reveal className="flex items-end justify-between mb-14 flex-wrap gap-4">
              <div><p className="label">Journal</p><h2 className="font-serif font-light text-4xl md:text-5xl mt-3">Latest entries</h2></div>
              <Link to="/journal" className="link-underline text-sm">Read All Journal Entries →</Link>
            </Reveal>
            <div className="grid md:grid-cols-3 gap-10">
              {posts.map((p, i) => (
                <Reveal key={p.slug} delay={i * 0.08}>
                  <Link to={`/journal/${p.slug}`} className="group block">
                    <div className="overflow-hidden bg-[#EAE7E1]">
                      <img src={p.cover} alt={p.title} loading="lazy" className="w-full h-64 object-cover transition-transform duration-[1.2s] group-hover:scale-105" />
                    </div>
                    <p className="label mt-5">{p.category}</p>
                    <h3 className="font-serif text-2xl mt-2 leading-tight">{p.title}</h3>
                    <p className="text-[#73736E] text-sm mt-2 line-clamp-2">{p.excerpt}</p>
                    <p className="text-xs text-[#a8a599] mt-3 font-mono-label">{new Date(p.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} · {p.reading_time} min read</p>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* INSTAGRAM */}
      <section className="px-6 md:px-10 pb-24">
        <div className="max-w-[1500px] mx-auto">
          <Reveal className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <h2 className="font-serif font-light text-3xl md:text-4xl">From the studio</h2>
            <a href={CONTACT.instagram} target="_blank" rel="noreferrer" className="link-underline text-sm inline-flex items-center gap-2"><Instagram size={16} /> Follow Rosh Charcoal on Instagram</a>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {["photo-1748200099986-5ed2ca9ae4a6", "photo-1612641605722-60c66c66530c", "photo-1771257824559-0a4fc650d6cd", "photo-1674643925879-d457c6e93801"].map((id, i) => (
              <Reveal key={id} delay={i * 0.05}>
                <a href={CONTACT.instagram} target="_blank" rel="noreferrer" className="block overflow-hidden bg-[#EAE7E1] group relative">
                  <img src={`https://images.unsplash.com/${id}?crop=entropy&cs=srgb&fm=jpg&q=80&w=700`} alt="Instagram artwork" loading="lazy" className="w-full aspect-square object-cover transition-transform duration-700 group-hover:scale-105" />
                  <ArrowUpRight className="absolute top-3 right-3 text-[#F6F3EE] opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-[#171614] text-[#F6F3EE] px-6 md:px-10 py-32 md:py-44 text-center">
        <Reveal>
          <p className="label !text-[#a8a599]">Have a portrait in mind?</p>
          <h2 className="font-serif font-light text-5xl md:text-7xl mt-6 leading-[1.02] max-w-3xl mx-auto">Share a photograph. Begin a portrait.</h2>
          <p className="mt-8 text-[#cfccc4] max-w-lg mx-auto">Tell me about the person and the moment you'd like to hold onto. I'll take it from there.</p>
          <div className="mt-12 flex flex-wrap gap-6 justify-center items-center">
            <Link to="/commissions" className="btn-charcoal inverse">Request a Commission <ArrowRight size={16} /></Link>
            <Link to="/gallery" className="link-underline text-sm text-[#cfccc4]">Browse Artwork</Link>
            <a href={waLink("Hello Rosh, I'd like to commission a portrait.")} target="_blank" rel="noreferrer" className="link-underline text-sm text-[#cfccc4] inline-flex items-center gap-2"><MessageCircle size={16} /> WhatsApp</a>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
