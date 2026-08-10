import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { client } from "../lib/api";
import { Reveal } from "../components/Reveal";
import ArtworkCard from "../components/ArtworkCard";

const FILTERS = ["All Works", "Available", "Sold", "Commissioned Portraits", "Charcoal", "Graphite", "Portraits", "Figures", "Studies"];

export default function Gallery() {
  const [params, setParams] = useSearchParams();
  const active = params.get("category") || "All Works";
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    client.get("/artworks", { params: active === "All Works" ? {} : { category: active } })
      .then((r) => setItems(r.data)).catch(() => setItems([])).finally(() => setLoading(false));
  }, [active]);

  const setFilter = (f) => setParams(f === "All Works" ? {} : { category: f });
  const shown = items.filter((a) => a.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="pt-[84px]">
      <section className="px-6 md:px-10 pt-20 pb-10 max-w-[1500px] mx-auto">
        <Reveal>
          <p className="label">The Gallery</p>
          <h1 className="font-serif font-light text-5xl md:text-7xl mt-4">A digital exhibition</h1>
          <p className="mt-6 text-[#73736E] max-w-xl">Original charcoal and graphite works. Each piece is presented in its natural proportion — the way it was drawn.</p>
        </Reveal>
        <div className="mt-12 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {FILTERS.map((f) => (
              <button key={f} data-testid={`filter-${f.toLowerCase().replace(/ /g, "-")}`} onClick={() => setFilter(f)}
                className={`text-sm link-underline transition-opacity ${active === f ? "opacity-100 text-[#171614]" : "opacity-55 hover:opacity-100"}`}>
                {f}
              </button>
            ))}
          </div>
          <input data-testid="gallery-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title" className="paper-input max-w-[220px]" />
        </div>
      </section>

      <section className="px-6 md:px-10 pb-28 max-w-[1500px] mx-auto">
        {loading ? (
          <p className="text-[#73736E] py-20">Loading works…</p>
        ) : shown.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-serif text-3xl">No works found in this collection.</p>
            <Link to="/gallery" className="btn-charcoal mt-8">Explore all artwork</Link>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-8">
            {shown.map((art, i) => (
              <Reveal key={art.slug} delay={(i % 3) * 0.06} className="mb-8 break-inside-avoid">
                <ArtworkCard art={art} index={i} />
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
