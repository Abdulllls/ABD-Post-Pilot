import { useState, FormEvent } from "react";
import toast from "react-hot-toast";
import Topbar from "../components/Topbar";
import GlassCard from "../components/GlassCard";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";

export default function Settings() {
  const { user } = useAuth();
  const [defaultLocation, setDefaultLocation] = useState("Lahore, Punjab, Pakistan");
  const [notifyOnFailure, setNotifyOnFailure] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await supabase.from("settings").upsert({
      user_id: user?.id,
      default_location: defaultLocation,
      notify_on_failure: notifyOnFailure,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    toast.success("Settings saved");
  };

  return (
    <div>
      <Topbar title="Settings" />
      <div className="p-8 max-w-xl">
        <form onSubmit={handleSave} className="space-y-6">
          <GlassCard className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Default post location</label>
              <input
                value={defaultLocation}
                onChange={(e) => setDefaultLocation(e.target.value)}
                className="w-full bg-base-black border border-base-border rounded-lg px-4 py-2.5 outline-none focus:border-maroon-400"
              />
            </div>

            <label className="flex items-center gap-3 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={notifyOnFailure}
                onChange={(e) => setNotifyOnFailure(e.target.checked)}
                className="accent-maroon-500"
              />
              Notify me when a scheduled post fails
            </label>
          </GlassCard>

          <button
            disabled={saving}
            className="bg-maroon-500 hover:bg-maroon-400 transition-colors rounded-lg px-6 py-2.5 font-medium disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save settings"}
          </button>
        </form>
      </div>
    </div>
  );
}
