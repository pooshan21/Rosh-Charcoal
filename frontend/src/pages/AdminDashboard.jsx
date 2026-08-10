import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";
import { client, rupee } from "../lib/api";

const STATUSES = ["New", "Contacted", "Quoted", "Confirmed", "In Progress", "Completed", "Declined"];
const ORDER_STATUSES = ["New", "Confirmed", "Paid", "Shipped", "Delivered", "Cancelled"];
const BACKEND = process.env.REACT_APP_BACKEND_URL;
const blankEdition = { id: "", title: "", size: "", edition: "", paper: "", price: "", image: "", order: 99, active: true };

export default function AdminDashboard() {
  const [auth, setAuth] = useState(null);
  const [tab, setTab] = useState("enquiries");
  const [enquiries, setEnquiries] = useState([]);
  const [sel, setSel] = useState(null);
  const [editions, setEditions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editing, setEditing] = useState(null);
  const nav = useNavigate();

  const loadAll = () => {
    client.get("/admin/enquiries").then((r) => setEnquiries(r.data)).catch(() => {});
    client.get("/admin/prints").then((r) => setEditions(r.data)).catch(() => {});
    client.get("/admin/print-orders").then((r) => setOrders(r.data)).catch(() => {});
  };
  useEffect(() => {
    client.get("/auth/me").then(() => { setAuth(true); loadAll(); }).catch(() => { setAuth(false); nav("/admin/login"); });
  }, []);

  const setEnqStatus = async (id, status) => {
    await client.patch(`/admin/enquiries/${id}`, { status });
    setEnquiries((p) => p.map((e) => (e.id === id ? { ...e, status } : e)));
    if (sel?.id === id) setSel((s) => ({ ...s, status }));
  };
  const setOrderStatus = async (id, status) => {
    await client.patch(`/admin/print-orders/${id}`, { status });
    setOrders((p) => p.map((o) => (o.id === id ? { ...o, status } : o)));
  };
  const saveEdition = async (e) => {
    e.preventDefault();
    const payload = { ...editing, price: editing.price === "" ? null : Number(editing.price), order: Number(editing.order) || 99 };
    await client.post("/admin/prints", payload);
    toast.success("Print edition saved");
    setEditing(null);
    client.get("/admin/prints").then((r) => setEditions(r.data));
  };
  const deleteEdition = async (id) => {
    if (!window.confirm("Delete this print edition?")) return;
    await client.delete(`/admin/prints/${id}`);
    setEditions((p) => p.filter((x) => x.id !== id));
  };
  const logout = async () => { await client.post("/auth/logout"); nav("/admin/login"); };

  if (auth === null) return <div className="min-h-screen flex items-center justify-center text-[#74726B]">Loading…</div>;

  const tabs = [["enquiries", "Enquiries"], ["editions", "Print Editions"], ["orders", "Print Orders"]];

  return (
    <div className="min-h-screen bg-[#F6F3EE]">
      <header className="border-b border-[#e0dbd1] px-8 h-16 flex items-center justify-between sticky top-0 bg-[#F6F3EE]/90 backdrop-blur z-20">
        <span className="flex items-center gap-3"><img src="/logo.jpg" alt="" className="w-9 h-9 rounded-full" /><span className="font-serif text-xl">Studio</span></span>
        <div className="flex gap-6 items-center">
          {tabs.map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} data-testid={`tab-${k}`} className={`text-sm link-underline ${tab === k ? "opacity-100" : "opacity-55 hover:opacity-100"}`}>{l}</button>
          ))}
          <button onClick={logout} className="text-sm link-underline text-[#8a4a3d]" data-testid="admin-logout">Sign out</button>
        </div>
      </header>

      <div className="max-w-[1300px] mx-auto px-8 py-12">
        {/* ENQUIRIES */}
        {tab === "enquiries" && (
          <>
            <h1 className="font-serif font-light text-4xl mb-8">Enquiries <span className="text-base text-[#74726B]">· {enquiries.length}</span></h1>
            {enquiries.length === 0 ? <p className="text-[#74726B] py-16">No enquiries yet.</p> : (
              <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8">
                <div className="border border-[#e0dbd1]">
                  {enquiries.map((e) => (
                    <button key={e.id} onClick={() => setSel(e)} className={`w-full text-left px-5 py-4 border-b border-[#e0dbd1] hover:bg-[#ECE8E1] transition-colors ${sel?.id === e.id ? "bg-[#ECE8E1]" : ""}`}>
                      <div className="flex justify-between items-baseline"><span className="font-medium">{e.name}</span><span className="font-mono-label !text-[0.6rem] !text-[#A38A5C]">{e.status}</span></div>
                      <p className="text-sm text-[#74726B] mt-1">{e.type} · {e.email}</p>
                    </button>
                  ))}
                </div>
                {sel && (
                  <div className="border border-[#e0dbd1] p-6 h-fit sticky top-24">
                    <h2 className="font-serif text-2xl">{sel.name}</h2>
                    <div className="mt-4 space-y-1.5 text-sm text-[#2b2b28]">
                      {[["Type", sel.type], ["Email", sel.email], ["Phone", sel.phone], ["Location", sel.location], ["Purpose", sel.purpose], ["Size", sel.size], ["Timeline", sel.timeline], ["Budget", sel.budget]].filter(([, v]) => v).map(([k, v]) => (
                        <p key={k}><span className="font-mono-label !text-[0.6rem]">{k}:</span> {v}</p>
                      ))}
                    </div>
                    {sel.message && <p className="mt-4 text-sm text-[#4a4a46] border-t border-[#e0dbd1] pt-4">{sel.message}</p>}
                    {sel.reference_files?.length > 0 && (
                      <div className="mt-4 border-t border-[#e0dbd1] pt-4">
                        <p className="label mb-2">Reference files</p>
                        {sel.reference_files.map((f, i) => <a key={i} href={`${BACKEND}/api/files/${f.path}`} target="_blank" rel="noreferrer" className="link-underline text-sm block">{f.filename}</a>)}
                      </div>
                    )}
                    <div className="mt-6 border-t border-[#e0dbd1] pt-4">
                      <p className="label mb-3">Status</p>
                      <div className="flex flex-wrap gap-2">
                        {STATUSES.map((s) => <button key={s} onClick={() => setEnqStatus(sel.id, s)} className={`text-xs px-3 py-1.5 border ${sel.status === s ? "bg-[#171614] text-[#F6F3EE] border-[#171614]" : "border-[#d3cec4] hover:border-[#171614]"}`}>{s}</button>)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* PRINT EDITIONS */}
        {tab === "editions" && (
          <>
            <div className="flex items-center justify-between mb-8">
              <h1 className="font-serif font-light text-4xl">Print Editions</h1>
              <button onClick={() => setEditing({ ...blankEdition })} className="btn-charcoal !py-2.5" data-testid="add-edition"><Plus size={15} /> Add edition</button>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {editions.map((e) => (
                <div key={e.id} className="border border-[#e0dbd1] p-4 flex gap-4">
                  <img src={e.image} alt="" className="w-20 h-24 object-cover bg-[#ECE8E1]" />
                  <div className="flex-1">
                    <p className="font-mono-label !text-[0.6rem]">{e.edition}{!e.active && " · hidden"}</p>
                    <h3 className="font-serif text-xl">{e.title}</h3>
                    <p className="text-sm text-[#74726B]">{e.size}</p>
                    <p className="font-serif mt-1">{e.price != null ? rupee(e.price) : "On request"}</p>
                    <div className="flex gap-4 mt-2">
                      <button onClick={() => setEditing({ ...e, price: e.price ?? "" })} className="link-underline text-sm">Edit</button>
                      <button onClick={() => deleteEdition(e.id)} className="link-underline text-sm text-[#8a4a3d] inline-flex items-center gap-1"><Trash2 size={13} /> Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {editing && (
              <div className="fixed inset-0 z-[300] bg-[#171614]/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                <form onSubmit={saveEdition} className="bg-[#F6F3EE] w-full max-w-lg p-8 my-8" data-testid="edition-form">
                  <h2 className="font-serif text-2xl mb-6">{editing.id ? "Edit" : "New"} print edition</h2>
                  <div className="grid gap-5">
                    <input required className="paper-input" placeholder="Title *" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
                    <div className="grid grid-cols-2 gap-5">
                      <input className="paper-input" placeholder="Size (e.g. A4 · 21×29cm)" value={editing.size} onChange={(e) => setEditing({ ...editing, size: e.target.value })} />
                      <input className="paper-input" placeholder="Edition (e.g. Limited to 25)" value={editing.edition} onChange={(e) => setEditing({ ...editing, edition: e.target.value })} />
                    </div>
                    <input className="paper-input" placeholder="Paper / material" value={editing.paper} onChange={(e) => setEditing({ ...editing, paper: e.target.value })} />
                    <div className="grid grid-cols-2 gap-5">
                      <input type="number" className="paper-input" placeholder="Price ₹ (blank = on request)" value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} />
                      <input type="number" className="paper-input" placeholder="Sort order" value={editing.order} onChange={(e) => setEditing({ ...editing, order: e.target.value })} />
                    </div>
                    <input className="paper-input" placeholder="Image URL" value={editing.image} onChange={(e) => setEditing({ ...editing, image: e.target.value })} />
                    <label className="flex gap-3 items-center text-sm"><input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} /> Visible on the Prints page</label>
                  </div>
                  <div className="flex gap-4 mt-7">
                    <button type="submit" className="btn-charcoal flex-1 justify-center" data-testid="save-edition">Save</button>
                    <button type="button" onClick={() => setEditing(null)} className="btn-charcoal flex-1 justify-center">Cancel</button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}

        {/* PRINT ORDERS */}
        {tab === "orders" && (
          <>
            <h1 className="font-serif font-light text-4xl mb-8">Print Orders <span className="text-base text-[#74726B]">· {orders.length}</span></h1>
            {orders.length === 0 ? <p className="text-[#74726B] py-16">No print orders yet.</p> : (
              <div className="space-y-4">
                {orders.map((o) => (
                  <div key={o.id} className="border border-[#e0dbd1] p-5">
                    <div className="flex flex-wrap justify-between gap-4">
                      <div>
                        <h3 className="font-serif text-xl">{o.edition_title} <span className="text-sm text-[#74726B]">× {o.quantity} · {o.framing}</span></h3>
                        <p className="text-sm text-[#74726B] mt-1">{o.name} · {o.email} · {o.phone}</p>
                        {o.address && <p className="text-sm text-[#74726B]">{o.address}</p>}
                        {o.notes && <p className="text-sm text-[#4a4a46] mt-2 italic">{o.notes}</p>}
                      </div>
                      <div className="text-right">
                        <p className="font-serif text-2xl">{o.total != null ? rupee(o.total) : "On confirmation"}</p>
                        <p className="font-mono-label !text-[0.6rem] mt-1">{new Date(o.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4 border-t border-[#e0dbd1] pt-4">
                      {ORDER_STATUSES.map((s) => <button key={s} onClick={() => setOrderStatus(o.id, s)} className={`text-xs px-3 py-1.5 border ${o.status === s ? "bg-[#171614] text-[#F6F3EE] border-[#171614]" : "border-[#d3cec4] hover:border-[#171614]"}`}>{s}</button>)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
