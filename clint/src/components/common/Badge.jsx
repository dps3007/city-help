function Badge({ status }) {
  const styles = {
    SUBMITTED: "bg-gray-100 text-gray-800 border-gray-300",
    VERIFIED: "bg-blue-100 text-blue-800 border-blue-300",
    ASSIGNED: "bg-yellow-100 text-yellow-800 border-yellow-300",
    IN_PROGRESS: "bg-orange-100 text-orange-800 border-orange-300",
    RESOLVED: "bg-green-100 text-green-800 border-green-300",
    CLOSED: "bg-gray-200 text-gray-800 border-gray-400",
  };

  const style = styles[status] || "bg-gray-100 text-gray-800";

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${style}`}>
      {status || "Unknown"}
    </span>
  );
}

export default Badge;
