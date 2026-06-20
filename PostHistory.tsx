import { useEffect, useState } from "react";
import Topbar from "../components/Topbar";
import GlassCard from "../components/GlassCard";
import api from "../lib/api";

interface HistoryItem {
  id: string;
  ig_media_id: string;
  status: string;
  created_at: string;
}

export default function PostHistory() {
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    api.get<HistoryItem[]>("/api/history").then((res) => setItems(res.data));
  }, []);

  return (
    <div>
      <Topbar title="Post History" />
      <div className="p-8">
        <GlassCard className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-gray-400 border-b border-base-border">
              <tr>
                <th className="text-left px-5 py-3">Published at</th>
                <th className="text-left px-5 py-3">Media ID</th>
                <th className="text-left px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-base-border/50">
                  <td className="px-5 py-3">{new Date(item.created_at).toLocaleString()}</td>
                  <td className="px-5 py-3 text-gray-400">{item.ig_media_id}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-green-500/15 text-green-400">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-5 py-8 text-center text-gray-500">
                    No posts published yet.
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
