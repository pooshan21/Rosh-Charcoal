import { Link } from "react-router-dom";

// Circular badge logo lockup used in header & footer
export default function Logo({ size = 48, showWordmark = false, dark = false, className = "" }) {
  return (
    <Link to="/" data-testid="logo-link" className={`flex items-center gap-3 ${className}`} aria-label="Rosh Charcoal — home">
      <img
        src="/logo.jpg"
        alt="Rosh Charcoal"
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className="rounded-full object-cover flex-shrink-0 ring-1 ring-black/10"
      />
      {showWordmark && (
        <span className="leading-none">
          <span className={`font-script text-3xl block -mb-1 ${dark ? "text-[#F6F3EE]" : "text-[#171614]"}`}>Rosh</span>
          <span className="label !text-[0.55rem] !tracking-[0.34em]">Charcoal</span>
        </span>
      )}
    </Link>
  );
}
