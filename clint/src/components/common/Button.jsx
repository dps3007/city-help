function Button({
  children,
  onClick,
  disabled = false,
  className = "",
  type = "button",
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
}) {
  const baseStyles = "inline-flex items-center justify-center font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary: "bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500 shadow-md hover:shadow-lg",
    secondary: "bg-card border-2 border-primary-200 text-primary-700 hover:bg-primary-50 focus:ring-primary-300",
    outline: "border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-md hover:shadow-lg",
    ghost: "text-primary-600 hover:bg-primary-100 focus:ring-primary-300",
    accent: "bg-accent-500 hover:bg-accent-600 text-white focus:ring-accent-500 shadow-md hover:shadow-lg",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm rounded-md",
    md: "px-4 py-2 text-base rounded-lg",
    lg: "px-6 py-3 text-lg rounded-lg",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size]} ${widthClass} ${className}`}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}

export default Button;
