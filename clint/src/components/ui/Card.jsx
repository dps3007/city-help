function Card({ children, className = "", interactive = false }) {
  return (
    <div
      className={`surface ${interactive ? "transition duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/7" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }) {
  return <div className={`border-b border-white/10 px-6 py-5 ${className}`}>{children}</div>;
}

export function CardBody({ children, className = "" }) {
  return <div className={`px-6 py-5 ${className}`}>{children}</div>;
}

export default Card;