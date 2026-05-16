import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  getDistrictFeed,
  upvoteComplaint,
} from "../../services/complaint.service";
import { useAuth } from "../../context/useAuth";
import { getSocket } from "../../socket";

let socket;

function DistrictFeed() {
  const { user } = useAuth();
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const district = user?.location?.district || "";
  const state = user?.location?.state || "";
  const city = user?.location?.city || "";

  const locationLabel = [city, district, state].filter(Boolean).join(", ");
  const feedOrderLabel = ["SUPER_ADMIN", "CENTRAL_ADMIN"].includes(user?.role)
    ? "Most voted first across all complaints"
    : user?.role === "STATE_ADMIN"
    ? "Most voted first within your state"
    : "Most recent first within your district";

  // Trending complaints for superadmin and central admin
  const trendingComplaints = useMemo(() => {
    if (!["SUPER_ADMIN", "CENTRAL_ADMIN"].includes(user?.role)) {
      return [];
    }
    return feed
      .filter(c => c.status !== "RESOLVED" && c.status !== "CLOSED")
      .sort((a, b) => (b.upvoteCount || 0) - (a.upvoteCount || 0))
      .slice(0, 8);
  }, [feed, user?.role]);

  useEffect(() => {
    const fetchFeed = async () => {
      const requiresDistrict = ["CITIZEN", "OFFICER", "DEPT_HEAD", "DISTRICT_ADMIN"].includes(
        user?.role
      );
      const requiresState = user?.role === "STATE_ADMIN";
      const hasMissingLocation = (requiresDistrict && !district) || (requiresState && !state);

      if (hasMissingLocation) {
        setFeed([]);
        setError(
          requiresState
            ? "Please add your state in Profile to see the state feed."
            : "Please add your state and district in Profile to see your district feed."
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const data = await getDistrictFeed();
        setFeed(data || []);
      } catch (e) {
        console.error(e);
        setError(e?.response?.data?.message || "Failed to load district feed");
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [district, state, user?.role]);

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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">District Feed</h1>
          <p className="text-sm text-gray-500">
            {locationLabel ? `Showing complaints for ${locationLabel}` : "Location based complaint feed"}
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">
            {feedOrderLabel}
          </p>
        </div>

        <Link
          to="/profile"
          className="inline-flex w-fit rounded-full border px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Update location
        </Link>
      </div>

      {error && (
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          {error}
        </div>
      )}

      {/* Trending Complaints Section - Only for SuperAdmin and CentralAdmin */}
      {["SUPER_ADMIN", "CENTRAL_ADMIN"].includes(user?.role) && trendingComplaints.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <h2 className="text-xl font-bold text-gray-800">Trending Complaints</h2>
            <span className="text-xs font-semibold bg-red-100 text-red-700 px-2 py-1 rounded-full">
              Most Upvoted (Active)
            </span>
          </div>
          
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {trendingComplaints.map((c) => (
              <Link
                to={`/complaints/${c._id}`}
                key={c._id}
                className="bg-white rounded-2xl shadow-sm border hover:shadow-md transition overflow-hidden cursor-pointer"
              >
                {/* Image */}
                {c.attachments?.[0] && (
                  <img
                    src={c.attachments[0].url}
                    alt={c.category}
                    className="w-full h-40 object-cover"
                  />
                )}
                
                {/* Content */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs font-semibold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
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
                  <p className="text-sm font-semibold text-gray-800 line-clamp-2">{c.description.substring(0, 60)}...</p>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-500">ID: {c._id.slice(-6)}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-lg">👍</span>
                      <span className="font-bold text-orange-600">{c.upvoteCount}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {!error && feed.length === 0 && (
        <div className="rounded-2xl border bg-white p-6 text-center text-sm text-gray-500">
          No complaints found for your location yet.
        </div>
      )}

      {/* All Feed Complaints */}
      {feed.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800">All Complaints</h2>
          
          {feed.map((c, index) => (
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
                <div className="flex justify-between items-center gap-3">
                  <span className="text-sm font-semibold text-gray-700">
                    {c.category}
                  </span>
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700">
                    #{index + 1}
                  </span>
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

                <div>
                  <p className="text-gray-700 font-medium">{c.title}</p>
                  <p className="text-gray-600 text-sm mt-1">{c.description}</p>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>ID: {c._id.slice(-6)}</span>
                  <span>
                    {c.status}
                  </span>
                  <span>
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-4 border-t pt-3">
                  <button
                    onClick={() => handleUpvote(c._id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition font-medium text-gray-700"
                  >
                    👍 {c.upvoteCount || 0} Upvotes
                  </button>
                  <Link
                    to={`/complaints/${c._id}`}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 transition font-medium text-blue-700"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DistrictFeed;
