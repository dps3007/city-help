import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getComplaintById, upvoteComplaint, submitFeedback } from "../../services/complaint.service";
import StatusStepper from "../../components/complaints/StatusStepper";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";

const STATUS_ORDER = [
  "SUBMITTED",
  "VERIFIED",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];

function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [upvoting, setUpvoting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState({ rating: 5, comment: "" });
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const data = await getComplaintById(id);
        setComplaint(data.complaint || data);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to fetch complaint");
      } finally {
        setLoading(false);
      }
    };
    fetchComplaint();
  }, [id]);

  const handleUpvote = async () => {
    try {
      setUpvoting(true);
      await upvoteComplaint(id);
      setComplaint((prev) => ({
        ...prev,
        upvotes: (prev.upvotes || 0) + 1,
      }));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to upvote");
    } finally {
      setUpvoting(false);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    try {
      setFeedbackLoading(true);
      await submitFeedback(id, feedback);
      setShowFeedback(false);
      setFeedback({ rating: 5, comment: "" });
      alert("Feedback submitted successfully!");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit feedback");
    } finally {
      setFeedbackLoading(false);
    }
  };

  if (loading) {
    return <p className="text-gray-600">Loading complaint...</p>;
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-600 rounded">{error}</div>;
  }

  if (!complaint) {
    return <div className="p-4 text-gray-600">Complaint not found</div>;
  }

  const statusIndex = STATUS_ORDER.indexOf(complaint.status);
  const allResolved = complaint.status === "RESOLVED" || complaint.status === "CLOSED";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded shadow-sm p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {complaint.title || complaint.category}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              ID: {complaint._id}
            </p>
          </div>
          <Badge status={complaint.status} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Category</p>
            <p className="font-semibold text-gray-800">
              {complaint.category}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Created</p>
            <p className="font-semibold text-gray-800">
              {new Date(complaint.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Priority</p>
            <p className="font-semibold text-gray-800">
              {complaint.priority || "Normal"}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Upvotes</p>
            <p className="font-semibold text-gray-800">
              {complaint.upvotes || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Description
        </h2>
        <p className="text-gray-700 leading-relaxed">
          {complaint.description}
        </p>
        {complaint.image && (
          <div className="mt-4">
            <img
              src={complaint.image}
              alt="Complaint"
              className="max-w-md rounded h-auto"
            />
          </div>
        )}
      </div>

      {/* Location */}
      {complaint.location && (
        <div className="bg-white rounded shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Location
          </h2>
          <p className="text-gray-700">{complaint.location}</p>
          {complaint.coordinates && (
            <p className="text-sm text-gray-500 mt-2">
              Lat: {complaint.coordinates.lat}, Lng: {complaint.coordinates.lng}
            </p>
          )}
        </div>
      )}

      {/* Status Timeline */}
      <div className="bg-white rounded shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Progress
        </h2>
        <StatusStepper currentStatus={complaint.status} />
      </div>

      {/* Assigned Officer */}
      {complaint.assignedTo && (
        <div className="bg-white rounded shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Assigned Officer
          </h2>
          <p className="text-gray-700">
            {complaint.assignedTo.name}
          </p>
          <p className="text-sm text-gray-500">
            {complaint.assignedTo.email}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="bg-white rounded shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Actions
        </h2>
        <div className="flex gap-2">
          <Button
            onClick={handleUpvote}
            disabled={upvoting}
            className="bg-green-600 hover:bg-green-700"
          >
            {upvoting ? "Upvoting..." : `👍 Upvote (${complaint.upvotes || 0})`}
          </Button>
          {allResolved && !showFeedback && (
            <Button
              onClick={() => setShowFeedback(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Submit Feedback
            </Button>
          )}
        </div>
      </div>

      {/* Feedback Form */}
      {showFeedback && (
        <div className="bg-white rounded shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Submit Feedback
          </h2>
          <form onSubmit={handleSubmitFeedback} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating (1-5)
              </label>
              <select
                value={feedback.rating}
                onChange={(e) =>
                  setFeedback((prev) => ({
                    ...prev,
                    rating: parseInt(e.target.value),
                  }))
                }
                className="w-full border rounded px-3 py-2 text-sm"
              >
                {[1, 2, 3, 4, 5].map((r) => (
                  <option key={r} value={r}>
                    {r} - {r === 5 ? "Excellent" : r === 1 ? "Poor" : "Good"}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment (Optional)
              </label>
              <textarea
                value={feedback.comment}
                onChange={(e) =>
                  setFeedback((prev) => ({
                    ...prev,
                    comment: e.target.value,
                  }))
                }
                className="w-full border rounded px-3 py-2 text-sm"
                rows="4"
                placeholder="Share your feedback..."
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={feedbackLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {feedbackLoading ? "Submitting..." : "Submit Feedback"}
              </Button>
              <Button
                type="button"
                onClick={() => setShowFeedback(false)}
                className="bg-gray-400 hover:bg-gray-500"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default ComplaintDetail;
