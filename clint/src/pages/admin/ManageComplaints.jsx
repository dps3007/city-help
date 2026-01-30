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
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

/* ---------------- constants ---------------- */

const STATUS_OPTIONS = [
  "SUBMITTED",
  "VERIFIED",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];

const PAGE_SIZE = 10;

/* ---------------- helpers ---------------- */

const normalize = (value) => {
  if (!value || typeof value !== "string") return "unknown";
  return value.trim().toLowerCase().replace(/\s+/g, " ");
};

/* ---------------- component ---------------- */

function ManageComplaints() {
  const { role } = useRole();
  const { user } = useAuth();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadComplaints();
  }, []);

  useEffect(() => {
    setPage(1);
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

  /* ---------------- status actions ---------------- */

  const handleStatusChange = async (complaint, nextStatus) => {
    try {
      setUpdatingId(complaint._id);

      if (complaint.status === "CLOSED") {
        alert("Complaint already closed");
        return;
      }

      switch (nextStatus) {
        case "VERIFIED":
          if (complaint.status !== "SUBMITTED") return;
          await verifyComplaint(complaint._id);
          break;

        case "ASSIGNED":
          if (complaint.status !== "VERIFIED") return;
          const officerId = prompt("Enter Officer ID");
          if (!officerId) return;
          await assignComplaint(complaint._id, { officerId });
          break;

        case "IN_PROGRESS":
          if (complaint.status !== "ASSIGNED") return;
          await startWork(complaint._id);
          break;

        case "RESOLVED":
          if (complaint.status !== "IN_PROGRESS") return;
          await resolveComplaint(complaint._id);
          break;

        case "CLOSED":
          if (complaint.status !== "RESOLVED") return;
          await closeComplaint(complaint._id);
          break;

        default:
          return;
      }

      await loadComplaints();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Action not allowed");
    } finally {
      setUpdatingId(null);
    }
  };

  /* ---------------- FILTERING (ROLE + CATEGORY + LOCATION) ---------------- */

  const filteredComplaints = complaints.filter((c) => {
    const userState = normalize(user?.location?.state);
    const userDistrict = normalize(user?.location?.district);
    const userDepartment = normalize(user?.department);

    const complaintState = normalize(c?.location?.state);
    const complaintDistrict = normalize(c?.location?.district);
    const complaintCategory = normalize(c?.category);

  // SUPER / CENTRAL 
    if (["SUPER_ADMIN", "CENTRAL_ADMIN"].includes(role)) { return true; }  

    /* ---------- STATE ADMIN ---------- */
    if (role === "STATE_ADMIN") {
      return complaintState === userState;
    }

    /* ---------- DISTRICT ADMIN ---------- */
    if (role === "DISTRICT_ADMIN") {
      return (
        complaintState === userState &&
        complaintDistrict === userDistrict
      );
    }

    /* ---------- DEPT_HEAD ---------- */
    if (role === "DEPT_HEAD") {
      return (
        complaintDistrict === userDistrict &&
        complaintCategory === userDepartment
      );
    }

    /* ---------- OFFICER ---------- */
    if (role === "OFFICER") {
      return (
        complaintCategory === userDepartment &&
        (
          c.assignedTo?._id === user._id ||
          c.resolvedBy === user._id
        )
      );
    }

    /* ---------- WORKER ---------- */
    if (role === "WORKER") {
      return (
        complaintCategory === userDepartment &&
        (
          c.assignedWorker?._id === user._id ||
          c.resolvedBy === user._id
        )
      );
    }

    return false;
  });


  /* ---------------- PAGINATION ---------------- */

  const totalPages = Math.ceil(filteredComplaints.length / PAGE_SIZE);

  const paginatedComplaints = filteredComplaints.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  if (loading) {
    return <p className="text-gray-600">Loading complaints...</p>;
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">
          Complaints Management
        </h2>

        <input
          type="text"
          placeholder="Search by ID / Category / Status"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded text-sm w-72"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Upvotes</th>
              <th className="px-4 py-3">Assigned To</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Resolved</th>
              <th className="px-4 py-3">View</th>
            </tr>
          </thead>

          <tbody>
            {paginatedComplaints.length === 0 && (
              <tr>
                <td
                  colSpan="8"
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
                    className="border rounded px-2 py-1 text-sm"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="px-4 py-3">{c.upvoteCount}</td>

                <td className="px-4 py-3">
                  {c.assignedTo?.name || "Unassigned"}
                </td>

                <td className="px-4 py-3">
                  {dayjs(c.createdAt).format("DD MMM YYYY")}
                </td>

                <td className="px-4 py-3">
                  {c.resolvedAt
                    ? dayjs(c.resolvedAt).format("DD MMM YYYY")
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
