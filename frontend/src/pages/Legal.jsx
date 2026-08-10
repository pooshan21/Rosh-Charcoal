import { Reveal } from "../components/Reveal";
import { CONTACT } from "../lib/api";

const privacy = [
  ["Who we are", "Rosh Charcoal is an independent charcoal-portrait practice operating from India and accepting enquiries worldwide. This policy explains how we handle the information you share with us."],
  ["What we collect", "When you submit an enquiry or commission request, we collect the details you provide — your name, email, phone/WhatsApp number, location, and any reference photographs or notes you upload."],
  ["How we use it", "Your information is used solely to respond to your enquiry, prepare a quote, and complete a commissioned artwork. Reference photographs are stored privately and are never published or indexed by search engines."],
  ["Reference photographs", "Uploaded reference files are held in secure, private storage accessible only to the artist. They are never added to the public gallery or shared with third parties."],
  ["Your choices", "You may ask us to update or delete your information at any time by writing to " + CONTACT.email + ". Marketing updates are opt-in only and you can unsubscribe whenever you wish."],
  ["Contact", "Questions about privacy? Email " + CONTACT.email + "."],
];
const terms = [
  ["Commission process", "All commissions begin with an enquiry. A quote and estimated timeline are confirmed before any work starts. Commissions are secured with an advance, with the balance due before dispatch."],
  ["Reference material", "You confirm that you have the right to use any reference photographs you provide. The artist may request alternative references before accepting a commission."],
  ["Creative approach", "Each portrait is hand-drawn and interpreted by the artist. Minor adjustments are possible in the early stages; significant changes may affect the quote and timeline."],
  ["Timelines", "Timelines are estimates and vary with size and detail. The artist will keep you informed of progress and any changes."],
  ["Shipping & risk", "Artworks are shipped with protective, insured packaging. Delivery timelines depend on destination and customs. Charcoal is delicate — care guidance is provided with every piece."],
  ["Copyright", "The artist retains copyright of all artworks and may display completed commissions as part of the portfolio unless you request otherwise in writing."],
];

export default function Legal({ kind }) {
  const isP = kind === "privacy";
  const data = isP ? privacy : terms;
  return (
    <div className="pt-[84px]">
      <section className="px-6 md:px-10 max-w-[820px] mx-auto pt-20 pb-28">
        <Reveal>
          <p className="label">{isP ? "Legal" : "Commissions"}</p>
          <h1 className="font-serif font-light text-5xl md:text-6xl mt-4">{isP ? "Privacy Policy" : "Terms & Commission Policy"}</h1>
        </Reveal>
        <div className="mt-14 space-y-12">
          {data.map(([h, b], i) => (
            <Reveal key={i} delay={i * 0.03}>
              <h2 className="font-serif text-2xl">{h}</h2>
              <p className="mt-3 text-[#4a4a46] leading-relaxed">{b}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
