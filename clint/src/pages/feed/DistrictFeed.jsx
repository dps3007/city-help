import { useEffect, useState } from "react";
import {
  getDistrictFeed,
  upvoteComplaint,
} from "../../services/complaint.service";
import { useAuth } from "../../context/AuthContext";
import { getSocket } from "../../socket";

let socket;

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

  useEffect(() => {
    socket = getSocket();
    const onUpvote = ({ complaintId, upvoteCount, priority }) => {
      setFeed((prev) =>
        prev.map((c) =>
          c._id === complaintId
            ? { ...c, upvoteCount, priority }
            : c
        )
      );
    };

    socket.on("complaint:upvote", onUpvote);
    return () => socket.off("complaint:upvote", onUpvote);
  }, []);

  const handleUpvote = async (id) => {
    await upvoteComplaint(id);
  };

  if (loading)
    return (
      <div className="flex justify-center py-10 text-gray-500">
        Loading feed…
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">District Feed</h1>

      {feed.map((c) => (
        <div
          key={c._id}
          className="bg-white rounded-2xl shadow-sm border hover:shadow-md transition overflow-hidden"
        >
          {/* Image */}
          {c.attachments?.[0] && (
            <img
              src={c.attachments[0].url}
              className="w-full h-56 object-cover"
              alt=""
            />
          )}

          {/* Content */}
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700">
                {c.category}
              </span>

              <span
                className={`px-2 py-0.5 text-xs rounded-full font-semibold ${
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

            <p className="text-gray-800 text-sm leading-relaxed">
              {c.description}
            </p>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => handleUpvote(c._id)}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 active:scale-95 transition"
              >
                👍 Upvote
              </button>

              <span className="text-sm font-semibold text-gray-700">
                {c.upvoteCount} upvotes
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default DistrictFeed;
