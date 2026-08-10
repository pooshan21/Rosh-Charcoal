import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { client } from "../lib/api";

const STATUSES = ["New", "Contacted", "Quoted", "Confirmed", "In Progress", "Completed", "Declined"];
const BACKEND = process.env.REACT_APP_BACKEND_URL;

export default function AdminDashboard() {
  const [enquiries, setEnquiries] = useState([]);
  const [auth, setAuth] = useState(null);
  const [sel, setSel] = useState(null);
  const nav = useNavigate();

  const load = () => client.get("/admin/enquiries").then((r) => setEnquiries(r.data));

  useEffect(() => {
    client.get("/auth/me").then(() => { setAuth(true); load(); }).catch(() => { setAuth(false); nav("/admin/login"); });
  }, []);

  const setStatus = async (id, status) => {
    await client.patch(`/admin/enquiries/${id}`, { status });
    setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
    if (sel?.id === id) setSel((s) => ({ ...s, status }));
  };
  const logout = async () => { await client.post("/auth/logout"); nav("/admin/login"); };

  if (auth === null) return <div className="min-h-screen flex items-center justify-center text-[#73736E]">Loading…</div>;

  return (
    <div className="min-h-screen bg-[#F6F3EE]">
      <header className="border-b border-[#e2ded5] px-8 h-16 flex items-center justify-between sticky top-0 bg-[#F6F3EE]/90 backdrop-blur z-10">
        <span className="font-serif text-xl">Rosh Charcoal · Studio</span>
        <button onClick={logout} className="link-underline text-sm" data-testid="admin-logout">Sign out</button>
      </header>
      <div className="max-w-[1300px] mx-auto px-8 py-12">
        <div className="flex items-baseline justify-between mb-8">
          <h1 className="font-serif font-light text-4xl">Enquiries</h1>
          <span className="text-sm text-[#73736E]">{enquiries.length} total</span>
        </div>
        {enquiries.length === 0 ? (
          <p className="text-[#73736E] py-16">No enquiries yet.</p>
        ) : (
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8">
            <div className="border border-[#e2ded5]">
              {enquiries.map((e) => (
                <button key={e.id} onClick={() => setSel(e)} className={`w-full text-left px-5 py-4 border-b border-[#e2ded5] hover:bg-[#EAE7E1] transition-colors ${sel?.id === e.id ? "bg-[#EAE7E1]" : ""}`}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-medium">{e.name}</span>
                    <span className="text-[0.7rem] font-mono-label uppercase text-[#A38A5C]">{e.status}</span>
                  </div>
                  <p className="text-sm text-[#73736E] mt-1">{e.type} · {e.email}</p>
                  <p className="text-xs text-[#a8a599] mt-1">{new Date(e.created_at).toLocaleString()}</p>
                </button>
              ))}
            </div>
            {sel && (
              <div className="border border-[#e2ded5] p-6 h-fit sticky top-24">
                <h2 className="font-serif text-2xl">{sel.name}</h2>
                <div className="mt-4 space-y-1.5 text-sm text-[#2b2b28]">
                  {[["Type", sel.type], ["Email", sel.email], ["Phone", sel.phone], ["Contact", sel.contact_method], ["Location", sel.location], ["Purpose", sel.purpose], ["Size", sel.size], ["Subjects", sel.subjects], ["Framing", sel.framing], ["Timeline", sel.timeline], ["Budget", sel.budget], ["Subject", sel.subject], ["Source", sel.source]].filter(([, v]) => v).map(([k, v]) => (
                    <p key={k}><span className="text-[#a8a599] font-mono-label uppercase text-xs">{k}:</span> {v}</p>
                  ))}
                </div>
                {sel.message && <p className="mt-4 text-sm text-[#4a4a46] border-t border-[#e2ded5] pt-4">{sel.message}</p>}
                {sel.reference_files?.length > 0 && (
                  <div className="mt-4 border-t border-[#e2ded5] pt-4">
                    <p className="label mb-2">Reference files</p>
                    {sel.reference_files.map((f, i) => (
                      <a key={i} href={`${BACKEND}/api/files/${f.path}`} target="_blank" rel="noreferrer" className="link-underline text-sm block">{f.filename}</a>
                    ))}
                  </div>
                )}
                <div className="mt-6 border-t border-[#e2ded5] pt-4">
                  <p className="label mb-3">Status</p>
                  <div className="flex flex-wrap gap-2">
                    {STATUSES.map((s) => (
                      <button key={s} onClick={() => setStatus(sel.id, s)} className={`text-xs px-3 py-1.5 border ${sel.status === s ? "bg-[#171614] text-[#F6F3EE] border-[#171614]" : "border-[#cfcbc2] hover:border-[#171614]"}`}>{s}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
