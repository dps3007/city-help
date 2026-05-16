import { motion as Motion } from "framer-motion";

function StatCard({ title, value, delta, icon, tone = "cyan" }) {
  const tones = {
    cyan: "from-cyan-400/20 to-blue-500/10 text-cyan-100",
    blue: "from-blue-400/20 to-indigo-500/10 text-blue-100",
    emerald: "from-emerald-400/20 to-teal-500/10 text-emerald-100",
    amber: "from-amber-400/20 to-orange-500/10 text-amber-100",
    rose: "from-rose-400/20 to-pink-500/10 text-rose-100",
  };

  return (
    <Motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className={`surface-soft relative overflow-hidden p-5 ${tones[tone] || tones.cyan}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-60" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
          {delta && <p className="mt-2 text-xs text-slate-300">{delta}</p>}
        </div>
        {icon && <div className="rounded-2xl border border-white/10 bg-white/6 p-3 text-cyan-200">{icon}</div>}
      </div>
    </Motion.div>
  );
}

export default StatCard;
