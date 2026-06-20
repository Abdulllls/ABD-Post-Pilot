import { Link } from "react-router-dom";
import { Spline, Layers, CalendarClock, ShieldCheck, ArrowRight } from "lucide-react";

const features = [
  {
    icon: Layers,
    title: "Multi-account batches",
    desc: "Connect every Instagram Business account you manage and queue 5–15 image batches per drop.",
  },
  {
    icon: CalendarClock,
    title: "Smart scheduling",
    desc: "One-off slots or recurring intervals. The worker checks the queue every minute, on time, every time.",
  },
  {
    icon: ShieldCheck,
    title: "Official API only",
    desc: "Built entirely on Meta's Graph API with OAuth consent — no scraping, no shortcuts, no banned accounts.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      <nav className="flex items-center justify-between px-8 py-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <Spline className="text-maroon-400" size={26} />
          <span className="font-display font-bold text-lg">ABD Post Pilot</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm text-gray-300 hover:text-white">
            Log in
          </Link>
          <Link
            to="/signup"
            className="text-sm bg-maroon-500 hover:bg-maroon-400 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      <section className="max-w-4xl mx-auto text-center px-6 pt-20 pb-24">
        <span className="text-xs uppercase tracking-widest text-maroon-200 font-medium">
          Instagram automation, done right
        </span>
        <h1 className="font-display text-5xl md:text-6xl font-extrabold mt-5 leading-tight">
          Queue the batch.<br /> Walk away. <span className="text-maroon-400">It still posts.</span>
        </h1>
        <p className="text-gray-400 mt-6 text-lg max-w-2xl mx-auto">
          ABD Post Pilot schedules and publishes Instagram batches across every account you manage —
          built on Meta's official Graph API, with a queue you can actually trust.
        </p>
        <Link
          to="/signup"
          className="inline-flex items-center gap-2 mt-8 bg-maroon-500 hover:bg-maroon-400 px-6 py-3 rounded-xl font-semibold transition-colors"
        >
          Start scheduling <ArrowRight size={18} />
        </Link>
      </section>

      <section className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-6 pb-24">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="glass p-7">
            <Icon className="text-maroon-300 mb-4" size={28} />
            <h3 className="font-display font-semibold text-lg mb-2">{title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
