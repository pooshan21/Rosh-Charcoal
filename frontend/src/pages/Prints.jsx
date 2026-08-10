import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, X, Check, Minus, Plus } from "lucide-react";
import { client, rupee } from "../lib/api";
import { Reveal } from "../components/Reveal";

const notes = [
  ["Editioned & numbered", "Each limited print is numbered and comes with a signed certificate. Open editions stay available so a favourite piece is never out of reach."],
  ["Archival quality", "Printed with pigment inks on cotton-rag and museum-etching papers rated to last a century without fading."],
  ["Ships worldwide", "Rolled in protective tubes or flat-packed for larger sizes, dispatched with tracked, insured delivery."],
];

function OrderDialog({ edition, onClose }) {
  const [qty, setQty] = useState(1);
  const [framing, setFraming] = useState("Unframed");
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", notes: "", consent: false });
  const [hp, setHp] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const total = edition.price ? edition.price * qty : null;

  const submit = async (e) => {
    e.preventDefault();
    if (!form.consent) { toast.error("Please accept the privacy policy."); return; }
    setBusy(true);
    try {
      await client.post("/print-orders", { edition_id: edition.id, edition_title: edition.title, size: edition.size, quantity: qty, framing, ...form, honeypot: hp });
      setDone(true);
    } catch { toast.error("Something went wrong. Please try again or email us."); }
    finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-[#171614]/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true" data-testid="order-dialog">
      <div className="bg-[#F6F3EE] w-full max-w-lg my-8 relative">
        <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 z-10 text-[#171614]" data-testid="order-close"><X size={22} /></button>
        {done ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 border border-[#171614] rounded-full flex items-center justify-center mx-auto"><Check size={24} /></div>
            <h3 className="font-serif text-3xl mt-6">Order request received</h3>
            <p className="text-[#4a4a46] mt-3 text-sm leading-relaxed">Thank you. Rosh Charcoal will confirm availability, the final total and payment details by email shortly.</p>
            <button onClick={onClose} className="btn-charcoal mt-8">Close</button>
          </div>
        ) : (
          <form onSubmit={submit} className="p-8 md:p-10">
            <div className="flex gap-4 items-center border-b border-[#e0dbd1] pb-6">
              <img src={edition.image} alt={edition.title} className="w-20 h-24 object-cover bg-[#ECE8E1]" />
              <div>
                <p className="label">{edition.edition}</p>
                <h3 className="font-serif text-2xl mt-1">{edition.title}</h3>
                <p className="text-[#74726B] text-sm">{edition.size}</p>
                <p className="font-serif text-lg mt-1">{edition.price != null ? rupee(edition.price) : "Price on confirmation"}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <span className="font-mono-label">Quantity</span>
              <div className="flex items-center gap-4">
                <button type="button" aria-label="Decrease" onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-8 h-8 border border-[#171614] flex items-center justify-center hover:bg-[#171614] hover:text-[#F6F3EE] transition-colors"><Minus size={14} /></button>
                <span className="w-6 text-center" data-testid="order-qty">{qty}</span>
                <button type="button" aria-label="Increase" onClick={() => setQty((q) => q + 1)} className="w-8 h-8 border border-[#171614] flex items-center justify-center hover:bg-[#171614] hover:text-[#F6F3EE] transition-colors"><Plus size={14} /></button>
              </div>
            </div>

            <div className="mt-5">
              <span className="font-mono-label">Framing</span>
              <div className="flex gap-3 mt-2">
                {["Unframed", "Framed"].map((f) => (
                  <button type="button" key={f} onClick={() => setFraming(f)} className={`px-4 py-2 text-sm border ${framing === f ? "bg-[#171614] text-[#F6F3EE] border-[#171614]" : "border-[#d3cec4] hover:border-[#171614]"}`}>{f}</button>
                ))}
              </div>
            </div>

            <div className="grid gap-5 mt-7">
              <input required className="paper-input" placeholder="Full name *" value={form.name} onChange={set("name")} data-testid="order-name" />
              <input required type="email" className="paper-input" placeholder="Email *" value={form.email} onChange={set("email")} data-testid="order-email" />
              <input className="paper-input" placeholder="Phone / WhatsApp" value={form.phone} onChange={set("phone")} />
              <textarea rows={2} className="paper-input resize-none" placeholder="Shipping address (city, country)" value={form.address} onChange={set("address")} />
              <textarea rows={2} className="paper-input resize-none" placeholder="Notes (optional)" value={form.notes} onChange={set("notes")} />
            </div>

            <input type="text" tabIndex={-1} value={hp} onChange={(e) => setHp(e.target.value)} className="hidden" aria-hidden />
            <label className="flex gap-3 items-start text-sm text-[#4a4a46] mt-6">
              <input type="checkbox" required checked={form.consent} onChange={set("consent")} className="mt-1" data-testid="order-consent" />
              <span>I agree to the <Link to="/privacy" className="link-underline">Privacy Policy</Link>. *</span>
            </label>

            <div className="flex items-center justify-between mt-7 border-t border-[#e0dbd1] pt-5">
              <span className="text-[#74726B] text-sm">Estimated total</span>
              <span className="font-serif text-2xl" data-testid="order-total">{total != null ? rupee(total) : "On confirmation"}</span>
            </div>
            <button disabled={busy} className="btn-charcoal w-full justify-center !py-4 mt-5 disabled:opacity-50" data-testid="order-submit">{busy ? "Placing order…" : "Place Order"}</button>
            <p className="text-xs text-[#a8a396] mt-3 text-center">No payment is taken now — the artist confirms the final total and payment details by email.</p>
          </form>
        )}
      </div>
    </div>
  );
}

export default function Prints() {
  const [editions, setEditions] = useState([]);
  const [active, setActive] = useState(null);
  useEffect(() => { client.get("/prints").then((r) => setEditions(r.data)).catch(() => setEditions([])); }, []);

  return (
    <div className="pt-[84px]">
      <section className="px-6 md:px-12 max-w-[1400px] mx-auto pt-24 pb-16">
        <Reveal>
          <p className="label">Fine-Art Prints</p>
          <h1 className="font-serif font-light text-5xl md:text-7xl mt-5 leading-[1.02]">Bring the work home, approachably</h1>
          <p className="mt-8 text-[#4a4a46] max-w-2xl leading-relaxed text-lg">
            Prints are faithful, archival reproductions of Rosh Charcoal's drawings — editioned studies and portraits offered at accessible price points. A considered way to live with the work without commissioning an original.
          </p>
        </Reveal>
      </section>

      <section className="px-6 md:px-12 max-w-[1400px] mx-auto pb-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-16">
          {editions.map((e, i) => (
            <Reveal key={e.id} delay={(i % 4) * 0.06}>
              <div className="group">
                <div className="overflow-hidden bg-[#ECE8E1] aspect-[3/4]">
                  <img src={e.image} alt={e.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-[1.1s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]" />
                </div>
                <p className="label mt-6">{e.edition}</p>
                <h3 className="font-serif text-2xl mt-2">{e.title}</h3>
                <p className="text-[#74726B] text-sm mt-1">{e.size} · {e.paper}</p>
                <p className="font-serif text-xl mt-4">{e.price != null ? rupee(e.price) : "Price on request"}</p>
                <button onClick={() => setActive(e)} data-testid={`order-btn-${e.id}`} className="btn-charcoal mt-4 !py-2.5 !px-5">Order this print</button>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-[#ECE8E1] px-6 md:px-12 py-24">
        <div className="max-w-[1200px] mx-auto grid md:grid-cols-3 gap-14">
          {notes.map((n, i) => (
            <Reveal key={n[0]} delay={i * 0.08}>
              <span className="font-mono-label">0{i + 1}</span>
              <h3 className="font-serif text-2xl mt-4">{n[0]}</h3>
              <p className="text-[#4a4a46] mt-3 leading-relaxed">{n[1]}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-12 py-28 max-w-[1000px] mx-auto text-center">
        <Reveal>
          <p className="label">Looking for something singular?</p>
          <h2 className="font-serif font-light text-4xl md:text-5xl mt-5 leading-tight">Prints are editioned. Originals are one-of-a-kind.</h2>
          <p className="mt-6 text-[#4a4a46] max-w-xl mx-auto leading-relaxed">If you'd prefer a unique, hand-drawn piece that exists only once, explore the original artworks or commission your own portrait.</p>
          <div className="mt-10 flex flex-wrap gap-6 justify-center items-center">
            <Link to="/original-artworks" className="btn-charcoal">View Original Artworks <ArrowRight size={15} /></Link>
            <Link to="/commissions" className="link-underline text-sm">Commission a Portrait</Link>
          </div>
        </Reveal>
      </section>

      {active && <OrderDialog edition={active} onClose={() => setActive(null)} />}
    </div>
  );
}
