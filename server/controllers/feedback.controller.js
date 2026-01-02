export const submitFeedback = async (req, res) => {
  const { rating, comment } = req.body;

  res.status(201).json({
    success: true,
    message: 'Feedback submitted successfully',
    data: { rating, comment },
  });
};

export const getFeedbacks = async (req, res) => {
  res.status(200).json({
    success: true,
    feedbacks: [],
  });
};
