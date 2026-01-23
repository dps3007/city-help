function Button({
  children,
  onClick,
  disabled = false,
  className = "",
  type = "button",
}) {
  const baseStyles =
    "px-4 py-2 rounded font-medium text-white transition disabled:opacity-50 disabled:cursor-not-allowed";
  const defaultColor = "bg-blue-600 hover:bg-blue-700";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${className || defaultColor}`}
    >
      {children}
    </button>
  );
}

export default Button;
