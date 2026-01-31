import { useEffect, useState, useMemo } from "react";
import { getMyRewards } from "../../services/reward.service";

const ACTION_LABELS = {
  COMPLAINT_VERIFIED: "Complaint Verified",
  COMPLAINT_RESOLVED: "Complaint Resolved",
  FEEDBACK_GIVEN: "Feedback Given",
};

const PAGE_SIZE = 8;

export default function RewardHistory() {
  const [history, setHistory] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    getMyRewards().then((res) => {
      setHistory(res.rewards || []);
      setTotalPoints(res.totalPoints || 0);
    });
  }, []);

  const totalPages = Math.ceil(history.length / PAGE_SIZE);

  const paginatedHistory = useMemo(() => {
    return history.slice(
      (page - 1) * PAGE_SIZE,
      page * PAGE_SIZE
    );
  }, [history, page]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Reward History
        </h3>
        <span className="text-sm text-gray-500">
          Total Points:{" "}
          <b className="text-green-600">{totalPoints}</b>
        </span>
      </div>

      {/* Empty State */}
      {history.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-sm text-gray-500">
            No rewards earned yet.
          </p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-left px-4 py-3">Complaint</th>
                  <th className="text-left px-4 py-3">Action</th>
                  <th className="text-right px-4 py-3">Points</th>
                </tr>
              </thead>

              <tbody>
                {paginatedHistory.map((item) => (
                  <tr
                    key={item._id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    {/* Date */}
                    <td className="px-4 py-3 text-gray-700">
                      {new Date(item.createdAt).toLocaleDateString("en-GB")}
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {item.complaintId?.category || "—"}
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3 text-gray-700">
                      {ACTION_LABELS[item.reason] || item.reason}
                    </td>

                    {/* Points */}
                    <td className="px-4 py-3 text-right font-semibold text-green-600">
                      +{item.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
                className={`
                  px-5 py-2 rounded-full text-sm font-medium
                  transition
                  ${
                    page === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700 shadow"
                  }
                `}
              >
                ← Prev
              </button>

              <span className="text-sm text-gray-600 font-medium">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages}
                className={`
                  px-5 py-2 rounded-full text-sm font-medium
                  transition
                  ${
                    page === totalPages
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700 shadow"
                  }
                `}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
