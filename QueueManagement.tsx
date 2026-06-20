import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { RefreshCw, Trash2 } from "lucide-react";
import Topbar from "../components/Topbar";
import GlassCard from "../components/GlassCard";
import api from "../lib/api";

interface QueueItem {
  id: string;
  batch_id: string;
  status: string;
  scheduled_at: string;
  attempts: number;
  last_error?: string;
}

const statusColor: Record<string, string> = {
  pending: "bg-gray-500/15 text-gray-400",
  scheduled: "bg-blue-500/15 text-blue-300",
  publishing: "bg-yellow-500/15 text-yellow-300",
  published: "bg-green-500/15 text-green-400",
  failed: "bg-red-500/15 text-red-400",
};

export default function QueueManagement() {
  const [items, setItems] = useState<QueueItem[]>([]);

  const load = () => api.get<QueueItem[]>("/api/queue").then((res) => setItems(res.data));

  useEffect(() => {
    load();
  }, []);

  const retry = async (id: string) => {
    await api.post(`/api/queue/${id}/retry`);
    toast.success("Queued for retry");
    load();
  };

  const cancel = async (id: string) => {
    await api.delete(`/api/queue/${id}`);
    toast.success("Removed from queue");
    load();
  };

  return (
    <div>
      <Topbar title="Queue Management" />
      <div className="p-8">
        <GlassCard className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-gray-400 border-b border-base-border">
              <tr>
                <th className="text-left px-5 py-3">Scheduled at</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Attempts</th>
                <th className="text-left px-5 py-3">Error</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-base-border/50">
                  <td className="px-5 py-3">{new Date(item.scheduled_at).toLocaleString()}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColor[item.status]}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">{item.attempts}</td>
                  <td className="px-5 py-3 text-gray-500 max-w-xs truncate">{item.last_error ?? "—"}</td>
                  <td className="px-5 py-3 flex gap-3 justify-end">
                    {item.status === "failed" && (
                      <button onClick={() => retry(item.id)} className="text-gray-400 hover:text-maroon-200">
                        <RefreshCw size={16} />
                      </button>
                    )}
                    <button onClick={() => cancel(item.id)} className="text-gray-400 hover:text-red-400">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-500">
                    Queue is empty.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </GlassCard>
      </div>
    </div>
  );
}
