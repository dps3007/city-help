function Badge({ status, variant = "default" }) {
  const styles = {
    SUBMITTED: "bg-slate-100 text-slate-700 border border-slate-300",
    VERIFIED: "bg-blue-100 text-blue-700 border border-blue-300",
    ASSIGNED: "bg-amber-100 text-amber-700 border border-amber-300",
    IN_PROGRESS: "bg-orange-100 text-orange-700 border border-orange-300",
    RESOLVED: "bg-green-100 text-green-700 border border-green-300",
    CLOSED: "bg-gray-200 text-gray-700 border border-gray-300",
    PENDING: "bg-slate-100 text-slate-700 border border-slate-300",
    REJECTED: "bg-red-100 text-red-700 border border-red-300",
  };

  const style = styles[status] || "bg-slate-100 text-slate-700 border border-slate-300";

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${style}`}>
      <span className="w-2 h-2 rounded-full bg-current opacity-60" />
      {status || "Unknown"}
    </span>
  );
}

export default Badge;
