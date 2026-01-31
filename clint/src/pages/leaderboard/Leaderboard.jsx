import { useEffect, useState } from "react";
import {
  getGlobalLeaderboard,
  getLocalLeaderboard,
} from "../../services/leaderboard.service";
import { useAuth } from "../../context/AuthContext";

/* 🥇🥈🥉 Rank Icons */
const getRankIcon = (rank) => {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return rank;
};

export default function Leaderboard() {
  const { user } = useAuth();

  const [type, setType] = useState("GLOBAL"); // GLOBAL | LOCAL
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (type === "GLOBAL") {
      fetchGlobal();
    } else if (type === "LOCAL" && user?.municipalId) {
      fetchLocal();
    }
  }, [type, user]);

  const fetchGlobal = async () => {
    setLoading(true);
    const data = await getGlobalLeaderboard();
    setLeaders(data || []);
    setLoading(false);
  };

  const fetchLocal = async () => {
    setLoading(true);
    const data = await getLocalLeaderboard(user.municipalId);
    setLeaders(data || []);
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50
                    rounded-xl shadow-md p-6">

      {/* Header */}
      <h2 className="text-lg font-semibold mb-4 text-gray-800">
        Community Leaderboard
      </h2>

      {/* Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setType("GLOBAL")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
            type === "GLOBAL"
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow"
              : "bg-white text-gray-700 shadow-sm hover:bg-gray-50"
          }`}
        >
          Global
        </button>

        <button
          onClick={() => setType("LOCAL")}
          disabled={!user?.municipalId}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
            type === "LOCAL"
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow"
              : "bg-white text-gray-700 shadow-sm hover:bg-gray-50"
          } ${!user?.municipalId && "opacity-50 cursor-not-allowed"}`}
        >
          Local (My Community)
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <p className="text-sm text-gray-500">
          Loading leaderboard...
        </p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <tr>
                <th className="text-left px-4 py-3">Rank</th>
                <th className="text-left px-4 py-3">Citizen</th>
                <th className="text-right px-4 py-3">Points</th>
              </tr>
            </thead>

            <tbody>
              {leaders.map((u, i) => (
                <tr
                  key={u._id}
                  className={`border-b last:border-0 transition
                    hover:bg-gray-50
                    ${i === 0 && "bg-yellow-50"}
                    ${i === 1 && "bg-gray-100"}
                    ${i === 2 && "bg-orange-50"}
                  `}
                >
                  {/* Rank */}
                  <td className="px-4 py-3 font-semibold">
                    {getRankIcon(i + 1)}
                  </td>

                  {/* Citizen */}
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {u.name}
                  </td>

                  {/* Points */}
                  <td className="px-4 py-3 text-right font-bold text-green-600">
                    {u.communityPoints}
                  </td>
                </tr>
              ))}

              {leaders.length === 0 && (
                <tr>
                  <td
                    colSpan="3"
                    className="px-6 py-6 text-center text-gray-500"
                  >
                    No leaderboard data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
