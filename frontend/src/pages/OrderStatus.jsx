import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Check, Truck, Package, ClipboardCheck, MapPin, MessageCircle, Mail, Search } from "lucide-react";
import { client, rupee, CONTACT, waLink } from "../lib/api";
import { Reveal } from "../components/Reveal";

const STAGES = [
  { key: "Order Placed", icon: ClipboardCheck },
  { key: "Confirmed", icon: Check },
  { key: "Packed", icon: Package },
  { key: "Shipped", icon: Truck },
  { key: "Delivered", icon: MapPin },
];
const fmt = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "";

function Lookup() {
  const [num, setNum] = useState("");
  const nav = useNavigate();
  return (
    <div className="pt-[84px]">
      <section className="px-6 max-w-[560px] mx-auto pt-28 pb-40 text-center">
        <p className="label">Order Lookup</p>
        <h1 className="font-serif font-light text-4xl md:text-5xl mt-4">Track your order</h1>
        <p className="mt-5 text-[#4a4a46]">Enter your order number (e.g. RC-A1B2C3) to view its status.</p>
        <form onSubmit={(e) => { e.preventDefault(); if (num.trim()) nav(`/order/${num.trim().toUpperCase()}`); }} className="mt-10 flex gap-3">
          <input className="paper-input" placeholder="Order number" value={num} onChange={(e) => setNum(e.target.value)} data-testid="lookup-input" />
          <button className="btn-charcoal" data-testid="lookup-submit"><Search size={15} /> Find</button>
        </form>
      </section>
    </div>
  );
}

