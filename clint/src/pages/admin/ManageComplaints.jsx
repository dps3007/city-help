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
import api from "../../services/api";


/* ---------------- constants ---------------- */

const STATUS_OPTIONS = [
  "SUBMITTED",
  "VERIFIED",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];

const STATUS_COLORS = {
  SUBMITTED: "bg-gray-100 text-gray-700",
  VERIFIED: "bg-blue-100 text-blue-700",
  ASSIGNED: "bg-yellow-100 text-yellow-700",
  IN_PROGRESS: "bg-orange-100 text-orange-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-purple-100 text-purple-700",
};

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

  const [officers, setOfficers] = useState([]);
  const [assigningComplaint, setAssigningComplaint] = useState(null);

  const fetchOfficers = async (category) => {
    const res = await api.get(
      `/users/officers?department=${category}`
    );
    setOfficers(res.data.data);
  };


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

  /* ---------------- STATUS ACTIONS ---------------- */

  const handleStatusChange = async (complaint, nextStatus) => {
    try {
      setUpdatingId(complaint._id);

      if (complaint.status === "CLOSED") return;

      switch (nextStatus) {
        case "VERIFIED":
          if (complaint.status !== "SUBMITTED") return;
          await verifyComplaint(complaint._id);
          break;

        case "ASSIGNED":
          if (complaint.status !== "VERIFIED") return;
          setAssigningComplaint(complaint);
          await fetchOfficers(complaint.category);
          return;

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
      alert(err?.response?.data?.message || "Action not allowed");
    } finally {
      setUpdatingId(null);
    }
  };

  /* ---------------- FILTERING ---------------- */

  const filteredComplaints = complaints.filter((c) => {
    const userState = normalize(user?.location?.state);
    const userDistrict = normalize(user?.location?.district);
    const userDepartment = normalize(user?.department);

    const complaintState = normalize(c?.location?.state);
    const complaintDistrict = normalize(c?.location?.district);
    const complaintCategory = normalize(c?.category);

    /* ---------- ROLE FILTER (UNCHANGED) ---------- */

    let roleAllowed = false;

    if (["SUPER_ADMIN", "CENTRAL_ADMIN"].includes(role)) roleAllowed = true;

    if (role === "STATE_ADMIN")
      roleAllowed = complaintState === userState;

    if (role === "DISTRICT_ADMIN")
      roleAllowed =
        complaintState === userState &&
        complaintDistrict === userDistrict;

    if (role === "DEPT_HEAD")
      roleAllowed =
        complaintDistrict === userDistrict &&
        complaintCategory === userDepartment;

    if (role === "OFFICER")
      roleAllowed =
        complaintCategory === userDepartment &&
        (c.assignedTo?._id === user._id ||
          c.resolvedBy === user._id);

    if (role === "WORKER")
      roleAllowed =
        complaintCategory === userDepartment &&
        (c.assignedWorker?._id === user._id ||
          c.resolvedBy === user._id);

    if (!roleAllowed) return false;

    /* ---------- SEARCH FILTER (FIXED) ---------- */

    if (!search.trim()) return true;

    const q = normalize(search);

    return (
      c._id.toLowerCase().includes(q) ||
      complaintCategory.includes(q) ||
      normalize(c.status).includes(q)
    );
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
    <div className="space-y-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 rounded-lg">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">
          Complaints Management
        </h2>

        <input
          type="text"
          placeholder="Search complaints..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded-lg text-sm w-72"
        />
      </div>

      {/* Table */}
      <div className="bg-white/90 backdrop-blur rounded-xl shadow-md overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Upvotes</th>
              <th className="px-4 py-3 text-left">Assigned</th>
              <th className="px-4 py-3 text-left">Created</th>
              <th className="px-4 py-3 text-left">Resolved</th>
              <th className="px-4 py-3 text-left">View</th>
            </tr>
          </thead>

          <tbody>
            {paginatedComplaints.length === 0 && (
              <tr>
                <td colSpan="8" className="px-6 py-6 text-center text-gray-500">
                  No complaints found
                </td>
              </tr>
            )}

            {paginatedComplaints.map((c) => (
              <tr
                key={c._id}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="px-4 py-3 font-medium">
                  #{c._id.slice(-6)}
                </td>

                <td className="px-4 py-3">{c.category}</td>

                <td className="px-4 py-3">
                  <select
                    value={c.status}
                    disabled={updatingId === c._id || assigningComplaint}
                    onChange={(e) =>
                      handleStatusChange(c, e.target.value)
                    }
                    className={`px-2 py-1 rounded-full text-xs font-semibold
                      ${STATUS_COLORS[c.status]}`}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s} disabled={c.status === "ASSIGNED" && s === "ASSIGNED"}>
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
                    className="text-blue-600 font-medium hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

        {assigningComplaint && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 w-96 space-y-4">
                <h3 className="text-lg font-semibold">
                  Assign Officer ({assigningComplaint.category})
                </h3>

                {officers.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No officers found for this department
                  </p>
                )}

                <ul className="space-y-2 max-h-60 overflow-y-auto">
                  {officers.map((o) => (
                    <li
                      key={o._id}
                      onClick={async () => {
                        try {
                          setUpdatingId(assigningComplaint._id);
                          await assignComplaint(assigningComplaint._id, {
                            officerId: o._id,
                          });
                          setAssigningComplaint(null);
                          await loadComplaints();
                        } catch (e) {
                          alert("Assignment failed");
                        } finally {
                          setUpdatingId(null);
                        }
                      }}
                      className="cursor-pointer p-3 rounded-lg border hover:bg-blue-50"
                    >
                      <p className="font-medium">{o.name}</p>
                      <p className="text-xs text-gray-500">{o.email}</p>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => setAssigningComplaint(null)}
                  className="w-full py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-1 rounded-full bg-white shadow disabled:opacity-50"
          >
            Prev
          </button>

          <span className="text-sm font-medium">
            Page {page} / {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-1 rounded-full bg-white shadow disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default ManageComplaints;
