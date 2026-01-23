import { useEffect, useState } from "react";
import { getMyRewards } from "../../services/reward.service";

const ACTION_LABELS = {
  COMPLAINT_VERIFIED: "Complaint Verified",
  COMPLAINT_RESOLVED: "Complaint Resolved",
  FEEDBACK_GIVEN: "Feedback Given",
};

export default function RewardHistory() {
  const [history, setHistory] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    getMyRewards().then((res) => {
      setHistory(res.rewards || []);
      setTotalPoints(res.totalPoints || 0);
    });
  }, []);

  return (
    <div className="bg-white rounded shadow-sm p-6 mt-6">
      <h3 className="text-base font-semibold text-gray-800 mb-4">
        Reward History
      </h3>

      {history.length === 0 ? (
        <p className="text-sm text-gray-500">
          No rewards earned yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b text-gray-600">
              <tr>
                <th className="text-left py-2">Date</th>
                <th className="text-left py-2">Complaint</th>
                <th className="text-left py-2">Action</th>
                <th className="text-right py-2">Points</th>
              </tr>
            </thead>

            <tbody>
              {history.map((item) => (
                <tr
                  key={item._id}
                  className="border-b last:border-0 hover:bg-gray-50"
                >
                  {/* Date */}
                  <td className="py-2 text-gray-700">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>

                  {/* Complaint Category */}
                  <td className="py-2 font-medium text-gray-800">
                    {item.complaintId?.category || "—"}
                  </td>

                  {/* Action */}
                  <td className="py-2 text-gray-700">
                    {ACTION_LABELS[item.reason] || item.reason}
                  </td>

                  {/* Points */}
                  <td className="py-2 text-right font-semibold text-green-600">
                    +{item.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
