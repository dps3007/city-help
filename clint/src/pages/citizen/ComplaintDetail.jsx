import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getComplaintById,
  submitFeedback,
  getComplaintFeedbacks,
} from "../../services/complaint.service";

import { useAuth } from "../../context/AuthContext";
import StatusStepper from "../../components/complaints/StatusStepper";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Alert from "../../components/common/Alert";
import FeedbackModal from "../../components/feedback/FeedbackModal";
import ComplaintMap from "../../components/common/ComplaintMap";
import { ArrowLeft, MapPin, Calendar, Users, Star } from "lucide-react";

function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [focusMap, setFocusMap] = useState(false);
  
  // States for multiple feedbacks
  const [feedbacks, setFeedbacks] = useState([]);
  const [userHasGivenFeedback, setUserHasGivenFeedback] = useState(false);

  /* ---------------- FETCH ---------------- */

  const fetchComplaint = async () => {
    try {
      const data = await getComplaintById(id);
      setComplaint(data.complaint);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to load complaint"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch all feedbacks for this complaint
  const fetchFeedbacks = async () => {
    try {
      const data = await getComplaintFeedbacks(id);
      setFeedbacks(data.feedbacks || []);
      
      // Check if current user has already given feedback
      const hasFeedback = data.feedbacks?.some(
        (fb) => fb.user._id === user?._id
      );
      setUserHasGivenFeedback(hasFeedback);
    } catch (err) {
      console.error("Error fetching feedbacks:", err);
    }
  };

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  // Fetch feedbacks when complaint is loaded and is resolved/closed
  useEffect(() => {
    if (complaint && (complaint.status === "RESOLVED" || complaint.status === "CLOSED")) {
      fetchFeedbacks();
    }
  }, [complaint?.status, id]);

  /* ---------------- FEEDBACK ---------------- */

  const handleSubmitFeedback = async ({ rating, comment }) => {
    try {
      await submitFeedback(id, { rating, comment });
      alert("Feedback submitted successfully");
      setShowFeedback(false);
      // Refresh both complaint and feedbacks
      await fetchComplaint();
      await fetchFeedbacks();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to submit feedback");
    }
  };

  if (loading) return (
    <div className="space-y-6 p-6">
      <div className="animate-pulse space-y-6">
        <div className="h-10 bg-muted rounded-lg w-24" />
        <div className="h-32 bg-muted rounded-lg" />
      </div>
    </div>
  );

  if (error)
    return (
      <div className="p-6">
        <Alert type="error" title="Error Loading Complaint" message={error} />
      </div>
    );

  if (!complaint)
    return (
      <div className="p-6">
        <Alert type="info" title="Not Found" message="Complaint not found" />
      </div>
    );

  const resolvedOrClosed =
    complaint.status === "RESOLVED" ||
    complaint.status === "CLOSED";

  const hasGeo =
    complaint.location?.geo?.coordinates?.length === 2;

  const [lng, lat] = hasGeo
    ? complaint.location.geo.coordinates
    : [];

  // NEW: Check if user can give feedback
  const isOwnerOrSupporter =
    complaint.citizen?._id === user?._id ||
    complaint.supporters?.some((supporter) => 
      supporter._id === user?._id || supporter === user?._id
    );

  const canGiveFeedback =
    user?.role === "CITIZEN" &&
    isOwnerOrSupporter &&
    resolvedOrClosed &&
    !userHasGivenFeedback;

  /* ================= UI ================= */

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-6">

      {/* Back Button */}
      <Button
        onClick={() => navigate(-1)}
        variant="ghost"
        size="sm"
        className="text-primary-600 hover:bg-primary-100 inline-flex"
      >
        <ArrowLeft size={16} />
        Back
      </Button>

      {/* Header Card */}
      <Card className="p-6 bg-gradient-to-r from-primary-50 to-accent-50">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {complaint.category}
            </h1>
            <p className="text-muted-foreground mt-2 font-mono text-sm">
              ID: {complaint._id}
            </p>
          </div>
          <Badge status={complaint.status} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <DetailItem icon={Calendar} label="Created" value={new Date(complaint.createdAt).toLocaleDateString("en-GB")} />
          <DetailItem label="Category" value={complaint.category} />
          <DetailItem label="Priority" value="Normal" />
          <DetailItem label="Upvotes" value={complaint.upvoteCount} />
        </div>
      </Card>

      {/* Description */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-bold text-foreground">Description</h2>
        <p className="text-foreground leading-relaxed">{complaint.description}</p>

        {complaint.attachments?.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-muted-foreground mb-2">Attachments</p>
            <img
              src={complaint.attachments[0].url}
              alt="Complaint"
              className="max-w-sm h-auto rounded-lg border-2 border-border shadow-md"
            />
          </div>
        )}
      </Card>

      {/* Location */}
      {complaint.location && (
        <Card className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary-600" />
              <h2 className="text-lg font-bold text-foreground">Location</h2>
            </div>
            {hasGeo && (
              <Button
                onClick={() => {
                  setFocusMap(false);
                  setTimeout(() => setFocusMap(true), 100);
                }}
                variant="accent"
                size="sm"
              >
                Navigate Location
              </Button>
            )}            
          </div>

          <p className="text-foreground font-medium">
            {complaint.location.localAddress && (
              <>{complaint.location.localAddress}<br /></>
            )}
            {complaint.location.city}, {complaint.location.state} - {complaint.location.pincode}
          </p>

          {hasGeo && (
            <div className="rounded-lg overflow-hidden border-2 border-border h-80">
              <ComplaintMap
                lat={lat}
                lng={lng}
                focus={focusMap}
              />
            </div>
          )}
        </Card>
      )}

      {/* Municipal Authority */}
      {complaint.municipalId && (
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-primary-600" />
            Municipal Authority
          </h2>

          <div className="grid sm:grid-cols-3 gap-4">
            <DetailItem label="Municipal" value={complaint.municipalId.name} />
            <DetailItem label="Code" value={complaint.municipalId.code} />
            <DetailItem
              label="Jurisdiction"
              value={`${complaint.municipalId.location.district}, ${complaint.municipalId.location.state}`}
            />
          </div>
        </Card>
      )}

      {/* Progress */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-bold text-foreground">Resolution Progress</h2>
        <StatusStepper currentStatus={complaint.status} />
      </Card>

      {/* Assigned To */}
      {complaint.assignedTo && (
        <Card className="p-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Assigned To</p>
              <p className="text-lg font-bold text-foreground">{complaint.assignedTo.name}</p>
              <p className="text-sm text-muted-foreground font-mono mt-1">
                {complaint.assignedTo.email}
              </p>
            </div>

            {complaint.verifiedBy && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Verified By</p>
                <p className="text-lg font-bold text-foreground">{complaint.verifiedBy.name}</p>
                <p className="text-sm text-muted-foreground font-mono mt-1">
                  {complaint.verifiedBy.email}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Feedback Section */}
      {resolvedOrClosed && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-bold text-foreground">Customer Feedback</h2>
          </div>

          {/* Display all feedbacks */}
          {feedbacks.length > 0 ? (
            <div className="space-y-4">
              {feedbacks.map((feedback) => (
                <div key={feedback._id} className="border-b border-border pb-4 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">{feedback.user.name}</p>
                      {(feedback.user._id === complaint.citizen?._id || feedback.user._id === complaint.citizen) && (
                        <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">
                          Owner
                        </span>
                      )}
                      {complaint.supporters?.some(s => 
                        (s._id === feedback.user._id || s === feedback.user._id) && 
                        feedback.user._id !== complaint.citizen?._id && 
                        feedback.user._id !== complaint.citizen
                      ) && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          Supporter
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(feedback.createdAt).toLocaleDateString("en-GB")}
                    </span>
                  </div>

                  {/* Star rating */}
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < feedback.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}
                      />
                    ))}
                  </div>

                  {/* Comment */}
                  {feedback.comment && <p className="text-foreground text-sm leading-relaxed">{feedback.comment}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4">No feedback submitted yet</p>
          )}

          {/* Feedback CTA */}
          {canGiveFeedback && (
            <Button
              onClick={() => setShowFeedback(true)}
              fullWidth
              variant="primary"
              size="md"
              className="mt-4"
            >
              Submit Your Feedback
            </Button>
          )}
          {userHasGivenFeedback && (
            <Alert type="success" message="Thank you for your feedback!" dismissible={false} />
          )}
          {!resolvedOrClosed && (
            <Alert type="info" message="Feedback will be available once the complaint is resolved." dismissible={false} />
          )}
        </Card>
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

/* ---------- Components ---------- */
function DetailItem({ icon: Icon, label, value }) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-1">
        {Icon && <Icon size={16} className="text-muted-foreground" />}
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-sm font-semibold text-foreground">{value || "—"}</p>
    </div>
  );
}

export default ComplaintDetail;
