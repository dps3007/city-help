import { useState } from "react";
import { X, Star } from "lucide-react";

function FeedbackModal({ onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit({ rating, comment });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/95 via-slate-950/95 to-slate-900/95 p-6 shadow-2xl sm:p-8">
        {/* HEADER */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">Share Your Feedback</h2>
            <p className="mt-1 text-sm text-slate-400">Your opinion helps improve civic services</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>

        {/* STAR RATING */}
        <div className="mb-6">
          <label className="mb-3 block text-sm font-semibold text-white">Rating</label>
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                className="transition-transform hover:scale-110"
                aria-label={`Rate ${star} stars`}
              >
                <Star
                  size={32}
                  className={`transition ${
                    (hover || rating) >= star
                      ? "fill-amber-400 text-amber-400 drop-shadow-lg drop-shadow-amber-400/50"
                      : "text-slate-500 hover:text-slate-400"
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="mt-3 text-center text-sm text-amber-300">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>
          )}
        </div>

        {/* COMMENT TEXTAREA */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-semibold text-white">Comments (optional)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts, suggestions, or details about your experience..."
            rows="4"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-400 transition focus:border-cyan-400/50 focus:bg-white/8 focus:outline-none focus:ring-1 focus:ring-cyan-400/30"
          />
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={rating === 0 || submitting}
            className="flex-1 rounded-2xl border border-transparent bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:shadow-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Feedback"}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-slate-200 transition hover:bg-white/10"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default FeedbackModal;
