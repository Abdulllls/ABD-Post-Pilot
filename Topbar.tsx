import { useAuth } from "../context/AuthContext";
import { LogOut } from "lucide-react";

export default function Topbar({ title }: { title: string }) {
  const { user, signOut } = useAuth();

  return (
    <header className="flex items-center justify-between px-8 py-5 border-b border-base-border bg-base-black/40 backdrop-blur sticky top-0 z-10">
      <h1 className="text-xl font-display font-semibold">{title}</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-400">{user?.email}</span>
        <button
          onClick={signOut}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-maroon-200 transition-colors"
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </header>
  );
}
