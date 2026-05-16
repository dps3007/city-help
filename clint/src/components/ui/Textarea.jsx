function Textarea({ className = "", label, hint, error, ...props }) {
  const id = props.id || props.name;

  return (
    <label className="block space-y-2">
      {label && <span className="text-sm font-medium text-slate-200">{label}</span>}
      <textarea
        id={id}
        {...props}
        className={`min-h-32 w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 shadow-sm outline-none transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/20 ${className}`}
      />
      {hint && !error && <span className="text-xs text-slate-400">{hint}</span>}
      {error && <span className="text-xs text-rose-300">{error}</span>}
    </label>
  );
}

export default Textarea;