import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.send('✅ City Help backend is working!');
});

export default router;
