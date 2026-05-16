function Select({ className = "", label, hint, error, children, ...props }) {
  const id = props.id || props.name;

  return (
    <label className="block space-y-2">
      {label && <span className="text-sm font-medium text-slate-200">{label}</span>}
      <select
        id={id}
        {...props}
        className={`w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-100 shadow-sm outline-none transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/20 ${className}`}
      >
        {children}
      </select>
      {hint && !error && <span className="text-xs text-slate-400">{hint}</span>}
      {error && <span className="text-xs text-rose-300">{error}</span>}
    </label>
  );
}

export default Select;