import { useEffect, useState, FormEvent } from "react";
import toast from "react-hot-toast";
import { UploadCloud, X } from "lucide-react";
import Topbar from "../components/Topbar";
import GlassCard from "../components/GlassCard";
import api from "../lib/api";

interface Account {
  id: string;
  username: string;
}

export default function CreateBatch() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [accountId, setAccountId] = useState("");
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [location, setLocation] = useState("Lahore, Punjab, Pakistan");
  const [scheduledAt, setScheduledAt] = useState("");
  const [intervalMinutes, setIntervalMinutes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get<Account[]>("/api/instagram-accounts").then((res) => setAccounts(res.data));
  }, []);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    if (files.length + selected.length > 15) {
      toast.error("Max 15 images per batch");
      return;
    }
    setFiles((prev) => [...prev, ...selected]);
  };

  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (files.length < 5) {
      toast.error("Upload at least 5 images");
      return;
    }
    if (!accountId) {
      toast.error("Select an Instagram account");
      return;
    }

    setSubmitting(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await api.post("/api/batches/upload-image", formData);
        uploaded.push(res.data.storage_path);
      }

      await api.post("/api/batches", {
        instagram_account_id: accountId,
        caption,
        hashtags: hashtags.split(/\s+/).filter(Boolean),
        location,
        images: uploaded.map((storage_path, i) => ({ storage_path, order_index: i })),
        scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        interval_minutes: intervalMinutes ? Number(intervalMinutes) : null,
      });

      toast.success("Batch queued");
      setFiles([]);
      setCaption("");
      setHashtags("");
      setScheduledAt("");
      setIntervalMinutes("");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? "Failed to create batch");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Topbar title="Create Batch" />
      <div className="p-8 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <GlassCard>
            <label className="text-sm text-gray-400 block mb-2">Images (5–15)</label>
            <label className="flex flex-col items-center justify-center border border-dashed border-base-border rounded-xl py-10 cursor-pointer hover:border-maroon-400 transition-colors">
              <UploadCloud className="text-maroon-300 mb-2" size={28} />
              <span className="text-sm text-gray-400">Click to select images</span>
              <input type="file" accept="image/*" multiple hidden onChange={handleFiles} />
            </label>

            {files.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mt-4">
                {files.map((f, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={URL.createObjectURL(f)}
                      className="w-full h-20 object-cover rounded-lg border border-base-border"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute -top-2 -right-2 bg-base-black border border-base-border rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">{files.length} / 15 selected</p>
          </GlassCard>

          <GlassCard className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Instagram account</label>
              <select
                required
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full bg-base-black border border-base-border rounded-lg px-4 py-2.5 outline-none focus:border-maroon-400"
              >
                <option value="">Select account</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    @{a.username}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1">Caption</label>
              <textarea
                required
                maxLength={2200}
                rows={4}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full bg-base-black border border-base-border rounded-lg px-4 py-2.5 outline-none focus:border-maroon-400"
                placeholder="Write your caption…"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1">Hashtags</label>
              <input
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="#fashion #lahore #newdrop"
                className="w-full bg-base-black border border-base-border rounded-lg px-4 py-2.5 outline-none focus:border-maroon-400"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 block mb-1">Location</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-base-black border border-base-border rounded-lg px-4 py-2.5 outline-none focus:border-maroon-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Schedule time</label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full bg-base-black border border-base-border rounded-lg px-4 py-2.5 outline-none focus:border-maroon-400"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Repeat every (minutes)</label>
                <input
                  type="number"
                  min={15}
                  value={intervalMinutes}
                  onChange={(e) => setIntervalMinutes(e.target.value)}
                  placeholder="optional"
                  className="w-full bg-base-black border border-base-border rounded-lg px-4 py-2.5 outline-none focus:border-maroon-400"
                />
              </div>
            </div>
          </GlassCard>

          <button
            disabled={submitting}
            className="w-full bg-maroon-500 hover:bg-maroon-400 transition-colors rounded-lg py-3 font-semibold disabled:opacity-50"
          >
            {submitting ? "Queuing batch…" : "Queue batch"}
          </button>
        </form>
      </div>
    </div>
  );
}
