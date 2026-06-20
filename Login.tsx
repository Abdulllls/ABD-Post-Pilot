import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Spline } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="glass-strong w-full max-w-md p-8">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <Spline className="text-maroon-400" size={24} />
          <span className="font-display font-bold text-lg">ABD Post Pilot</span>
        </div>

        <h2 className="font-display text-2xl font-semibold mb-1">Welcome back</h2>
        <p className="text-gray-400 text-sm mb-6">Log in to manage your scheduled posts.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 bg-base-black border border-base-border rounded-lg px-4 py-2.5 outline-none focus:border-maroon-400"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 bg-base-black border border-base-border rounded-lg px-4 py-2.5 outline-none focus:border-maroon-400"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-maroon-500 hover:bg-maroon-400 transition-colors rounded-lg py-2.5 font-medium disabled:opacity-50"
          >
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="text-sm text-gray-400 mt-6 text-center">
          No account?{" "}
          <Link to="/signup" className="text-maroon-200 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
