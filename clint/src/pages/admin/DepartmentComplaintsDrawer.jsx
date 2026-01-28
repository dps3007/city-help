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
  department,
  complaints,
  onClose,
}) {
  const navigate = useNavigate();
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);

  /* ---------- ALWAYS RUN HOOKS ---------- */

  const deptComplaints = useMemo(() => {
    if (!department) return [];
    return complaints.filter(
      (c) =>
        c.category?.toUpperCase() ===
        department?.toUpperCase()
    );
  }, [complaints, department]);

  const filtered = useMemo(() => {
    if (status === "ALL") return deptComplaints;
    if (status === "PENDING") {
      return deptComplaints.filter((c) =>
        PENDING_STATUSES.includes(c.status)
      );
    }
    return deptComplaints.filter(
      (c) => c.status === status
    );
  }, [deptComplaints, status]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const paginated = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  /* ---------- CONDITIONAL RETURN AFTER HOOKS ---------- */
  if (!department) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex">
      {/* overlay */}
      <div
        className="flex-1 bg-black/30"
        onClick={onClose}
      />

      {/* drawer */}
      <div className="w-[440px] bg-white shadow-xl flex flex-col">
        {/* header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold">
            {department} Complaints
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black"
          >
            ✕
          </button>
        </div>

        {/* filters */}
        <div className="px-4 py-3 border-b flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
              className={`px-3 py-1 rounded text-sm ${
                status === s
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* list */}
        <div className="flex-1 overflow-y-auto divide-y">
          {paginated.length === 0 ? (
            <p className="p-4 text-gray-500">
              No complaints found
            </p>
          ) : (
            paginated.map((c) => (
              <div
                key={c._id}
                onClick={() =>
                  navigate(`/complaints/${c._id}`)
                }
                className="p-4 cursor-pointer hover:bg-gray-50"
              >
                <p className="font-medium">
                  #{c._id.slice(-6)} — {c.status}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(c.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>

        {/* pagination */}
        {totalPages > 1 && (
          <div className="border-t px-4 py-3 flex justify-between">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="text-sm disabled:text-gray-400"
            >
              Prev
            </button>
            <span className="text-sm">
              Page {page} / {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="text-sm disabled:text-gray-400"
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
