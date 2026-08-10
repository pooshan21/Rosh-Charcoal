import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { client } from "../lib/api";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault(); setErr(""); setBusy(true);
    try {
      await client.post("/auth/login", { email, password });
      nav("/admin");
    } catch (e) {
      setErr(e.response?.data?.detail || "Login failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-[#171614] text-[#F6F3EE] flex items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-sm" data-testid="admin-login-form">
        <div className="font-serif text-3xl">Rosh <span className="italic text-[#a8a599]">Charcoal</span></div>
        <p className="label !text-[#6f6d64] mt-2">Studio Admin</p>
        <div className="mt-10 space-y-7">
          <input className="paper-input !text-[#F6F3EE] !border-b-[#4a4a46]" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} data-testid="admin-email" />
          <input type="password" className="paper-input !text-[#F6F3EE] !border-b-[#4a4a46]" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} data-testid="admin-password" />
        </div>
        {err && <p className="text-[#c98b7d] text-sm mt-4">{err}</p>}
        <button disabled={busy} className="btn-charcoal inverse w-full justify-center mt-9 disabled:opacity-50" data-testid="admin-login-submit">{busy ? "Signing in…" : "Sign In"}</button>
      </form>
    </div>
  );
}
