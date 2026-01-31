import { useEffect, useState, useMemo } from "react";
import dayjs from "dayjs";
import { getMyComplaints } from "../../services/complaint.service";
import { Link } from "react-router-dom";

const PAGE_SIZE = 8;

function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const data = await getMyComplaints();
        setComplaints(data || []);
      } catch (error) {
        console.error("Failed to fetch complaints", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  /* ---------------- SEARCH ---------------- */

  const filteredComplaints = useMemo(() => {
    if (!search.trim()) return complaints;

    const q = search.toLowerCase();

    return complaints.filter((c) =>
      c._id.toLowerCase().includes(q) ||
      c.category?.toLowerCase().includes(q) ||
      c.status?.toLowerCase().includes(q)
    );
  }, [complaints, search]);

  /* ---------------- PAGINATION ---------------- */

  const totalPages = Math.ceil(filteredComplaints.length / PAGE_SIZE);

  const paginatedComplaints = filteredComplaints.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  useEffect(() => {
    setPage(1);
  }, [search]);

  if (loading) {
    return <p className="text-gray-600">Loading complaints...</p>;
  }

  return (
    <div className="space-y-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 rounded-xl">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">
          Complaints Details
        </h2>

        <input
          type="text"
          placeholder="Search by ID / Category / Status"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded-lg text-sm w-72"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white/90 backdrop-blur rounded-xl shadow-md overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Upvotes</th>
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
                  colSpan="8"
                  className="px-6 py-6 text-center text-gray-500"
                >
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

                <td className="px-4 py-3">
                  {c.category}
                </td>

                <td className="px-4 py-3">
                  <StatusBadge status={c.status} />
                </td>

                <td className="px-4 py-3">
                  {c.upvoteCount}
                </td>

                <td
                  className={`px-4 py-3 font-medium ${
                    !c.assignedTo ? "text-red-500" : "text-gray-800"
                  }`}
                >
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

      {/* PAGINATION */}
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

/* ===== STATUS BADGE ===== */
function StatusBadge({ status }) {
  const colors = {
    SUBMITTED: "bg-gray-200 text-gray-700",
    VERIFIED: "bg-blue-100 text-blue-700",
    ASSIGNED: "bg-yellow-100 text-yellow-700",
    IN_PROGRESS: "bg-orange-100 text-orange-700",
    RESOLVED: "bg-green-100 text-green-700",
    CLOSED: "bg-green-200 text-green-800",
    REJECTED: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        colors[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}

export default MyComplaints;
