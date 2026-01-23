function StatusStepper({ currentStatus }) {
  const statuses = [
    { name: "SUBMITTED", label: "Submitted" },
    { name: "VERIFIED", label: "Verified" },
    { name: "ASSIGNED", label: "Assigned" },
    { name: "IN_PROGRESS", label: "In Progress" },
    { name: "RESOLVED", label: "Resolved" },
    { name: "CLOSED", label: "Closed" },
  ];

  const currentIndex = statuses.findIndex((s) => s.name === currentStatus);

  return (
    <div className="flex items-center justify-between">
      {statuses.map((status, index) => (
        <div key={status.name} className="flex items-center">
          {/* Circle */}
          <div
            className={`
              h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold transition
              ${
                index <= currentIndex
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }
            `}
          >
            {index <= currentIndex ? "✓" : index + 1}
          </div>

          {/* Label */}
          <p
            className={`
              text-xs font-medium ml-2 transition
              ${index <= currentIndex ? "text-blue-600" : "text-gray-500"}
            `}
          >
            {status.label}
          </p>

          {/* Line */}
          {index < statuses.length - 1 && (
            <div
              className={`
                h-1 flex-1 mx-2 transition
                ${
                  index < currentIndex
                    ? "bg-blue-600"
                    : "bg-gray-300"
                }
              `}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default StatusStepper;
