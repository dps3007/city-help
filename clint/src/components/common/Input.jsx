import { forwardRef } from "react";

const Input = forwardRef(
  (
    {
      type = "text",
      placeholder = "",
      value,
      onChange,
      disabled = false,
      error = false,
      className = "",
      icon: Icon,
      ...rest
    },
    ref
  ) => {
    const baseStyles =
      "w-full px-4 py-2 rounded-lg border-2 border-border bg-background text-foreground placeholder-muted-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed";
    const errorStyles = error ? "border-red-500 focus:ring-red-500" : "focus:border-primary-500";

    return (
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />}
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`${baseStyles} ${errorStyles} ${Icon ? "pl-10" : ""} ${className}`}
          {...rest}
        />
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
