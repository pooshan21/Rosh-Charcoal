import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Instagram, MessageCircle, Mail } from "lucide-react";
import { NAV, CONTACT, waLink } from "../lib/api";
import Logo from "./Logo";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const overHero = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const dark = overHero && !scrolled;
  const textColor = dark ? "text-[#F6F3EE]" : "text-[#171614]";

  return (
    <>
      <header
        data-testid="site-header"
        className={`fixed top-0 left-0 right-0 z-[100] transition-[background-color,backdrop-filter,border-color] duration-500 ${
          scrolled ? "bg-[#F6F3EE]/80 backdrop-blur-xl border-b border-[#e2ded5]" : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="max-w-[1500px] mx-auto px-6 md:px-10 h-[84px] flex items-center justify-between">
          <Logo size={52} showWordmark dark={dark} />

          <nav className="hidden lg:flex items-center gap-10">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                data-testid={`nav-${n.label.toLowerCase().replace(/ /g, "-")}`}
                className={({ isActive }) =>
                  `link-underline text-[0.78rem] tracking-[0.08em] uppercase ${textColor} ${isActive ? "opacity-100" : "opacity-70 hover:opacity-100"}`
                }
              >
                {n.label}
              </NavLink>
            ))}
            <Link to="/commissions" data-testid="header-cta" className={`btn-charcoal ${dark ? "inverse" : ""} !py-2.5 !px-5`}>
              Request a Portrait
            </Link>
          </nav>

          <button
            data-testid="menu-toggle"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className={`lg:hidden ${textColor}`}
          >
            <Menu size={26} strokeWidth={1.4} />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            data-testid="mobile-menu"
            className="fixed inset-0 z-[200] bg-[#171614] text-[#F6F3EE] flex flex-col"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="h-[84px] px-6 flex items-center justify-between border-b border-white/10">
              <Logo size={44} showWordmark dark />
              <button data-testid="menu-close" aria-label="Close menu" onClick={() => setOpen(false)}>
                <X size={28} strokeWidth={1.4} />
              </button>
            </div>
            <nav className="flex-1 flex flex-col justify-center px-8 gap-2">
              {[{ label: "Home", to: "/" }, ...NAV, { label: "Contact", to: "/contact" }].map((n, i) => (
                <motion.div key={n.to}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.06 }}>
                  <Link to={n.to} className="font-serif text-4xl py-2 block hover:text-[#a8a599] transition-colors">
                    {n.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="px-8 py-8 border-t border-white/10 flex gap-6 items-center">
              <a href={CONTACT.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={22} /></a>
              <a href={waLink("Hello Rosh, I'd like to enquire about a portrait.")} target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle size={22} /></a>
              <a href={`mailto:${CONTACT.email}`} aria-label="Email"><Mail size={22} /></a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
