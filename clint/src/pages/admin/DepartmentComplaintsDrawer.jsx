import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, X } from "lucide-react";
import Badge from "../../components/common/Badge";

const PAGE_SIZE = 10;

const STATUS_FILTERS = ["ALL", "PENDING", "RESOLVED", "CLOSED"];

const PENDING_STATUSES = [
  "SUBMITTED",
  "VERIFIED",
  "ASSIGNED",
  "IN_PROGRESS",
];

function DepartmentComplaintsDrawer({
  department, // only for title
  complaints, // already filtered
  onClose,
}) {
  const navigate = useNavigate();
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);

  /* ---------- STATUS FILTER ONLY ---------- */

  const filtered = useMemo(() => {
    if (status === "ALL") return complaints;

    if (status === "PENDING") {
      return complaints.filter((c) =>
        PENDING_STATUSES.includes(c.status)
      );
    }

    return complaints.filter((c) => c.status === status);
  }, [complaints, status]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const paginated = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  if (!department) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex">
      <div className="flex-1 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />

      <div className="flex w-full max-w-lg flex-col border-l border-white/10 bg-slate-950/95 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-300/80">Group detail</p>
            <h3 className="mt-2 text-lg font-semibold text-white">{department}</h3>
          </div>
          <button onClick={onClose} className="rounded-2xl border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:bg-white/10">
            <X size={16} />
          </button>
        </div>

        <div className="border-b border-white/10 px-4 py-3">
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => {
                  setStatus(filter);
                  setPage(1);
                }}
                className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${status === filter ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-200" : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"}`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-white/10">
          {paginated.length === 0 ? (
            <p className="p-4 text-sm text-slate-400">No complaints found</p>
          ) : (
            paginated.map((complaint) => (
              <button key={complaint._id} onClick={() => navigate(`/complaints/${complaint._id}`)} className="flex w-full items-center justify-between px-4 py-4 text-left transition hover:bg-white/5">
                <div>
                  <p className="text-sm font-semibold text-white">#{complaint._id.slice(-6)}</p>
                  <p className="mt-1 text-xs text-slate-400">{new Date(complaint.createdAt).toLocaleDateString()}</p>
                </div>
                <Badge status={complaint.status} />
              </button>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/10 px-4 py-3">
            <button disabled={page === 1} onClick={() => setPage((current) => current - 1)} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white disabled:opacity-40">
              Prev
            </button>
            <span className="text-xs font-medium text-slate-400">Page {page} / {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage((current) => current + 1)} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white disabled:opacity-40">
              Next <ArrowRight size={14} className="inline-block" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default DepartmentComplaintsDrawer;
