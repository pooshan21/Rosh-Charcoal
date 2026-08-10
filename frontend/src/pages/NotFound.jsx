import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { client } from "../lib/api";
import { Reveal } from "../components/Reveal";
import ArtworkCard from "../components/ArtworkCard";

export default function NotFound() {
  const [works, setWorks] = useState([]);
  useEffect(() => { client.get("/artworks").then((r) => setWorks(r.data.slice(0, 3))).catch(() => {}); }, []);
  return (
    <div className="pt-[84px]">
      <section className="px-6 md:px-10 max-w-[1300px] mx-auto pt-24 pb-16 grid md:grid-cols-2 gap-14 items-center">
        <Reveal>
          <p className="label">Error 404</p>
          <h1 className="font-serif font-light text-6xl md:text-8xl mt-4 leading-none">Nothing here.</h1>
          <p className="mt-6 text-[#4a4a46] max-w-md leading-relaxed">The page you were looking for has moved or never existed — like a sketch that was wiped away. Let's find your way back.</p>
          <div className="mt-10 flex flex-wrap gap-6 items-center">
            <Link to="/" className="btn-charcoal">Return Home</Link>
            <Link to="/gallery" className="link-underline text-sm">View the Gallery</Link>
            <Link to="/commissions" className="link-underline text-sm">Commissions</Link>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <img src="https://images.unsplash.com/photo-1771257824559-0a4fc650d6cd?crop=entropy&cs=srgb&fm=jpg&q=85&w=900" alt="Charcoal portrait" className="w-full h-[440px] object-cover grayscale" />
        </Reveal>
      </section>
      {works.length > 0 && (
        <section className="px-6 md:px-10 max-w-[1300px] mx-auto pb-28">
          <p className="label mb-10">A few available works</p>
          <div className="grid sm:grid-cols-3 gap-8">{works.map((a, i) => <ArtworkCard key={a.slug} art={a} index={i} />)}</div>
        </section>
      )}
    </div>
  );
}
