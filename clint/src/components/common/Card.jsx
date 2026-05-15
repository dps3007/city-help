function Card({ children, className = "", hoverable = false, interactive = false }) {
  const baseStyles = "bg-card text-card-foreground rounded-lg border border-border shadow-sm";
  const hoverStyles = hoverable ? "hover:shadow-lg hover:border-primary-300 transition-all" : "";
  const interactiveStyles = interactive ? "cursor-pointer" : "";

  return (
    <div className={`${baseStyles} ${hoverStyles} ${interactiveStyles} ${className}`}>
      {children}
    </div>
  );
}

export default Card;
