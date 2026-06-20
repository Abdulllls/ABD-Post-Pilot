import { useEffect, useState, FormEvent } from "react";
import toast from "react-hot-toast";
import { Instagram, Trash2, Power, Plus } from "lucide-react";
import Topbar from "../components/Topbar";
import GlassCard from "../components/GlassCard";
import api from "../lib/api";

interface Account {
  id: string;
  ig_user_id: string;
  username: string;
  token_expires_at: string;
  is_active: boolean;
}

export default function AccountsManager() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ig_user_id: "", username: "", access_token: "", token_expires_at: "" });
  const [saving, setSaving] = useState(false);

  const load = () => api.get<Account[]>("/api/instagram-accounts").then((res) => setAccounts(res.data));

  useEffect(() => {
    load();
  }, []);

  const handleConnect = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/api/instagram-accounts", form);
      toast.success("Instagram account connected");
      setShowForm(false);
      setForm({ ig_user_id: "", username: "", access_token: "", token_expires_at: "" });
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? "Could not connect account");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    await api.delete(`/api/instagram-accounts/${id}`);
    toast.success("Account removed");
    load();
  };

  const toggle = async (id: string) => {
    await api.patch(`/api/instagram-accounts/${id}/toggle`);
    load();
  };

  return (
    <div>
      <Topbar title="Instagram Accounts" />
      <div className="p-8 space-y-6">
        <div className="flex justify-end">
          <button
            onClick={() => setShowForm((s) => !s)}
            className="flex items-center gap-2 bg-maroon-500 hover:bg-maroon-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} /> Connect account
          </button>
        </div>

        {showForm && (
          <GlassCard strong>
            <form onSubmit={handleConnect} className="grid md:grid-cols-2 gap-4">
              <input
                required
                placeholder="Instagram Business Account ID"
                value={form.ig_user_id}
                onChange={(e) => setForm({ ...form, ig_user_id: e.target.value })}
                className="bg-base-black border border-base-border rounded-lg px-4 py-2.5 outline-none focus:border-maroon-400"
              />
              <input
                required
                placeholder="Username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="bg-base-black border border-base-border rounded-lg px-4 py-2.5 outline-none focus:border-maroon-400"
              />
              <input
                required
                placeholder="Access Token (from Meta OAuth)"
                value={form.access_token}
                onChange={(e) => setForm({ ...form, access_token: e.target.value })}
                className="bg-base-black border border-base-border rounded-lg px-4 py-2.5 outline-none focus:border-maroon-400 md:col-span-2"
              />
              <input
                required
                type="datetime-local"
                value={form.token_expires_at}
                onChange={(e) => setForm({ ...form, token_expires_at: e.target.value })}
                className="bg-base-black border border-base-border rounded-lg px-4 py-2.5 outline-none focus:border-maroon-400"
              />
              <button
                disabled={saving}
                className="bg-maroon-500 hover:bg-maroon-400 rounded-lg py-2.5 font-medium transition-colors disabled:opacity-50"
              >
                {saving ? "Verifying…" : "Verify & connect"}
              </button>
            </form>
          </GlassCard>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {accounts.map((acc) => (
            <GlassCard key={acc.id}>
              <div className="flex items-center gap-3 mb-3">
                <Instagram className="text-maroon-300" size={20} />
                <span className="font-medium">@{acc.username}</span>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Token expires {new Date(acc.token_expires_at).toLocaleDateString()}
              </p>
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    acc.is_active ? "bg-green-500/15 text-green-400" : "bg-gray-500/15 text-gray-400"
                  }`}
                >
                  {acc.is_active ? "Active" : "Paused"}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => toggle(acc.id)} className="text-gray-400 hover:text-maroon-200">
                    <Power size={16} />
                  </button>
                  <button onClick={() => remove(acc.id)} className="text-gray-400 hover:text-red-400">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
          {accounts.length === 0 && (
            <p className="text-gray-500 text-sm col-span-full">No accounts connected yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
