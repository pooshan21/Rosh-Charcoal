import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { client } from "../lib/api";
import { Reveal } from "../components/Reveal";

const CATS = ["All", "Behind the Artwork", "Charcoal Techniques", "Commission Stories", "Studio Notes", "Portrait Care", "Artist Journey"];
const fmt = (d) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default function Journal() {
  const [posts, setPosts] = useState([]);
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    client.get("/journal", { params: { category: cat === "All" ? undefined : cat, q: q || undefined } })
      .then((r) => setPosts(r.data)).catch(() => setPosts([])).finally(() => setLoaded(true));
  }, [cat, q]);

  const [featured, ...rest] = posts;

  return (
    <div className="pt-[84px]">
      <section className="px-6 md:px-10 max-w-[1500px] mx-auto pt-20 pb-12">
        <Reveal>
          <div className="flex items-end justify-between flex-wrap gap-6">
            <div>
              <p className="label">The Journal</p>
              <h1 className="font-serif font-light text-5xl md:text-7xl mt-4">Notes from the studio</h1>
            </div>
            <Link to="/gallery" className="link-underline text-sm">← Back to Portfolio</Link>
          </div>
        </Reveal>
        <div className="mt-12 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {CATS.map((c) => (
              <button key={c} onClick={() => setCat(c)} data-testid={`cat-${c.toLowerCase().replace(/ /g, "-")}`}
                className={`text-sm link-underline ${cat === c ? "opacity-100" : "opacity-55 hover:opacity-100"}`}>{c}</button>
            ))}
          </div>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search articles" className="paper-input max-w-[220px]" data-testid="journal-search" />
        </div>
      </section>

      {loaded && posts.length === 0 ? (
        <section className="px-6 py-32 text-center">
          <h2 className="font-serif font-light text-4xl">Journal coming soon</h2>
          <p className="text-[#73736E] mt-4">New writing is on its way. In the meantime, explore the gallery.</p>
          <Link to="/gallery" className="btn-charcoal mt-8">View the Gallery</Link>
        </section>
      ) : (
        <>
          {featured && (
            <section className="px-6 md:px-10 max-w-[1500px] mx-auto pb-16">
              <Reveal>
                <Link to={`/journal/${featured.slug}`} className="group grid md:grid-cols-2 gap-10 items-center border-t border-[#e2ded5] pt-12">
                  <div className="overflow-hidden bg-[#EAE7E1]">
                    <img src={featured.cover} alt={featured.title} className="w-full h-[420px] object-cover transition-transform duration-[1.2s] group-hover:scale-105" />
                  </div>
                  <div>
                    <p className="label">{featured.category} · Featured</p>
                    <h2 className="font-serif font-light text-4xl md:text-5xl mt-4 leading-tight">{featured.title}</h2>
                    <p className="mt-5 text-[#4a4a46] leading-relaxed">{featured.excerpt}</p>
                    <p className="mt-5 text-xs font-mono-label text-[#a8a599]">{fmt(featured.date)} · {featured.reading_time} min read</p>
                  </div>
                </Link>
              </Reveal>
            </section>
          )}
          <section className="px-6 md:px-10 max-w-[1500px] mx-auto pb-28 grid md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
            {rest.map((p, i) => (
              <Reveal key={p.slug} delay={(i % 3) * 0.06}>
                <Link to={`/journal/${p.slug}`} className="group block">
                  <div className="overflow-hidden bg-[#EAE7E1]"><img src={p.cover} alt={p.title} loading="lazy" className="w-full h-64 object-cover transition-transform duration-[1.2s] group-hover:scale-105" /></div>
                  <p className="label mt-5">{p.category}</p>
                  <h3 className="font-serif text-2xl mt-2 leading-tight">{p.title}</h3>
                  <p className="text-[#73736E] text-sm mt-2 line-clamp-2">{p.excerpt}</p>
                  <p className="text-xs font-mono-label text-[#a8a599] mt-3">{fmt(p.date)} · {p.reading_time} min read</p>
                </Link>
              </Reveal>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
