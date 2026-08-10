import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Check, MessageCircle, Mail, Instagram } from "lucide-react";
import { client, CONTACT, waLink } from "../lib/api";
import { Reveal } from "../components/Reveal";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "", consent: false });
  const [hp, setHp] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.consent) { toast.error("Please accept the privacy policy."); return; }
    setBusy(true);
    try {
      await client.post("/enquiries", { ...form, type: "contact", phone: "", honeypot: hp });
      setDone(true); window.scrollTo({ top: 0, behavior: "smooth" });
    } catch { toast.error("Something went wrong. Please email or WhatsApp us directly."); }
    finally { setBusy(false); }
  };

  return (
    <div className="pt-[84px]">
      <section className="px-6 md:px-10 max-w-[1100px] mx-auto pt-20 pb-28 grid md:grid-cols-[1fr_0.9fr] gap-16">
        <Reveal>
          <p className="label">Contact</p>
          <h1 className="font-serif font-light text-5xl md:text-6xl mt-4 leading-tight">Let's create something meaningful</h1>
          <p className="mt-6 text-[#4a4a46] leading-relaxed">Rosh Charcoal accepts enquiries worldwide, subject to commission availability and shipping requirements. I usually respond within 2–3 working days.</p>
          <div className="mt-10 space-y-4 text-sm">
            <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-3 link-underline w-fit"><Mail size={17} /> {CONTACT.email}</a>
            <a href={waLink("Hello Rosh")} target="_blank" rel="noreferrer" className="flex items-center gap-3 link-underline w-fit"><MessageCircle size={17} /> {CONTACT.whatsappNumber}</a>
            <a href={CONTACT.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-3 link-underline w-fit"><Instagram size={17} /> @roshcharcoal</a>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          {done ? (
            <div className="border border-[#e2ded5] p-10 text-center">
              <div className="w-14 h-14 border border-[#171614] rounded-full flex items-center justify-center mx-auto"><Check size={24} /></div>
              <p className="font-serif text-2xl mt-6">Message received.</p>
              <p className="text-[#73736E] mt-3 text-sm">Thank you — Rosh Charcoal will get back to you soon.</p>
            </div>
          ) : (
            <form onSubmit={submit} data-testid="contact-form" className="space-y-7">
              <input type="text" tabIndex={-1} value={hp} onChange={(e) => setHp(e.target.value)} className="hidden" aria-hidden />
              <input required className="paper-input" placeholder="Name *" value={form.name} onChange={set("name")} data-testid="contact-name" />
              <input required type="email" className="paper-input" placeholder="Email *" value={form.email} onChange={set("email")} data-testid="contact-email" />
              <input className="paper-input" placeholder="Subject" value={form.subject} onChange={set("subject")} />
              <textarea required rows={5} className="paper-input resize-none" placeholder="Message *" value={form.message} onChange={set("message")} data-testid="contact-message" />
              <label className="flex gap-3 items-start text-sm text-[#4a4a46]">
                <input type="checkbox" required checked={form.consent} onChange={set("consent")} className="mt-1" />
                <span>I agree to the <Link to="/privacy" className="link-underline">Privacy Policy</Link>. *</span>
              </label>
              <button disabled={busy} className="btn-charcoal w-full justify-center !py-4 disabled:opacity-50" data-testid="contact-submit">{busy ? "Sending…" : "Send Message"}</button>
            </form>
          )}
        </Reveal>
      </section>
    </div>
  );
}
