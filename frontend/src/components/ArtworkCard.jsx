import { Link } from "react-router-dom";
import { rupee } from "../lib/api";

const statusStyle = {
  Available: "text-[#3d6b4a]",
  Sold: "text-[#8a4a3d]",
  Commissioned: "text-[#A38A5C]",
  "Private Collection": "text-[#A38A5C]",
  "Not for Sale": "text-[#73736E]",
};

// Branded fallback if image fails
const onErr = (e) => {
  e.currentTarget.style.display = "none";
  e.currentTarget.parentElement.classList.add("img-fallback");
};

export default function ArtworkCard({ art, index = 0 }) {
  return (
    <Link
      to={`/artwork/${art.slug}`}
      data-testid={`artwork-card-${art.slug}`}
      className="group block"
    >
      <div className="relative overflow-hidden bg-[#EAE7E1]">
        <div className="img-fallback-wrap relative">
          {art.availability === "Sold" && (
            <span className="absolute top-3 left-3 z-10 bg-[#171614]/85 text-[#C8B58C] px-3 py-1.5 backdrop-blur-sm" style={{ fontFamily: "Marcellus, serif", textTransform: "uppercase", letterSpacing: "0.2em", fontSize: "0.58rem" }}>Acquired</span>
          )}
          <img
            src={art.main_image}
            alt={art.alt || art.title}
            loading={index < 2 ? "eager" : "lazy"}
            onError={onErr}
            className="w-full h-auto block transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
          />
        </div>
        <div className="absolute inset-0 bg-[#171614]/0 group-hover:bg-[#171614]/10 transition-colors duration-700" />
        <span className="absolute bottom-4 left-4 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 text-[#F6F3EE] text-xs tracking-wide bg-[#171614]/70 backdrop-blur px-3 py-1.5">
          View Artwork
        </span>
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl leading-tight">{art.title}</h3>
          <p className="text-[#73736E] text-[0.8rem] mt-1">{art.medium} · {art.year}</p>
        </div>
        <span className={`text-[0.7rem] uppercase tracking-wider whitespace-nowrap ${statusStyle[art.availability] || "text-[#73736E]"}`}>
          {art.availability}
        </span>
      </div>
      {art.price_visibility === "show" && art.price != null && (
        <p className="text-[#73736E] text-[0.8rem] mt-1">{rupee(art.price)}</p>
      )}
    </Link>
  );
}
