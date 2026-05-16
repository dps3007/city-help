import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getComplaintById,
  submitFeedback,
  getComplaintFeedbacks,
} from "../../services/complaint.service";

import { useAuth } from "../../context/useAuth";
import StatusStepper from "../../components/complaints/StatusStepper";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import FeedbackModal from "../../components/feedback/FeedbackModal";
import ComplaintMap from "../../components/common/ComplaintMap";
import Card, { CardBody, CardHeader } from "../../components/ui/Card";
import SectionHeader from "../../components/ui/SectionHeader";
import EmptyState from "../../components/ui/EmptyState";
import { toast } from "react-toastify";
import { ArrowLeft, MapPinned, MessageSquareMore, Paperclip, ShieldCheck, UserRound } from "lucide-react";
import dayjs from "dayjs";

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

  const fetchComplaint = useCallback(async () => {
    try {
      const data = await getComplaintById(id);
      setComplaint(data.complaint);
      setFeedbacks(data.complaint?.feedback || []);

      const hasFeedback = data.complaint?.feedback?.some(
        (fb) => fb.user?._id === user?._id
      );
      setUserHasGivenFeedback(Boolean(hasFeedback));
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to load complaint"
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Fetch all feedbacks for this complaint
  const fetchFeedbacks = useCallback(async () => {
    try {
      const data = await getComplaintFeedbacks(id);
      setFeedbacks(data.feedbacks || []);
      
      // Check if current user has already given feedback
      const hasFeedback = data.feedbacks?.some(
        (fb) => fb.user?._id === user?._id
      );
      setUserHasGivenFeedback(hasFeedback);
    } catch (err) {
      console.error("Error fetching feedbacks:", err);
    }
  }, [id, user?._id]);

  useEffect(() => {
    fetchComplaint();
  }, [fetchComplaint]);

  // Fetch feedbacks when complaint is loaded and is resolved/closed
  useEffect(() => {
    if (complaint && (complaint.status === "RESOLVED" || complaint.status === "CLOSED")) {
      fetchFeedbacks();
    }
  }, [complaint, fetchFeedbacks]);

  /* ---------------- FEEDBACK ---------------- */

  const handleSubmitFeedback = async ({ rating, comment }) => {
    try {
      await submitFeedback(id, { rating, comment });
      toast.success("Feedback submitted successfully");
      setShowFeedback(false);
      // Refresh both complaint and feedbacks
      await fetchComplaint();
      await fetchFeedbacks();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit feedback");
    }
  };

  if (loading) return <div className="surface p-8 text-slate-300">Loading complaint…</div>;

  if (error)
    return (
      <div className="rounded-3xl border border-rose-500/15 bg-rose-500/10 p-4 text-rose-100">
        {error}
      </div>
    );

  if (!complaint)
    return <EmptyState title="Complaint not found" description="The requested complaint could not be loaded." />;

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

  const complaintFeedbacks = complaint.feedback || [];
  const visibleFeedbacks = complaintFeedbacks.length > 0 ? complaintFeedbacks : feedbacks;

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Complaint detail"
        title={complaint.category}
        description={`Complaint ${complaint._id}`}
        action={<Button variant="secondary" onClick={() => navigate(-1)} leadingIcon={<ArrowLeft size={16} />}>Back</Button>}
      />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Case overview</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge status={complaint.status} />
                  <span className="text-xs text-slate-500">Upvotes: {complaint.upvoteCount}</span>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Created</p>
                <p className="mt-1 text-sm font-semibold text-white">{dayjs(complaint.createdAt).format("DD MMM YYYY")}</p>
              </div>
            </div>
          </CardHeader>

          <CardBody className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-4">
              <Meta label="Category" value={complaint.category} icon={<ShieldCheck size={15} />} />
              <Meta label="Priority" value="Normal" icon={<UserRound size={15} />} />
              <Meta label="Upvotes" value={complaint.upvoteCount} icon={<MessageSquareMore size={15} />} />
              <Meta label="Created" value={dayjs(complaint.createdAt).format("DD MMM")} icon={<Paperclip size={15} />} />
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Description</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">{complaint.description}</p>
              {complaint.attachments?.length > 0 && (
                <img src={complaint.attachments[0].url} alt="Complaint" className="mt-5 max-h-[28rem] w-full rounded-3xl object-cover" />
              )}
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Progress</p>
                  <h3 className="mt-2 text-lg font-semibold text-white">Status timeline</h3>
                </div>
              </div>
              <StatusStepper currentStatus={complaint.status} />
            </div>
          </CardBody>
        </Card>

        <div className="space-y-6">
          {complaint.location && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <MapPinned className="text-cyan-300" size={18} />
                  <div>
                    <h3 className="text-lg font-semibold text-white">Location</h3>
                    <p className="text-sm text-slate-400">Geographic evidence and jurisdiction data</p>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="space-y-4">
                <p className="text-sm leading-6 text-slate-300">
                  {complaint.location.localAddress && <>{complaint.location.localAddress}, </>}
                  {complaint.location.city}, {complaint.location.state}
                </p>
                {hasGeo && (
                  <Button
                    onClick={() => {
                      setFocusMap(false);
                      setTimeout(() => setFocusMap(true), 100);
                    }}
                    className="w-full"
                  >
                    Go to location
                  </Button>
                )}
                {hasGeo && <ComplaintMap lat={lat} lng={lng} focus={focusMap} />}
              </CardBody>
            </Card>
          )}

          {complaint.municipalId && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-white">Municipal authority</h3>
              </CardHeader>
              <CardBody className="space-y-3">
                <Detail label="Municipal name" value={complaint.municipalId.name} />
                <Detail label="Code" value={complaint.municipalId.code} />
                <Detail label="Jurisdiction" value={`${complaint.municipalId.location.district}, ${complaint.municipalId.location.state}`} />
              </CardBody>
            </Card>
          )}

          {(complaint.assignedTo || complaint.verifiedBy) && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-white">Assignment</h3>
              </CardHeader>
              <CardBody className="space-y-4">
                {complaint.assignedTo && <Detail label="Assigned to" value={`${complaint.assignedTo.name} • ${complaint.assignedTo.email}`} />}
                {complaint.verifiedBy && <Detail label="Assigned by" value={`${complaint.verifiedBy.name} • ${complaint.verifiedBy.email}`} />}
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      {resolvedOrClosed && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <MessageSquareMore className="text-cyan-300" size={18} />
              <div>
                <h3 className="text-lg font-semibold text-white">Feedback</h3>
                <p className="text-sm text-slate-400">Citizen sentiment after resolution</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="space-y-5">
            {visibleFeedbacks.length > 0 ? (
              <div className="space-y-4">
                {visibleFeedbacks.map((feedback) => (
                  <div key={feedback._id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{feedback.user.name}</span>
                        {((feedback.user._id === complaint.citizen?._id) || feedback.user._id === complaint.citizen) && <span className="rounded-full bg-cyan-400/10 px-2 py-1 text-xs text-cyan-200">Owner</span>}
                      </div>
                      <span className="text-xs text-slate-400">{dayjs(feedback.createdAt).format("DD MMM YYYY")}</span>
                    </div>
                    <div className="mt-3 flex gap-1 text-amber-300">
                      {Array.from({ length: feedback.rating }).map((_, index) => <span key={index}>★</span>)}
                      {Array.from({ length: 5 - feedback.rating }).map((_, index) => <span key={index} className="text-slate-600">★</span>)}
                    </div>
                    {feedback.comment && <p className="mt-3 text-sm leading-6 text-slate-300">{feedback.comment}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No feedback submitted yet.</p>
            )}

            {canGiveFeedback ? (
              <Button onClick={() => setShowFeedback(true)} className="w-full">
                Submit your feedback
              </Button>
            ) : resolvedOrClosed ? null : (
              <p className="text-sm text-slate-400">Feedback becomes available once the complaint is resolved or closed.</p>
            )}
          </CardBody>
        </Card>
      )}

      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} onSubmit={handleSubmitFeedback} />}
    </div>
  );
}

/* ---------- Small Component ---------- */
function Detail({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value || "—"}</p>
    </div>
  );
}

function Meta({ label, value, icon }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-2 text-cyan-300">{icon}<span className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">{label}</span></div>
      <p className="mt-3 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

export default ComplaintDetail;