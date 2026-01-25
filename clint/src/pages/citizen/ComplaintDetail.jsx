import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getComplaintById,
  upvoteComplaint,
  submitFeedback,
} from "../../services/complaint.service";

import StatusStepper from "../../components/complaints/StatusStepper";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import FeedbackModal from "../../components/feedback/FeedbackModal";


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

  // fatch complaint details
  const fetchComplaint = async () => {
    try {
      const data = await getComplaintById(id);
      
      setComplaint({ ...data.complaint, feedback: data.complaint.feedback || data.feedback || null });  

    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to load complaint"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaint();
  }, [id]);


  // upvote handler
  const handleUpvote = async () => {
    try {
      setUpvoting(true);
      await upvoteComplaint(id);

      setComplaint((prev) => ({
        ...prev,
        upvotes: [...(prev.upvotes || []), "temp"],
      }));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to upvote");
    } finally {
      setUpvoting(false);
    }
  };

  // FEEDBACK SUBMISSION HANDLER
    const handleSubmitFeedback = async ({ rating, comment }) => {
      try {
        await submitFeedback(id, { rating, comment });
        alert("Feedback submitted successfully");
        setShowFeedback(false);
        await fetchComplaint();
        
      } catch (err) {
        alert(err?.response?.data?.message || "Failed to submit feedback");
      }
    };


  // state handlers
  if (loading) return <p className="text-gray-600">Loading complaint...</p>;

  if (error)
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded">
        {error}
      </div>
    );

  if (!complaint)
    return <div className="p-4 text-gray-600">Complaint not found</div>;

  const resolvedOrClosed =
    complaint.status === "RESOLVED" ||
    complaint.status === "CLOSED";

  /* ================= UI ================= */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded shadow-sm p-6">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-blue-600 hover:underline mb-3"
        >
          ← Back
        </button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {complaint.category}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              ID: {complaint._id}
            </p>
          </div>
          <Badge status={complaint.status} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-sm">
          <Detail label="Category" value={complaint.category} />
          <Detail
            label="Created"
            value={new Date(complaint.createdAt).toLocaleDateString()}
          />
          <Detail label="Priority" value="Normal" />
          <Detail
            label="Upvotes"
            value={complaint.upvotes?.length || 0}
          />
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-3">Description</h2>
        <p className="text-gray-700">{complaint.description}</p>

        {complaint.attachments?.length > 0 && (
          <img
            src={complaint.attachments[0].url}
            alt="Complaint"
            className="mt-4 max-w-md rounded"
          />
        )}
      </div>

      {/* Location */}
      {complaint.location && (
        <div className="bg-white rounded shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-3">Location</h2>
          <p className="text-gray-700">
            {complaint.location.city}, {complaint.location.state}
          </p>
          {complaint.location.coordinates && (
            <p className="text-sm text-gray-500 mt-1">
              Lat: {complaint.location.coordinates.lat}, Lng:{" "}
              {complaint.location.coordinates.lng}
            </p>
          )}
        </div>
      )}

      {/* Status */}
      <div className="bg-white rounded shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Progress</h2>
        <StatusStepper currentStatus={complaint.status} />
      </div>

      {/* Assigned Officer */}
      {complaint.assignedTo && (
        <div className="bg-white rounded shadow-sm p-6 flex justify-between item">
          <h2 className="text-lg font-semibold mb-3 ">Assigned Details</h2>

          {/* Assigned To */}
          <div className="mb-3">
            <p className="text-sm text-gray-500">Assigned To</p>
            <p className="font-semibold text-gray-800">
              {complaint.assignedTo.name}
            </p>
            <p className="text-sm text-gray-500">
              {complaint.assignedTo.email}
            </p>
          </div>

          {/* Assigned By (verified by)*/}
            {complaint.verifiedBy && (
              <div>
                <p className="text-sm text-gray-500">Assigned By</p>
                <p className="font-semibold text-gray-800">
                  {complaint.verifiedBy.name}
                </p>
                <p className="text-sm text-gray-500">
                  {complaint.verifiedBy.email}
                </p>
              </div>
            )}
          </div>
        )}


      {/* Feedback */}
      <div className="bg-white rounded shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Feedback</h2>

        <div className="flex items-center gap-3">
          {resolvedOrClosed ? (
            complaint.feedback ? (
              <span className="text-green-600 font-semibold">
                ✅ Feedback Submitted
              </span>
            ) : (
              <Button
                onClick={() => setShowFeedback(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Submit Feedback
              </Button>
            )
          ) : null}
        </div>
      </div>

      {/* Feedback Card */}
      {resolvedOrClosed && complaint.feedback && (
        <div className="bg-white rounded-l p-6 max-w-2xl">
          <div className="flex justify-between mb-4">
            <div className="flex gap-1 text-blue-800">
              {Array.from({ length: complaint.feedback.rating }).map((_, i) => (
                <span key={i}>★</span>
              ))}
            </div>
            <span className="text-sm text-black">
              {new Date(
                complaint.feedback.createdAt
              ).toLocaleDateString("en-GB")}
            </span>
          </div>

          <p className="text-black text-lg">
            {complaint.feedback.comment}
          </p>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedback && (
        <FeedbackModal
          onClose={() => setShowFeedback(false)}
          onSubmit={handleSubmitFeedback}
        />
      )}
    </div>
  );
}

/* ================= SMALL COMPONENT ================= */
function Detail({ label, value }) {
  return (
    <div>
      <p className="text-gray-500">{label}</p>
      <p className="font-semibold text-gray-800">
        {value || "—"}
      </p>
    </div>
  );
}

export default ComplaintDetail;
