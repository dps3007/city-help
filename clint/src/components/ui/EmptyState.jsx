function EmptyState({ title, description, action, icon }) {
  return (
    <div className="surface flex flex-col items-center justify-center gap-4 px-6 py-14 text-center">
      {icon && <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-cyan-200">{icon}</div>}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="max-w-md text-sm leading-6 text-slate-300">{description}</p>
      </div>
      {action}
    </div>
  );
}

export default EmptyState;