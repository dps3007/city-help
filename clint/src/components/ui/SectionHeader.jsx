function SectionHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl space-y-2">
        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-300/80">
            {eyebrow}
          </p>
        )}
        <h2 className="text-2xl font-semibold text-white sm:text-3xl">{title}</h2>
        {description && <p className="text-sm leading-6 text-slate-300">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export default SectionHeader;