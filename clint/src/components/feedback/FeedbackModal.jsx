import { useState } from "react";
import { Star, X } from "lucide-react";
import Button from "../common/Button";
import Modal from "../common/Modal";

function FeedbackModal({ onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit({ rating, comment });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="How satisfied are you?"
      size="md"
    >
      <div className="space-y-6">
        {/* Rating */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            Rate your experience
          </p>
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110 focus:outline-none"
              >
                <Star
                  size={32}
                  className={`${
                    (hover || rating) >= star
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-center text-sm font-medium text-primary-600">
              {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
            </p>
          )}
        </div>

        {/* Comment */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Additional comments (optional)
          </label>
          <textarea
            placeholder="Share your feedback..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            rows={4}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || loading}
            loading={loading}
            fullWidth
            variant="primary"
          >
            Submit Feedback
          </Button>
          <Button
            onClick={onClose}
            disabled={loading}
            fullWidth
            variant="outline"
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default FeedbackModal;
