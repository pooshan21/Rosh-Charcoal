import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Upload, X, Check, MessageCircle, Mail } from "lucide-react";
import { client, CONTACT, waLink } from "../lib/api";
import { Reveal } from "../components/Reveal";

const steps = [
  ["Share", "Send a reference photograph and tell me about the person and the moment."],
  ["Quote", "I review the request and confirm a quote and timeline."],
  ["Confirm", "You approve the commission and we agree payment terms."],
  ["Create", "I hand-draw the portrait, with optional progress updates."],
  ["Deliver", "The finished piece is carefully packaged and shipped to you."],
];

const empty = { name: "", email: "", phone: "", contact_method: "WhatsApp", location: "", purpose: "", size: "", subjects: "1", framing: "No preference", timeline: "", budget: "", message: "", source: "", consent: false, updates_optin: false };

export default function Commissions() {
  const [form, setForm] = useState(empty);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [hp, setHp] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const onFiles = async (e) => {
    const chosen = Array.from(e.target.files || []);
    const ok = ["jpg", "jpeg", "png", "webp", "pdf"];
    setUploading(true);
    for (const file of chosen) {
      const ext = file.name.split(".").pop().toLowerCase();
      if (!ok.includes(ext)) { toast.error(`${file.name}: unsupported format`); continue; }
      if (file.size > 15 * 1024 * 1024) { toast.error(`${file.name}: exceeds 15MB`); continue; }
      try {
        const fd = new FormData(); fd.append("file", file);
        const { data } = await client.post("/upload/reference", fd);
        setFiles((prev) => [...prev, data]);
      } catch { toast.error(`${file.name}: upload failed`); }
    }
    setUploading(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.consent) { toast.error("Please accept the privacy policy."); return; }
    setSubmitting(true);
    try {
      await client.post("/enquiries", { ...form, type: "commission", reference_files: files, honeypot: hp });
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      toast.error("Something went wrong. Please email or WhatsApp us directly.");
    } finally { setSubmitting(false); }
  };

  if (done) return (
    <div className="pt-[160px] pb-40 px-6 text-center max-w-xl mx-auto">
      <div className="w-16 h-16 border border-[#171614] rounded-full flex items-center justify-center mx-auto"><Check size={28} /></div>
      <h1 className="font-serif font-light text-4xl md:text-5xl mt-8">Thank you for sharing your idea.</h1>
      <p className="mt-6 text-[#4a4a46] leading-relaxed">Your commission enquiry has been received, and Rosh Charcoal will get back to you soon.</p>
      <Link to="/gallery" className="btn-charcoal mt-10">Browse the Gallery</Link>
    </div>
  );

  return (
    <div className="pt-[84px]">
      <section className="relative bg-[#171614] text-[#F6F3EE] px-6 md:px-10 pt-24 pb-28 overflow-hidden">
        <div className="max-w-[1300px] mx-auto grid md:grid-cols-2 gap-14 items-center">
          <Reveal>
            <p className="label !text-[#a8a599]">Commissions</p>
            <h1 className="font-serif font-light text-5xl md:text-7xl mt-5 leading-[1.0]">Commission a portrait with a story</h1>
            <p className="mt-7 text-[#cfccc4] max-w-md leading-relaxed">Rosh Charcoal creates hand-drawn charcoal and graphite portraits from meaningful reference photographs, for clients worldwide. Your memories are handled with care.</p>
          </Reveal>
          <Reveal delay={0.12}>
            <img src="https://images.unsplash.com/photo-1611414779790-abb3e1ec462e?crop=entropy&cs=srgb&fm=jpg&q=90&w=1000" alt="Artist drawing a charcoal portrait" className="w-full h-[460px] object-cover" />
          </Reveal>
        </div>
      </section>

      <section className="px-6 md:px-10 py-24 max-w-[1300px] mx-auto">
        <Reveal><h2 className="font-serif font-light text-4xl mb-14">How it works</h2></Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {steps.map((s, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <span className="font-mono-label text-[#A38A5C]">0{i + 1}</span>
              <h3 className="font-serif text-2xl mt-3">{s[0]}</h3>
              <p className="text-[#73736E] text-sm mt-2 leading-relaxed">{s[1]}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-[#EAE7E1] px-6 md:px-10 py-20">
        <div className="max-w-[1000px] mx-auto grid md:grid-cols-2 gap-14">
          <Reveal>
            <h2 className="font-serif text-3xl">Reference photo guidelines</h2>
            <p className="mt-5 text-[#4a4a46] leading-relaxed">Clear, well-lit, high-resolution photographs are ideal. Faces should not be blurred or heavily filtered, and the expression should be visible. I may request alternate references before confirming.</p>
            <p className="mt-4 text-[#4a4a46] leading-relaxed">For memorial or composite portraits, describe your idea in the notes and I'll assess feasibility with care.</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="font-serif text-3xl">Pricing preview</h2>
            <p className="mt-5 text-[#4a4a46] leading-relaxed">Portraits start from ₹9,000 for a mini study and scale with size, subjects and detail.</p>
            <Link to="/pricing" className="link-underline text-sm mt-4 inline-block">View full pricing →</Link>
          </Reveal>
        </div>
      </section>

      <section className="px-6 md:px-10 py-24 max-w-[820px] mx-auto">
        <Reveal><h2 className="font-serif font-light text-4xl mb-3">Start your commission</h2><p className="text-[#73736E] mb-12">Tell me about the portrait you have in mind.</p></Reveal>
        <form onSubmit={submit} data-testid="commission-form" className="space-y-8">
          <input type="text" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} className="hidden" aria-hidden />
          <div className="grid md:grid-cols-2 gap-8">
            <input required className="paper-input" placeholder="Full name *" value={form.name} onChange={set("name")} data-testid="field-name" />
            <input required type="email" className="paper-input" placeholder="Email address *" value={form.email} onChange={set("email")} data-testid="field-email" />
            <input required className="paper-input" placeholder="Phone / WhatsApp *" value={form.phone} onChange={set("phone")} data-testid="field-phone" />
            <select className="paper-input" value={form.contact_method} onChange={set("contact_method")}><option>WhatsApp</option><option>Email</option><option>Phone call</option></select>
            <input className="paper-input" placeholder="City / Country" value={form.location} onChange={set("location")} />
            <input className="paper-input" placeholder="Purpose (gift, memorial, wedding…)" value={form.purpose} onChange={set("purpose")} />
            <input className="paper-input" placeholder="Preferred size" value={form.size} onChange={set("size")} />
            <select className="paper-input" value={form.subjects} onChange={set("subjects")}><option value="1">1 subject</option><option value="2">2 subjects</option><option value="3+">3 or more</option></select>
            <select className="paper-input" value={form.framing} onChange={set("framing")}><option>No preference</option><option>Framed</option><option>Unframed</option></select>
            <input className="paper-input" placeholder="Desired delivery timeline" value={form.timeline} onChange={set("timeline")} />
            <input className="paper-input" placeholder="Budget range (optional)" value={form.budget} onChange={set("budget")} />
            <input className="paper-input" placeholder="How did you find Rosh Charcoal?" value={form.source} onChange={set("source")} />
          </div>
          <textarea className="paper-input resize-none" rows={4} placeholder="Tell me about the person and the story…" value={form.message} onChange={set("message")} data-testid="field-message" />

          <div>
            <label className="btn-charcoal cursor-pointer inline-flex" data-testid="upload-trigger">
              <Upload size={16} /> {uploading ? "Uploading…" : "Add reference images"}
              <input type="file" multiple accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={onFiles} className="hidden" />
            </label>
            <p className="text-xs text-[#a8a599] mt-2">JPG, PNG, WEBP or PDF · max 15MB each · stored privately</p>
            {files.length > 0 && (
              <ul className="mt-4 space-y-2">
                {files.map((f, i) => (
                  <li key={i} className="flex items-center justify-between text-sm border border-[#e2ded5] px-4 py-2">
                    <span className="truncate">{f.filename}</span>
                    <button type="button" onClick={() => setFiles((p) => p.filter((_, x) => x !== i))} aria-label="Remove"><X size={16} /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <label className="flex gap-3 items-start text-sm text-[#4a4a46]">
            <input type="checkbox" required checked={form.consent} onChange={set("consent")} className="mt-1" data-testid="field-consent" />
            <span>I agree to the <Link to="/privacy" className="link-underline">Privacy Policy</Link> and consent to being contacted about my enquiry. *</span>
          </label>
          <label className="flex gap-3 items-start text-sm text-[#4a4a46]">
            <input type="checkbox" checked={form.updates_optin} onChange={set("updates_optin")} className="mt-1" />
            <span>Send me occasional updates about new work (optional).</span>
          </label>

          <button type="submit" disabled={submitting} className="btn-charcoal w-full justify-center !py-4 disabled:opacity-50" data-testid="submit-commission">
            {submitting ? "Sending…" : "Send Commission Enquiry"}
          </button>

          <p className="text-center text-sm text-[#73736E]">Prefer to talk first? <a href={waLink("Hello Rosh, I'd like to commission a portrait.")} target="_blank" rel="noreferrer" className="link-underline inline-flex items-center gap-1"><MessageCircle size={14} /> WhatsApp</a> or <a href={`mailto:${CONTACT.email}`} className="link-underline inline-flex items-center gap-1"><Mail size={14} /> email</a>.</p>
        </form>
      </section>
    </div>
  );
}
