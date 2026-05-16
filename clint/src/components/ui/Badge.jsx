const STATUS_VARIANTS = {
  SUBMITTED: "bg-slate-500/10 text-slate-200 border-slate-400/15",
  VERIFIED: "bg-sky-500/10 text-sky-200 border-sky-400/20",
  ASSIGNED: "bg-amber-500/10 text-amber-100 border-amber-400/20",
  IN_PROGRESS: "bg-orange-500/10 text-orange-100 border-orange-400/20",
  RESOLVED: "bg-emerald-500/10 text-emerald-100 border-emerald-400/20",
  CLOSED: "bg-violet-500/10 text-violet-100 border-violet-400/20",
  default: "bg-white/8 text-slate-200 border-white/10",
};

function Badge({ status, label, tone = "default", className = "" }) {
  const normalizedTone = tone === "status" ? status : tone;
  const style = STATUS_VARIANTS[normalizedTone] || STATUS_VARIANTS.default;

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wide ${style} ${className}`}>
      {label || status || "Unknown"}
    </span>
  );
}

export default Badge;