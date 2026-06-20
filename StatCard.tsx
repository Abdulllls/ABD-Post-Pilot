import { LucideIcon } from "lucide-react";
import GlassCard from "./GlassCard";

export default function StatCard({
  label,
  value,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent?: boolean;
}) {
  return (
    <GlassCard className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-3xl font-display font-bold mt-1">{value}</p>
      </div>
      <div
        className={`p-3 rounded-xl ${
          accent ? "bg-maroon-500/20 text-maroon-200" : "bg-white/5 text-gray-300"
        }`}
      >
        <Icon size={24} />
      </div>
    </GlassCard>
  );
}
