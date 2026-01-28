import { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  getAllAdminComplaints,
  verifyComplaint,
  assignComplaint,
  startWork,
  resolveComplaint,
  closeComplaint,
} from "../../services/complaint.service";
import { useRole } from "../../hooks/useRole";
import { Link } from "react-router-dom";

const STATUS_OPTIONS = [
  "SUBMITTED",
  "VERIFIED",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];

const PAGE_SIZE = 10;

function ManageComplaints() {
  const { role } = useRole();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // 🔍 search + pagination
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadComplaints();
  }, []);

  useEffect(() => {
    setPage(1); // reset page on search
  }, [search]);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const data = await getAllAdminComplaints();
      setComplaints(data || []);
    } catch (err) {
      console.error("Failed to load complaints", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (complaint, nextStatus) => {
    try {
      setUpdatingId(complaint._id);
      const currentStatus = complaint.status;

      if (["CLOSED", "REJECTED"].includes(currentStatus)) {
        alert("This complaint is already closed");
        return;
      }

      switch (nextStatus) {
        case "VERIFIED":
          if (currentStatus !== "SUBMITTED") {
            alert("Only SUBMITTED complaints can be verified");
            return;
          }
          await verifyComplaint(complaint._id);
          break;

        case "ASSIGNED":
          if (currentStatus !== "VERIFIED") {
            alert("Only VERIFIED complaints can be assigned");
            return;
          }
          const officerId = prompt("Enter Officer ID");
          if (!officerId) return;
          await assignComplaint(complaint._id, { officerId });
          break;

        case "IN_PROGRESS":
          if (currentStatus !== "ASSIGNED") {
            alert("Work can start only after assignment");
            return;
          }
          await startWork(complaint._id);
          break;

        case "RESOLVED":
          if (currentStatus !== "IN_PROGRESS") {
            alert("Only IN_PROGRESS complaints can be resolved");
            return;
          }
          await resolveComplaint(complaint._id);
          break;

        case "CLOSED":
          if (currentStatus !== "RESOLVED") {
            alert("Only RESOLVED complaints can be closed");
            return;
          }
          await closeComplaint(complaint._id);
          break;

        default:
          return;
      }

      await loadComplaints();
    } catch (err) {
      console.error("Status update failed", err);
      alert(err?.response?.data?.message || "Action not allowed");
    } finally {
      setUpdatingId(null);
    }
  };

  /* ---------- SEARCH FILTER ---------- */
  const filteredComplaints = complaints.filter((c) => {
    const q = search.toLowerCase();
    return (
      c._id.toLowerCase().includes(q) ||
      c.category?.toLowerCase().includes(q) ||
      c.status?.toLowerCase().includes(q)
    );
  });

  /* ---------- PAGINATION ---------- */
  const totalPages = Math.ceil(
    filteredComplaints.length / PAGE_SIZE
  );

  const paginatedComplaints = filteredComplaints.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  if (loading) {
    return <p className="text-gray-600">Loading complaints...</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header + Search */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">
          Complaints Detail
        </h2>

        <input
          type="text"
          placeholder="Search by ID / Category / Status"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded text-sm w-72"
        />
      </div>

      <div className="bg-white rounded shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Upvotes</th>
              <th className="px-4 py-3 text-left">Assigned By</th>
              <th className="px-4 py-3 text-left">Verified By</th>
              <th className="px-4 py-3 text-left">Assigned To</th>
              <th className="px-4 py-3 text-left">Created</th>
              <th className="px-4 py-3 text-left">Resolved On</th>
              <th className="px-4 py-3 text-left">View</th>
            </tr>
          </thead>

          <tbody>
            {paginatedComplaints.length === 0 && (
              <tr>
                <td
                  colSpan="10"
                  className="px-6 py-6 text-center text-gray-500"
                >
                  No complaints found
                </td>
              </tr>
            )}

            {paginatedComplaints.map((c) => (
              <tr key={c._id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{c._id.slice(-6)}</td>
                <td className="px-4 py-3">{c.category}</td>

                <td className="px-4 py-3">
                  <select
                    value={c.status}
                    disabled={updatingId === c._id}
                    onChange={(e) =>
                      handleStatusChange(c, e.target.value)
                    }
                    className="rounded border px-2 py-1 text-sm"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="px-4 py-3">{c.upvoteCount}</td>

                <td className="px-4 py-3">
                  {c.verifiedBy?.name || "—"}
                </td>

                <td className="px-4 py-3">
                  {c.verifiedBy?.name || "—"}
                </td>

                <td
                  className={`px-4 py-3 ${
                    !c.assignedTo ? "text-red-500" : ""
                  }`}
                >
                  {c.assignedTo?.name || "Unassigned"}
                </td>

                <td className="px-4 py-3">
                  {dayjs(c.createdAt).format("DD MMM YYYY")}
                </td>

                <td className="px-4 py-3">
                  {c.resolvedAt
                    ? dayjs(c.resolvedAt).format(
                        "DD MMM YYYY"
                      )
                    : "—"}
                </td>

                <td className="px-4 py-3">
                  <Link
                    to={`/complaints/${c._id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>

          <span className="text-sm">
            Page {page} / {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default ManageComplaints;
