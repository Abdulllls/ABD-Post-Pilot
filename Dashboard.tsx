import { useEffect, useState } from "react";
import { Send, Clock, CheckCircle2, XCircle, Instagram } from "lucide-react";
import Topbar from "../components/Topbar";
import StatCard from "../components/StatCard";
import GlassCard from "../components/GlassCard";
import api from "../lib/api";

interface Stats {
  total_posts: number;
  scheduled_posts: number;
  published_posts: number;
  failed_posts: number;
  connected_accounts: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get<Stats>("/api/dashboard/stats").then((res) => setStats(res.data));
  }, []);

  return (
    <div>
      <Topbar title="Dashboard" />
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
          <StatCard label="Total Posts" value={stats?.total_posts ?? "—"} icon={Send} />
          <StatCard label="Scheduled" value={stats?.scheduled_posts ?? "—"} icon={Clock} accent />
          <StatCard label="Published" value={stats?.published_posts ?? "—"} icon={CheckCircle2} />
          <StatCard label="Failed" value={stats?.failed_posts ?? "—"} icon={XCircle} />
          <StatCard label="Connected Accounts" value={stats?.connected_accounts ?? "—"} icon={Instagram} />
        </div>

        <GlassCard>
          <h3 className="font-display font-semibold mb-2">Quick start</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Connect an Instagram Business account, then head to{" "}
            <span className="text-maroon-200">Create Batch</span> to upload 5–15 images, write your
            caption, and pick a schedule. The worker checks the queue every minute and publishes through
            Meta's official Graph API automatically.
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
