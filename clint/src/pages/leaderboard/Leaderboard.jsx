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
    <div className="bg-white rounded shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4">
        Community Leaderboard
      </h2>

      {/* Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setType("GLOBAL")}
          className={`px-4 py-1 rounded text-sm ${
            type === "GLOBAL"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          Global
        </button>

        <button
          onClick={() => setType("LOCAL")}
          disabled={!user?.municipalId}
          className={`px-4 py-1 rounded text-sm ${
            type === "LOCAL"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          Local (My Community)
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-sm text-gray-500">Loading leaderboard...</p>
      ) : (
        <table className="w-full text-sm">
          <thead className="border-b text-gray-600">
            <tr>
              <th className="text-left py-2">Rank</th>
              <th className="text-left py-2">Citizen</th>
              <th className="text-right py-2">Points</th>
            </tr>
          </thead>
          <tbody>
            {leaders.map((u, i) => (
              <tr
                key={u._id}
                className="border-b last:border-0 hover:bg-gray-50"
              >
                {/* ✅ Rank with medal */}
                <td className="py-2 font-semibold">
                  {getRankIcon(i + 1)}
                </td>

                {/* Citizen */}
                <td className="py-2">{u.name}</td>

                {/* Points */}
                <td className="py-2 text-right font-semibold text-green-600">
                  {u.communityPoints}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
