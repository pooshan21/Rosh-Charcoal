import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { Link2, ArrowRight } from "lucide-react";
import { client, waLink } from "../lib/api";
import { Reveal } from "../components/Reveal";
import NotFound from "./NotFound";

const fmt = (d) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export default function JournalArticle() {
  const { slug } = useParams();
  const [data, setData] = useState(undefined);
  useEffect(() => { setData(undefined); client.get(`/journal/${slug}`).then((r) => setData(r.data)).catch(() => setData(null)); }, [slug]);

  if (data === null) return <NotFound />;
  if (!data) return <div className="pt-[160px] px-10 pb-40 text-[#73736E]">Loading…</div>;
  const a = data.article;
  const url = typeof window !== "undefined" ? window.location.href : "";
  const copy = () => { navigator.clipboard.writeText(url); toast.success("Link copied"); };

  return (
    <div className="pt-[84px]">
      <article className="px-6 md:px-10 max-w-[760px] mx-auto pt-16 pb-20">
        <Reveal>
          <nav className="text-xs font-mono-label text-[#73736E] mb-8"><Link to="/journal" className="link-underline">Journal</Link> / {a.category}</nav>
          <p className="label">{a.category}</p>
          <h1 className="font-serif font-light text-4xl md:text-6xl mt-4 leading-[1.05]">{a.title}</h1>
          <p className="mt-6 text-sm text-[#73736E] font-mono-label">By {a.author} · {fmt(a.date)} · {a.reading_time} min read</p>
        </Reveal>
        <Reveal delay={0.1}>
          <img src={a.cover} alt={a.title} className="w-full h-[440px] object-cover mt-10 bg-[#EAE7E1]" />
        </Reveal>
        <Reveal delay={0.15}>
          <div className="mt-12 space-y-6">
            {a.body.split("\n\n").map((p, i) => (
              <p key={i} className="text-[1.12rem] leading-[1.85] text-[#2b2b28]">{p}</p>
            ))}
          </div>
          <div className="mt-12 flex items-center gap-5 border-t border-[#e2ded5] pt-8">
            <span className="label !text-[#a8a599]">Share</span>
            <button onClick={copy} className="link-underline text-sm inline-flex items-center gap-1.5"><Link2 size={15} /> Copy link</button>
            <a href={waLink(a.title + " " + url)} target="_blank" rel="noreferrer" className="link-underline text-sm">WhatsApp</a>
            <a href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(a.cover)}&description=${encodeURIComponent(a.title)}`} target="_blank" rel="noreferrer" className="link-underline text-sm">Pinterest</a>
          </div>
        </Reveal>
      </article>

      <section className="bg-[#171614] text-[#F6F3EE] px-6 md:px-10 py-24 text-center">
        <Reveal>
          <h2 className="font-serif font-light text-3xl md:text-4xl max-w-xl mx-auto">Moved by a story? Begin a portrait of your own.</h2>
          <div className="mt-8 flex gap-6 justify-center items-center">
            <Link to="/commissions" className="btn-charcoal inverse">Request a Commission <ArrowRight size={15} /></Link>
            <Link to="/gallery" className="link-underline text-sm text-[#cfccc4]">Explore the Gallery</Link>
          </div>
        </Reveal>
      </section>

      {data.related?.length > 0 && (
        <section className="px-6 md:px-10 max-w-[1300px] mx-auto py-24">
          <h2 className="font-serif font-light text-3xl mb-12">Keep reading</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {data.related.map((p) => (
              <Link key={p.slug} to={`/journal/${p.slug}`} className="group block">
                <div className="overflow-hidden bg-[#EAE7E1]"><img src={p.cover} alt={p.title} loading="lazy" className="w-full h-56 object-cover transition-transform duration-[1.2s] group-hover:scale-105" /></div>
                <p className="label mt-4">{p.category}</p>
                <h3 className="font-serif text-xl mt-2">{p.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
