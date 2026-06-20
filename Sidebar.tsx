import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Instagram,
  ImagePlus,
  CalendarClock,
  ListChecks,
  History,
  Settings as SettingsIcon,
  Spline,
} from "lucide-react";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/accounts", label: "Accounts", icon: Instagram },
  { to: "/create-batch", label: "Create Batch", icon: ImagePlus },
  { to: "/calendar", label: "Scheduler", icon: CalendarClock },
  { to: "/queue", label: "Queue", icon: ListChecks },
  { to: "/history", label: "History", icon: History },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen sticky top-0 border-r border-base-border bg-base-panel/60 backdrop-blur-xl flex flex-col">
      <div className="flex items-center gap-2 px-6 py-6">
        <Spline className="text-maroon-400" size={26} />
        <span className="font-display font-bold text-lg">ABD Post Pilot</span>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-maroon-500/20 text-maroon-200 border border-maroon-500/30"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-6 py-4 text-xs text-gray-500 border-t border-base-border">
        🕷️ v1.0.0 — Official Graph API only
      </div>
    </aside>
  );
}
