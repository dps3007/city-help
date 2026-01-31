import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

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

      {/* OVERLAY */}
      <div
        className="flex-1 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* DRAWER */}
      <div className="w-[440px] bg-white shadow-2xl flex flex-col">

        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4
                        border-b bg-gradient-to-r from-blue-600 to-purple-600
                        text-white">
          <h3 className="font-semibold text-sm uppercase tracking-wide">
            {department}
          </h3>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-lg"
          >
            ✕
          </button>
        </div>

        {/* STATUS FILTERS */}
        <div className="px-4 py-3 border-b flex gap-2 flex-wrap bg-gray-50">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition
                ${
                  status === s
                    ? "bg-blue-600 text-white shadow"
                    : "bg-white text-gray-700 border hover:bg-gray-100"
                }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* LIST */}
        <div className="flex-1 overflow-y-auto divide-y">
          {paginated.length === 0 ? (
            <p className="p-4 text-sm text-gray-500">
              No complaints found
            </p>
          ) : (
            paginated.map((c) => (
              <div
                key={c._id}
                onClick={() =>
                  navigate(`/complaints/${c._id}`)
                }
                className="p-4 cursor-pointer hover:bg-gray-50 transition"
              >
                <p className="font-medium text-sm text-gray-800">
                  #{c._id.slice(-6)}
                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full
                                   bg-gray-100 text-gray-600">
                    {c.status}
                  </span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(c.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="border-t px-4 py-3 flex justify-between items-center bg-gray-50">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="text-sm px-3 py-1 rounded-full border
                         disabled:opacity-40 hover:bg-white"
            >
              Prev
            </button>

            <span className="text-xs font-medium text-gray-600">
              Page {page} / {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="text-sm px-3 py-1 rounded-full border
                         disabled:opacity-40 hover:bg-white"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default DepartmentComplaintsDrawer;
