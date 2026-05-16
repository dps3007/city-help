function Button({
  children,
  onClick,
  disabled = false,
  className = "",
  type = "button",
  variant = "primary",
  size = "md",
  leadingIcon,
  trailingIcon,
}) {
  const variants = {
    primary:
      "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30",
    secondary:
      "bg-white/8 text-slate-100 border border-white/10 hover:bg-white/12",
    ghost:
      "bg-transparent text-slate-200 hover:bg-white/8 border border-transparent",
    danger:
      "bg-rose-500/15 text-rose-100 border border-rose-500/20 hover:bg-rose-500/20",
  };

  const sizes = {
    sm: "px-3 py-2 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-5 py-3 text-sm",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl border font-semibold transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.99] ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {leadingIcon}
      <span>{children}</span>
      {trailingIcon}
    </button>
  );
}

export default Button;