import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, X, Minus, Plus, Loader2 } from "lucide-react";
import { client, rupee, SHIPPING_FEE, loadRazorpay } from "../lib/api";
import { Reveal } from "../components/Reveal";

const notes = [
  ["Editioned & numbered", "Each limited print is numbered and comes with a signed certificate. Open editions stay available so a favourite piece is never out of reach."],
  ["Archival quality", "Printed with pigment inks on cotton-rag and museum-etching papers rated to last a century without fading."],
  ["Ships worldwide", "Rolled in protective tubes or flat-packed for larger sizes, dispatched with tracked, insured delivery."],
];

function CheckoutDialog({ edition, onClose }) {
  const nav = useNavigate();
  const [qty, setQty] = useState(1);
  const [framing, setFraming] = useState("Unframed");
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", consent: false });
  const [hp, setHp] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const maxQty = edition.remaining != null ? edition.remaining : 9;
  const subtotal = (edition.price || 0) * qty;
  const total = subtotal + SHIPPING_FEE;

  const finish = (orderNumber) => { onClose(); nav(`/order/${orderNumber}`); };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.consent) { toast.error("Please accept the privacy policy."); return; }
    setBusy(true);
    try {
      const { data } = await client.post("/checkout/create-order", {
        edition_id: edition.id, quantity: qty, framing, consent: form.consent, honeypot: hp,
        customer: { name: form.name, email: form.email, phone: form.phone, address: form.address },
      });
      if (data.payments_enabled && data.razorpay_order_id) {
        const ok = await loadRazorpay();
        if (!ok) { toast.error("Could not load the payment window. Please try again."); setBusy(false); return; }
        const rzp = new window.Razorpay({
          key: data.key_id, amount: data.amount * 100, currency: "INR",
          name: "Rosh Charcoal", description: `${edition.title} × ${qty}`,
          order_id: data.razorpay_order_id,
          prefill: { name: form.name, email: form.email, contact: form.phone },
          theme: { color: "#171614" },
          config: { display: { blocks: { upi: { name: "Pay via UPI", instruments: [{ method: "upi", flows: ["intent", "qr"] }] } }, sequence: ["block.upi", "other"], preferences: { show_default_blocks: true } } },
          handler: async (resp) => {
            try {
              await client.post("/checkout/verify", {
                order_number: data.order_number,
                razorpay_order_id: resp.razorpay_order_id,
                razorpay_payment_id: resp.razorpay_payment_id,
                razorpay_signature: resp.razorpay_signature,
              });
              finish(data.order_number);
            } catch { toast.error("Payment verification failed. Please contact support with your order number."); setBusy(false); }
          },
          modal: { ondismiss: () => setBusy(false) },
        });
        rzp.on("payment.failed", () => { toast.error("Payment failed. Please try again."); setBusy(false); });
        rzp.open();
      } else {
        // payments not configured yet — order recorded as pending
        finish(data.order_number);
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Something went wrong. Please try again.");
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-[#171614]/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true" data-testid="checkout-dialog">
      <div className="bg-[#F6F3EE] w-full max-w-lg my-8 relative">
        <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 z-10" data-testid="checkout-close"><X size={22} /></button>
        <form onSubmit={submit} className="p-8 md:p-10">
          <div className="flex gap-4 items-center border-b border-[#e0dbd1] pb-6">
            <img src={edition.image} alt={edition.title} className="w-20 h-24 object-cover bg-[#ECE8E1]" />
            <div>
              <p className="label">{edition.edition}</p>
              <h3 className="font-serif text-2xl mt-1">{edition.title}</h3>
              <p className="text-[#74726B] text-sm">{edition.size}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <span className="font-mono-label">Quantity</span>
            <div className="flex items-center gap-4">
              <button type="button" aria-label="Decrease" onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-8 h-8 border border-[#171614] flex items-center justify-center hover:bg-[#171614] hover:text-[#F6F3EE] transition-colors"><Minus size={14} /></button>
              <span className="w-6 text-center" data-testid="checkout-qty">{qty}</span>
              <button type="button" aria-label="Increase" onClick={() => setQty((q) => Math.min(maxQty, q + 1))} className="w-8 h-8 border border-[#171614] flex items-center justify-center hover:bg-[#171614] hover:text-[#F6F3EE] transition-colors disabled:opacity-40" disabled={qty >= maxQty}><Plus size={14} /></button>
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
            <input required className="paper-input" placeholder="Full name *" value={form.name} onChange={set("name")} data-testid="checkout-name" />
            <input required type="email" className="paper-input" placeholder="Email *" value={form.email} onChange={set("email")} data-testid="checkout-email" />
            <input required className="paper-input" placeholder="Phone / WhatsApp *" value={form.phone} onChange={set("phone")} />
            <textarea required rows={2} className="paper-input resize-none" placeholder="Shipping address *" value={form.address} onChange={set("address")} />
          </div>

          <input type="text" tabIndex={-1} value={hp} onChange={(e) => setHp(e.target.value)} className="hidden" aria-hidden />

          <div className="mt-7 border-t border-[#e0dbd1] pt-5 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-[#74726B]">Item ({qty})</span><span>{rupee(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-[#74726B]">Shipping</span><span>{rupee(SHIPPING_FEE)}</span></div>
            <div className="flex justify-between"><span className="text-[#74726B]">Tax</span><span>{rupee(0)}</span></div>
            <div className="flex justify-between font-serif text-2xl pt-2"><span>Total</span><span data-testid="checkout-total">{rupee(total)}</span></div>
          </div>

          <label className="flex gap-3 items-start text-sm text-[#4a4a46] mt-6">
            <input type="checkbox" required checked={form.consent} onChange={set("consent")} className="mt-1" data-testid="checkout-consent" />
            <span>I agree to the <Link to="/privacy" className="link-underline">Privacy Policy</Link> and <Link to="/terms" className="link-underline">Terms</Link>. *</span>
          </label>

          <button disabled={busy} className="btn-charcoal w-full justify-center !py-4 mt-6 disabled:opacity-50" data-testid="checkout-pay">
            {busy ? <><Loader2 size={16} className="animate-spin" /> Processing…</> : <>Pay {rupee(total)}</>}
          </button>
          <p className="text-xs text-[#a8a396] mt-3 text-center">Secure payment via Razorpay — cards, UPI & more. We never store your card details.</p>
        </form>
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
          {editions.map((e, i) => {
            const limited = e.remaining != null;
            const low = limited && e.remaining > 0 && e.remaining <= 5;
            return (
              <Reveal key={e.id} delay={(i % 4) * 0.06}>
                <div className={`group ${e.sold_out ? "opacity-60" : ""}`} data-testid={`print-${e.id}`}>
                  <div className="relative overflow-hidden bg-[#ECE8E1] aspect-[3/4]">
                    {e.sold_out && <span className="absolute top-4 left-4 z-10 bg-[#171614]/85 text-[#C8B58C] label !text-[0.6rem] px-4 py-2 backdrop-blur-sm">Sold Out</span>}
                    <img src={e.image} alt={e.title} loading="lazy" className={`w-full h-full object-cover transition-transform duration-[1.1s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] ${e.sold_out ? "grayscale" : ""}`} />
                  </div>
                  <p className="label mt-6">{e.edition}</p>
                  <h3 className="font-serif text-2xl mt-2">{e.title}</h3>
                  <p className="text-[#74726B] text-sm mt-1">{e.size} · {e.paper}</p>
                  <div className="flex items-baseline justify-between mt-4">
                    <p className="font-serif text-xl">{e.price != null ? rupee(e.price) : "Price on request"}</p>
                    {limited && (
                      <span className={`text-xs font-mono-label ${e.sold_out ? "!text-[#8a4a3d]" : low ? "!text-[#8a4a3d]" : ""}`} data-testid={`stock-${e.id}`}>
                        {e.sold_out ? "0 remaining" : `${e.remaining} of ${e.run_total} remaining`}
                      </span>
                    )}
                  </div>
                  {e.sold_out ? (
                    <button disabled className="btn-charcoal mt-4 !py-2.5 !px-5 opacity-50 cursor-not-allowed" data-testid={`soldout-${e.id}`}>Sold Out</button>
                  ) : (
                    <button onClick={() => setActive(e)} data-testid={`buy-btn-${e.id}`} className="btn-charcoal mt-4 !py-2.5 !px-5">Buy this print</button>
                  )}
                </div>
              </Reveal>
            );
          })}
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

      {active && <CheckoutDialog edition={active} onClose={() => setActive(null)} />}
    </div>
  );
}
