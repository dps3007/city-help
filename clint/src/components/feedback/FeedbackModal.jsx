import { useState } from "react";

function FeedbackModal({ onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-xl p-6 w-[400px]">
        <h2 className="text-xl font-semibold text-center mb-2">
          Your Opinion Matters!
        </h2>

        {/* ⭐ STARS */}
        <div className="flex justify-center gap-2 mt-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`text-4xl cursor-pointer ${
                (hover || rating) >= star
                  ? "text-yellow-400"
                  : "text-gray-300"
              }`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
            >
              ★
            </span>
          ))}
        </div>

        {/* COMMENT */}
        <textarea
          className="w-full border rounded p-2 mt-4"
          placeholder="Add comments"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        {/* BUTTONS */}
        <div className="flex gap-3 mt-4">
          <button
            className="flex-1 bg-teal-500 text-white py-2 rounded disabled:opacity-50"
            disabled={rating === 0}
            onClick={() => onSubmit({ rating, comment })}
          >
            DONE
          </button>

          <button
            className="flex-1 bg-gray-300 py-2 rounded"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default FeedbackModal;
