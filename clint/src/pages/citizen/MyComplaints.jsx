import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { getMyComplaints } from "../../services/complaint.service";
import { Link } from "react-router-dom";

function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <p className="text-gray-600">Loading complaints...</p>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">
        My Complaints
      </h2>

      <div className="bg-white rounded shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
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
            {complaints.length === 0 && (
              <tr>
                <td
                  colSpan="8"
                  className="px-6 py-6 text-center text-gray-500"
                >
                  No complaints found
                </td>
              </tr>
            )}

            {complaints.map((c) => (
              <tr
                key={c._id}
                className="border-t hover:bg-gray-50"
              >
                <td className="px-4 py-3">
                  {c._id.slice(-6)}
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
    </div>
  );
}

/* ===== STATUS BADGE (SAME AS ADMIN, READ-ONLY) ===== */
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
      className={`rounded px-2 py-1 text-xs font-medium ${
        colors[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}

export default MyComplaints;
