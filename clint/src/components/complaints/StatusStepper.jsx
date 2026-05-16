function StatusStepper({ currentStatus }) {
  const statuses = [
    { name: "SUBMITTED", label: "Submitted" },
    { name: "VERIFIED", label: "Verified" },
    { name: "ASSIGNED", label: "Assigned" },
    { name: "IN_PROGRESS", label: "In Progress" },
    { name: "RESOLVED", label: "Resolved" },
    { name: "CLOSED", label: "Closed" },
  ];

  const currentIndex = statuses.findIndex((status) => status.name === currentStatus);

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
      {statuses.map((status, index) => {
        const complete = index <= currentIndex;
        const active = index === currentIndex;

        return (
          <div
            key={status.name}
            className={`relative overflow-hidden rounded-2xl border p-4 transition ${
              complete
                ? "border-cyan-400/25 bg-cyan-400/10"
                : "border-white/10 bg-white/5"
            } ${active ? "shadow-[0_20px_60px_rgba(34,211,238,0.12)]" : ""}`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${complete ? "text-cyan-200" : "text-slate-400"}`}>
                  Step {index + 1}
                </p>
                <p className={`mt-2 text-sm font-semibold ${complete ? "text-white" : "text-slate-300"}`}>
                  {status.label}
                </p>
              </div>

              <div className={`flex h-9 w-9 items-center justify-center rounded-2xl text-sm font-bold ${complete ? "bg-cyan-400 text-slate-950" : "bg-white/8 text-slate-400"}`}>
                {complete ? "✓" : index + 1}
              </div>
            </div>

            {active && <div className="mt-4 h-1.5 rounded-full bg-cyan-400/30"><div className="h-full w-3/5 rounded-full bg-cyan-300" /></div>}
          </div>
        );
      })}
    </div>
  );
}

export default StatusStepper;