export default function OrderStatus() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(undefined);

  useEffect(() => {
    if (!orderNumber) { setOrder(null); return; }
    setOrder(undefined);
    client.get(`/orders/${orderNumber}`).then((r) => setOrder(r.data)).catch(() => setOrder(false));
  }, [orderNumber]);

  if (!orderNumber) return <Lookup />;
  if (order === undefined) return <div className="pt-[160px] px-10 pb-40 text-[#74726B]">Loading order…</div>;
  if (order === false) return (
    <div className="pt-[160px] px-6 pb-40 text-center max-w-md mx-auto">
      <h1 className="font-serif font-light text-4xl">Order not found</h1>
      <p className="mt-4 text-[#74726B]">We couldn't find an order with that number. Please check the link or look it up below.</p>
      <Link to="/order" className="btn-charcoal mt-8">Order Lookup</Link>
    </div>
  );

  const paid = order.payment_status === "paid";
  const stageIdx = STAGES.findIndex((s) => s.key === order.status);
  const curIdx = stageIdx < 0 ? 0 : stageIdx;

  return (
    <div className="pt-[84px]">
      <section className="px-6 md:px-12 max-w-[1000px] mx-auto pt-16 pb-10">
        <Reveal>
          <p className="label">{paid ? "Order Confirmed" : "Order Received"}</p>
          <h1 className="font-serif font-light text-4xl md:text-6xl mt-4 leading-[1.05]" data-testid="order-headline">
            {paid ? "Thank you — your order is confirmed." : "Your order has been received."}
          </h1>
          <p className="mt-5 text-[#4a4a46]">Order number <span className="font-mono-label !text-[0.8rem] !text-[#171614]" data-testid="order-number">{order.order_number}</span> · Bookmark this page to check progress anytime.</p>
        </Reveal>
      </section>

      {/* status tracker */}
      <section className="px-6 md:px-12 max-w-[1000px] mx-auto py-8">
        <Reveal>
          <div className="flex justify-between relative">
            <div className="absolute top-5 left-0 right-0 h-px bg-[#e0dbd1]" />
            <div className="absolute top-5 left-0 h-px bg-[#A38A5C] transition-all" style={{ width: `${(curIdx / (STAGES.length - 1)) * 100}%` }} />
            {STAGES.map((s, i) => {
              const done = i <= curIdx;
              const Icon = s.icon;
              return (
                <div key={s.key} className="relative flex flex-col items-center gap-3 flex-1" data-testid={`stage-${s.key.replace(/ /g, "-")}`}>
                  <span className={`w-10 h-10 rounded-full flex items-center justify-center border ${done ? "bg-[#171614] text-[#F6F3EE] border-[#171614]" : "bg-[#F6F3EE] text-[#c3beb4] border-[#e0dbd1]"} ${i === curIdx ? "ring-4 ring-[#A38A5C]/25" : ""}`}><Icon size={16} /></span>
                  <span className={`text-[0.62rem] uppercase tracking-[0.15em] text-center ${done ? "text-[#171614]" : "text-[#a8a396]"}`} style={{ fontFamily: "Marcellus, serif" }}>{s.key}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-8 text-[#4a4a46] text-sm">
            {order.status === "Shipped" || order.status === "Delivered"
              ? `Your print is on its way. Estimated delivery by ${fmt(order.estimated_delivery)}.`
              : `What happens next: your print will be prepared with care and dispatched with tracked, insured delivery. Estimated delivery by ${fmt(order.estimated_delivery)}.`}
          </p>
          {order.tracking_url && (
            <a href={order.tracking_url} target="_blank" rel="noreferrer" className="btn-charcoal mt-5" data-testid="tracking-link"><Truck size={15} /> Track shipment</a>
          )}
        </Reveal>
      </section>

      {/* summary + payment */}
      <section className="px-6 md:px-12 max-w-[1000px] mx-auto py-10 grid md:grid-cols-[1.3fr_1fr] gap-10">
        <Reveal>
          <div className="border border-[#e0dbd1] p-6 flex gap-5">
            <img src={order.image} alt={order.edition_title} className="w-24 h-32 object-cover bg-[#ECE8E1]" />
            <div className="flex-1">
              <p className="label">{order.edition_label}</p>
              <h2 className="font-serif text-2xl mt-1">{order.edition_title}</h2>
              <p className="text-[#74726B] text-sm mt-1">{order.size} · {order.framing}</p>
              <p className="text-[#74726B] text-sm">Quantity: {order.quantity}</p>
            </div>
          </div>
          <div className="border border-[#e0dbd1] border-t-0 p-6 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-[#74726B]">Item</span><span>{rupee(order.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-[#74726B]">Shipping</span><span>{rupee(order.shipping)}</span></div>
            <div className="flex justify-between"><span className="text-[#74726B]">Tax</span><span>{rupee(order.tax || 0)}</span></div>
            <div className="flex justify-between font-serif text-2xl pt-2 border-t border-[#e0dbd1] mt-2"><span>Total</span><span data-testid="order-total">{rupee(order.total)}</span></div>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="border border-[#e0dbd1] p-6 h-fit">
            <p className="label mb-4">Payment</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#74726B]">Status</span>
              <span className={`px-3 py-1 text-xs uppercase tracking-wider ${paid ? "bg-[#2f4a37] text-[#F6F3EE]" : "bg-[#ECE8E1] text-[#8a6d3d]"}`} data-testid="payment-status">{paid ? "Paid" : "Pending"}</span>
            </div>
            {order.payment_method && <div className="flex items-center justify-between text-sm mt-3"><span className="text-[#74726B]">Method</span><span>{order.payment_method}</span></div>}
            {!paid && <p className="text-xs text-[#8a6d3d] mt-4 leading-relaxed">Online payment isn't completed yet. Rosh Charcoal will reach out with a secure payment link to finalise your order.</p>}
            <div className="mt-6 border-t border-[#e0dbd1] pt-5">
              <p className="label mb-3">Need help?</p>
              <a href={`mailto:${CONTACT.email}?subject=${encodeURIComponent("Order " + order.order_number)}`} className="link-underline text-sm flex items-center gap-2"><Mail size={14} /> {CONTACT.email}</a>
              <a href={waLink(`Hello Rosh, I have a question about order ${order.order_number}.`)} target="_blank" rel="noreferrer" className="link-underline text-sm flex items-center gap-2 mt-2"><MessageCircle size={14} /> WhatsApp support</a>
            </div>
          </div>
        </Reveal>
      </section>

      {/* cross-sell BELOW core details */}
      <section className="bg-[#171614] text-[#F6F3EE] px-6 md:px-12 py-24 mt-10 text-center">
        <Reveal>
          <p className="label !text-[#C8B58C]">You may also like</p>
          <h2 className="font-serif font-light text-3xl md:text-4xl mt-4 max-w-xl mx-auto">Explore more prints and original works</h2>
          <div className="mt-9 flex flex-wrap gap-6 justify-center items-center">
            <Link to="/prints" className="btn-charcoal inverse">Browse Prints</Link>
            <Link to="/original-artworks" className="link-underline text-sm text-[#cfccc4]">Original Artworks</Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
