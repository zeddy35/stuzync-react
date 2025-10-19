import express from 'express';
import Post from '../models/Post.js';
const router = express.Router();

router.get('/api/me', (req, res) => {
  if (!req.user) return res.json(null);
  const { _id, name, email, profilePic, isAdmin } = req.user;
  res.json({ _id, name, email, profilePic, isAdmin });
});

router.get('/api/feed', async (req, res, next) => {
  try {
    const me = req.user;
    const friendIds = Array.isArray(me?.friends) ? me.friends : [];
    const query = friendIds.length
      ? { isFlagged: false, author: { $in: [...friendIds, me?._id].filter(Boolean) } }
      : { isFlagged: false };

    if (req.query.tag) query.tags = req.query.tag;

    const posts = await Post.find(query)
      .populate('author', 'name profilePic')
      .populate({ path: 'sharedFrom', populate: { path: 'author', select: 'name profilePic' } })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json(posts);
  } catch (e) { next(e); }
});

// popular tags
router.get('/api/popular-tags', async (req, res, next) => {
  try {
    const tags = await Post.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    res.json(tags);
  } catch (e) { next(e); }
});

export default router;
