import { useEffect, useState } from "react";
import { getMyComplaints } from "../../services/complaint.service";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";


function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
              <th className="px-6 py-3 text-left">ID</th>
              <th className="px-6 py-3 text-left">Category</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Upvotes</th>
              <th className="px-6 py-3 text-left">Created</th>
              <th className="px-6 py-3 text-left">View</th>
            </tr>
          </thead>

          <tbody>
            {complaints.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-6 text-center text-gray-500"
                >
                  No complaints found
                </td>
              </tr>
            )}

            {complaints.map((complaint) => (
              <tr
                key={complaint._id}
                className="border-t hover:bg-gray-50"
              >
                <td className="px-6 py-3">
                  {complaint._id.slice(-6)}
                </td>
                <td className="px-6 py-3">
                  {complaint.category}
                </td>
                <td className="px-6 py-3">
                  <StatusBadge status={complaint.status} />
                </td>
                <td className="px-6 py-3">
                  {complaint.upvotes || 0}
                </td>
                <td className="px-6 py-3">
                  {new Date(
                    complaint.createdAt
                  ).toLocaleDateString()}
                </td>
                <td className="px-6 py-3">
                  <Link
                    to={`/complaints/${complaint._id}`}
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

function StatusBadge({ status }) {
  const colors = {
    SUBMITTED: "bg-gray-200 text-gray-700",
    VERIFIED: "bg-blue-100 text-blue-700",
    ASSIGNED: "bg-yellow-100 text-yellow-700",
    IN_PROGRESS: "bg-orange-100 text-orange-700",
    RESOLVED: "bg-green-100 text-green-700",
    CLOSED: "bg-green-200 text-green-800",
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
