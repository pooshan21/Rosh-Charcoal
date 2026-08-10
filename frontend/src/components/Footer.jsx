import { Link } from "react-router-dom";
import { Instagram, MessageCircle, Mail } from "lucide-react";
import { CONTACT, waLink } from "../lib/api";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer data-testid="site-footer" className="bg-[#171614] text-[#F6F3EE] px-6 md:px-10 pt-24 pb-12">
      <div className="max-w-[1500px] mx-auto grid md:grid-cols-[1.5fr_1fr_1fr] gap-14">
        <div>
          <div className="flex items-center gap-4">
            <img src="/logo.jpg" alt="Rosh Charcoal" width={64} height={64} className="w-16 h-16 rounded-full object-cover ring-1 ring-white/10" />
            <span className="leading-none">
              <span className="font-script text-4xl block -mb-1">Rosh</span>
              <span className="label !text-[0.6rem] !text-[#a89473]">Charcoal · Every Stroke Matters</span>
            </span>
          </div>
          <p className="mt-7 text-[#a8a396] max-w-sm leading-relaxed text-sm">
            Original charcoal portraits and commissioned artwork, created with care.
          </p>
          <div className="mt-8 flex gap-6">
            <a href={CONTACT.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:text-[#C8B58C] transition-colors"><Instagram size={20} /></a>
            <a href={waLink("Hello Rosh, I'd like to enquire about a portrait.")} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="hover:text-[#C8B58C] transition-colors"><MessageCircle size={20} /></a>
            <a href={`mailto:${CONTACT.email}`} aria-label="Email" className="hover:text-[#C8B58C] transition-colors"><Mail size={20} /></a>
          </div>
        </div>
        <div>
          <div className="label !text-[#6f6d64] mb-6">Explore</div>
          <ul className="space-y-3.5 text-sm text-[#cfccc4]">
            <li><Link to="/gallery" className="link-underline">Gallery</Link></li>
            <li><Link to="/prints" className="link-underline">Prints</Link></li>
            <li><Link to="/original-artworks" className="link-underline">Original Artworks</Link></li>
            <li><Link to="/about" className="link-underline">About</Link></li>
            <li><Link to="/journal" className="link-underline">Journal</Link></li>
          </ul>
        </div>
        <div>
          <div className="label !text-[#6f6d64] mb-6">Contact</div>
          <ul className="space-y-3.5 text-sm text-[#cfccc4]">
            <li><Link to="/commissions" className="link-underline">Commissions</Link></li>
            <li><Link to="/contact" className="link-underline">Contact</Link></li>
            <li><a href={`mailto:${CONTACT.email}`} className="link-underline">{CONTACT.email}</a></li>
            <li><a href={waLink("Hello Rosh")} target="_blank" rel="noreferrer" className="link-underline">{CONTACT.whatsappNumber}</a></li>
            <li><Link to="/privacy" className="link-underline">Privacy Policy</Link></li>
            <li><Link to="/terms" className="link-underline">Terms & Commission Policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-[1500px] mx-auto mt-20 pt-6 border-t border-white/10 text-xs text-[#6f6d64] flex flex-col sm:flex-row justify-between gap-2">
        <span>© {year} Rosh Charcoal. All rights reserved.</span>
        <span className="font-mono-label !text-[#6f6d64]">Charcoal · Graphite · Portraiture</span>
      </div>
    </footer>
  );
}
