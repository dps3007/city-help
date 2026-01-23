import { useEffect, useState } from "react";
import {
  getAllComplaints,
  verifyComplaint,
  assignComplaint,
  startWork,
  resolveComplaint,
  closeComplaint,
} from "../../services/complaint.service";
import { useRole } from "../../hooks/useRole";

const STATUS_OPTIONS = [
  "SUBMITTED",
  "VERIFIED",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];

function ManageComplaints() {
  const { role } = useRole();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      const data = await getAllComplaints();
      setComplaints(data || []);
    } catch (err) {
      console.error("Failed to load complaints", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ STATUS CHANGE HANDLER (ALIGNED WITH BACKEND)
  const handleStatusChange = async (complaint, nextStatus) => {
    try {
      setUpdatingId(complaint._id);

      switch (nextStatus) {
        case "VERIFIED":
          await verifyComplaint(complaint._id);
          break;

        case "ASSIGNED": {
          const officerId = prompt("Enter Officer ID");
          if (!officerId) return;
          await assignComplaint(complaint._id, { officerId });
          break;
        }

        case "IN_PROGRESS":
          await startWork(complaint._id);
          break;

        case "RESOLVED":
          await resolveComplaint(complaint._id);
          break;

        case "CLOSED":
          await closeComplaint(complaint._id);
          break;

        default:
          return;
      }

      setComplaints((prev) =>
        prev.map((c) =>
          c._id === complaint._id
            ? { ...c, status: nextStatus }
            : c
        )
      );


      await loadComplaints();
    } catch (err) {
      console.error("Status update failed", err);
      alert(err?.response?.data?.message || "Action not allowed");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <p className="text-gray-600">Loading complaints...</p>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">
        Manage Complaints
      </h2>

      <div className="bg-white rounded shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-6 py-3 text-left">ID</th>
              <th className="px-6 py-3 text-left">Category</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Assigned</th>
              <th className="px-6 py-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {complaints.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-6 text-center text-gray-500"
                >
                  No complaints available
                </td>
              </tr>
            )}

            {complaints.map((c) => (
              <tr key={c._id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-3">{c._id.slice(-6)}</td>
                <td className="px-6 py-3">{c.category}</td>

                {/* STATUS DROPDOWN (UI SAME, LOGIC FIXED) */}
                <td className="px-6 py-3">
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

                <td className="px-6 py-3">
                  {c.assignedTo?.name || "Unassigned"}
                </td>

                <td className="px-6 py-3 text-gray-500">
                  —
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManageComplaints;
