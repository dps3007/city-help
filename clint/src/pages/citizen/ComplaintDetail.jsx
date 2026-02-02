import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getComplaintById,
  submitFeedback,
} from "../../services/complaint.service";

import { useAuth } from "../../context/AuthContext";
import StatusStepper from "../../components/complaints/StatusStepper";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import FeedbackModal from "../../components/feedback/FeedbackModal";
import ComplaintMap from "../../components/common/ComplaintMap";

function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [focusMap, setFocusMap] = useState(false);

  /* ---------------- FETCH ---------------- */

  const fetchComplaint = async () => {
    try {
      const data = await getComplaintById(id);
      setComplaint({
        ...data.complaint,
        feedback:
          data.complaint.feedback || data.feedback || null,
           municipal: data.municipal || null,
      });
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

  /* ---------------- FEEDBACK ---------------- */

  const handleSubmitFeedback = async ({ rating, comment }) => {
    try {
      await submitFeedback(id, { rating, comment });
      alert("Feedback submitted successfully");
      setShowFeedback(false);
      fetchComplaint();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to submit feedback");
    }
  };

  if (loading) return <p className="text-gray-600">Loading complaint…</p>;

  if (error)
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded">
        {error}
      </div>
    );

  if (!complaint)
    return <p className="text-gray-600">Complaint not found</p>;

  const resolvedOrClosed =
    complaint.status === "RESOLVED" ||
    complaint.status === "CLOSED";

  const canGiveFeedback =
    user?.role === "CITIZEN" &&
    resolvedOrClosed &&
    !complaint.feedback;

  /* ================= UI ================= */

  return (
    <div className="space-y-6 max-w-5xl">

      {/* HEADER */}
      <div className="bg-white rounded-xl shadow p-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="
            inline-flex items-center gap-2
            px-4 py-2
            rounded-lg
            bg-blue-600 text-white
            text-sm font-medium
            hover:bg-blue-700
            transition
            shadow-sm
          "
        >
          <span className="text-lg leading-none">←</span>
          Back
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

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 text-sm">
          <Detail label="Category" value={complaint.category} />
          <Detail
            label="Created"
            value={new Date(complaint.createdAt).toLocaleDateString("en-GB")}
          />
          <Detail label="Priority" value="Normal" />
          <Detail
            label="Upvotes"
            value={complaint.upvoteCount}
          />
        </div>
      </div>

      {/* DESCRIPTION */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-3">Description</h2>
        <p className="text-gray-700">{complaint.description}</p>

        {complaint.attachments?.length > 0 && (
          <img
            src={complaint.attachments[0].url}
            alt="Complaint"
            className="mt-4 max-w-md rounded-lg border"
          />
        )}
        
      </div>

      {/* LOCATION */}
      {complaint.location && (
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Location</h2>
            {complaint.location?.coordinates && (
              <Button
                onClick={() => {
                  setFocusMap(false);
                  setTimeout(() => setFocusMap(true), 100);
                }}
                className="bg-green-600 hover:bg-green-700 text-sm"
              >
                📍 Go to Location
              </Button>
            )}
          </div>

          <p className="text-gray-700 mb-4">
            {complaint.location.localAddress && (
              <>{complaint.location.localAddress}, </>
            )}
            {complaint.location.city}, {complaint.location.state}
          </p>

          {complaint.location?.coordinates && (
            <div className="rounded-lg overflow-hidden border">
              <ComplaintMap
                lat={complaint.location.coordinates.lat}
                lng={complaint.location.coordinates.lng}
                focus={focusMap}
              />
            </div>
          )}
        </div>
      )}

      {/* MUNICIPAL */}
      {complaint.municipal && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-2">
            Municipal Authority
          </h2>

          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <Detail
              label="Municipal Name"
              value={complaint.municipal.name}
            />
            <Detail
              label="Code"
              value={complaint.municipal.code}
            />
            <Detail
              label="Jurisdiction"
              value={`${complaint.municipal.district}, ${complaint.municipal.state}`}
            />
          </div>
        </div>
      )}

      {/* PROGRESS */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Progress</h2>
        <StatusStepper currentStatus={complaint.status} />
      </div>

      {/* ASSIGNED */}
      {complaint.assignedTo && (
        <div className="bg-white rounded-xl shadow p-6 grid sm:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500">Assigned To</p>
            <p className="font-semibold">{complaint.assignedTo.name}</p>
            <p className="text-sm text-gray-500">
              {complaint.assignedTo.email}
            </p>
          </div>

          {complaint.verifiedBy && (
            <div>
              <p className="text-sm text-gray-500">Assigned By</p>
              <p className="font-semibold">{complaint.verifiedBy.name}</p>
              <p className="text-sm text-gray-500">
                {complaint.verifiedBy.email}
              </p>
            </div>
          )}
        </div>
      )}

      {/* FEEDBACK */}
      {resolvedOrClosed && (
        <div className="bg-white rounded-xl shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold">Feedback</h2>

          {complaint.feedback ? (
            <div>
              <div className="flex justify-between mb-3">
                <div className="flex gap-1 text-blue-700">
                  {Array.from({
                    length: complaint.feedback.rating,
                  }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(
                    complaint.feedback.createdAt
                  ).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-800">
                {complaint.feedback.comment}
              </p>
            </div>
          ) : canGiveFeedback ? (
            <Button
              onClick={() => setShowFeedback(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Submit Feedback
            </Button>
          ) : (
            <p className="text-sm text-gray-500">
              Only the citizen who raised this complaint can submit feedback.
            </p>
          )}
        </div>
      )}

      {/* FEEDBACK MODAL (FIXED Z-INDEX) */}
      {showFeedback && (
        <FeedbackModal
          onClose={() => setShowFeedback(false)}
          onSubmit={handleSubmitFeedback}
        />
      )}
    </div>
  );
}

/* ---------- Small Component ---------- */
function Detail({ label, value }) {
  return (
    <div>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="font-semibold text-gray-800">
        {value || "—"}
      </p>
    </div>
  );
}

export default ComplaintDetail;
