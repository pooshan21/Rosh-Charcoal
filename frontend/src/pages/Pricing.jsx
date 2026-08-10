import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { client, rupee } from "../lib/api";
import { Reveal } from "../components/Reveal";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../components/ui/accordion";

const affects = ["Additional subjects in the composition", "Larger dimensions and complex backgrounds", "Custom framing and mounting", "Rush or deadline-driven work", "Special material or surface requests", "International shipping and insurance"];
const included = ["The original hand-drawn artwork", "Protective archival packaging", "Optional framing (on request)", "Progress updates during creation", "Certificate of authenticity"];
const steps = ["You share a reference photograph and your requirements.", "Rosh reviews the request and confirms a quote.", "You confirm the commission and payment terms.", "The artwork is drawn, with optional progress updates.", "The finished piece is packaged, dispatched and delivered."];
const faqs = [
  ["What makes a good reference photograph?", "Clear, well-lit, high-resolution images work best. Avoid heavy filters or blur — the subject's expression should be visible. I may request a few alternatives before confirming."],
  ["How long does a commission take?", "Timelines vary by size and detail, typically between two and six weeks after the reference is confirmed. Exact timing is agreed before we begin."],
  ["Do you offer framing and shipping?", "Yes. Framing is optional and quoted separately. I ship worldwide with protective, insured packaging."],
  ["How does payment work?", "Commissions are confirmed with an advance, with the balance due before dispatch. Details are shared with your quote."],
  ["Can changes be made after the artwork begins?", "Minor adjustments are possible early on. Significant changes may affect the timeline and quote, so I'll always discuss them with you first."],
  ["Do you accept urgent commissions?", "Occasionally, subject to availability. Rush work may carry an additional fee — please mention your deadline when enquiring."],
];

export default function Pricing() {
  const [tiers, setTiers] = useState([]);
  const [status, setStatus] = useState("Commissions Open");
  useEffect(() => {
    client.get("/pricing").then((r) => setTiers(r.data)).catch(() => {});
    client.get("/settings").then((r) => setStatus(r.data.commission_status)).catch(() => {});
  }, []);
  const open = status === "Commissions Open" || status === "Limited Slots Available";

  return (
    <div className="pt-[84px]">
      <section className="px-6 md:px-10 max-w-[1300px] mx-auto pt-20 pb-14">
        <Reveal>
          <p className="label">{status}</p>
          <h1 className="font-serif font-light text-5xl md:text-7xl mt-4">Commission Pricing</h1>
          <p className="mt-6 text-[#4a4a46] max-w-2xl leading-relaxed">
            Every portrait is individually hand-drawn. Pricing varies with size, number of subjects, detailing, framing, reference quality, deadline, shipping and any special requirements. The figures below are starting points in Indian Rupees.
          </p>
        </Reveal>
      </section>

      <section className="px-6 md:px-10 max-w-[1300px] mx-auto pb-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#e2ded5] border border-[#e2ded5]">
          {tiers.map((t, i) => (
            <Reveal key={t.name} delay={(i % 3) * 0.06} className="bg-[#F6F3EE]">
              <div className="p-8 h-full flex flex-col">
                <h3 className="font-serif text-2xl">{t.name}</h3>
                <p className="text-[#73736E] text-sm mt-2">{t.size}</p>
                <ul className="mt-6 space-y-2 text-sm text-[#4a4a46] flex-1">
                  <li>{t.subjects}</li><li>{t.medium}</li><li>{t.timeline}</li><li>{t.framing}</li>
                </ul>
                <p className="mt-7 font-mono-label text-xs text-[#a8a599] uppercase tracking-wider">Starting from</p>
                <p className="font-serif text-3xl mt-1">{t.price_from != null ? rupee(t.price_from) : "On request"}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-[#EAE7E1] px-6 md:px-10 py-24">
        <div className="max-w-[1100px] mx-auto grid md:grid-cols-2 gap-16">
          <Reveal>
            <h2 className="font-serif text-3xl">What affects the final quote?</h2>
            <ul className="mt-6 space-y-3 text-[#4a4a46]">{affects.map((a) => <li key={a} className="flex gap-3"><span className="text-[#A38A5C]">—</span>{a}</li>)}</ul>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-serif text-3xl">What is included?</h2>
            <ul className="mt-6 space-y-3 text-[#4a4a46]">{included.map((a) => <li key={a} className="flex gap-3"><span className="text-[#A38A5C]">—</span>{a}</li>)}</ul>
          </Reveal>
        </div>
      </section>

      <section className="px-6 md:px-10 py-24 max-w-[1100px] mx-auto">
        <Reveal><h2 className="font-serif font-light text-4xl mb-12">How commissions work</h2></Reveal>
        <div className="space-y-px">
          {steps.map((s, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <div className="grid grid-cols-[auto_1fr] gap-8 py-6 border-t border-[#e2ded5]">
                <span className="font-mono-label text-[#A38A5C]">0{i + 1}</span>
                <p className="text-[#2b2b28] text-lg">{s}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-10 pb-24 max-w-[900px] mx-auto">
        <Reveal><h2 className="font-serif font-light text-4xl mb-10">Frequently asked</h2></Reveal>
        <Accordion type="single" collapsible className="w-full" data-testid="pricing-faq">
          {faqs.map(([q, a], i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-b border-[#e2ded5]">
              <AccordionTrigger className="font-serif text-xl text-left hover:no-underline py-6">{q}</AccordionTrigger>
              <AccordionContent className="text-[#4a4a46] leading-relaxed text-base pb-6">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="bg-[#171614] text-[#F6F3EE] px-6 md:px-10 py-28 text-center">
        <Reveal>
          <h2 className="font-serif font-light text-4xl md:text-5xl max-w-2xl mx-auto">{open ? "Ready to begin a portrait?" : "Commissions are currently on a waitlist"}</h2>
          <Link to={open ? "/commissions" : "/contact"} className="btn-charcoal inverse mt-10">{open ? "Start a Commission" : "Join the Waitlist"}</Link>
        </Reveal>
      </section>
    </div>
  );
}
