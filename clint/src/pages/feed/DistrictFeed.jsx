import { useEffect, useState } from "react";
import {
  getDistrictFeed,
  upvoteComplaint,
} from "../../services/complaint.service";
import { useAuth } from "../../context/AuthContext";

function DistrictFeed() {
  const { user } = useAuth();
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeed = async () => {
    try {
      const data = await getDistrictFeed();
      setFeed(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const handleUpvote = async (id) => {
    await upvoteComplaint(id);
    fetchFeed(); // refresh after upvote
  };

  if (loading) return <p>Loading feed...</p>;

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">
        Feed
      </h1>

      {feed.map((c) => (
        <div
          key={c._id}
          className="bg-white rounded-xl shadow p-4 space-y-3"
        >
          {c.attachments?.[0] && (
            <img
              src={c.attachments[0].url}
              className="rounded-lg w-full max-h-80 object-cover"
              alt=""
            />
          )}

          <div className="flex justify-between items-center">
            <span className="font-semibold">{c.category}</span>
            <span
              className={`px-2 py-1 rounded text-xs font-semibold ${
                c.priority === "HIGH"
                  ? "bg-red-100 text-red-700"
                  : c.priority === "MEDIUM"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {c.priority}
            </span>
          </div>

          <p className="text-gray-700">{c.description}</p>

          <p className="text-sm text-gray-500">
            📍 {c.location.localAddress}, {c.location.city}
          </p>

          <div className="flex justify-between items-center">
            <button
              onClick={() => handleUpvote(c._id)}
              className="px-4 py-1 rounded-full bg-blue-600 text-white hover:bg-blue-700"
            >
              👍 Upvote
            </button>

            <span className="text-sm font-semibold">
              {c.upvoteCount} upvotes
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default DistrictFeed;
