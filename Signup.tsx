import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Spline } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").upsert({ id: data.user.id, full_name: fullName });
    }

    setLoading(false);
    toast.success("Account created — check your inbox to confirm.");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="glass-strong w-full max-w-md p-8">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <Spline className="text-maroon-400" size={24} />
          <span className="font-display font-bold text-lg">ABD Post Pilot</span>
        </div>

        <h2 className="font-display text-2xl font-semibold mb-1">Create your account</h2>
        <p className="text-gray-400 text-sm mb-6">Start scheduling Instagram batches in minutes.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400">Full name</label>
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full mt-1 bg-base-black border border-base-border rounded-lg px-4 py-2.5 outline-none focus:border-maroon-400"
              placeholder="Abdul Rehman"
            />
          </div>
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
              minLength={6}
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
            {loading ? "Creating account…" : "Sign up"}
          </button>
        </form>

        <p className="text-sm text-gray-400 mt-6 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-maroon-200 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
