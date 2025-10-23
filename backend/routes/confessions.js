const express = require('express');
const jwt = require('jsonwebtoken');
const Confession = require('../models/Confession');
const User = require('../models/User');

const router = express.Router();

// Simple auth middleware
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

// Get confessions for user's college
router.get('/', auth, async (req, res) => {
    try {
        const { category = 'all', page = 1, limit = 20 } = req.query;

        // Get current user to find their college
        const currentUser = await User.findById(req.user.userId);
        if (!currentUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Build query
        const query = {
            college: currentUser.college,
            isReported: false
        };

        if (category !== 'all') {
            query.category = category;
        }

        // Get confessions with pagination
        const confessions = await Confession.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .lean();

        // Format confessions for frontend
        const formattedConfessions = confessions.map(confession => ({
            id: confession._id,
            content: confession.content,
            category: confession.category,
            reactions: {
                heart: confession.reactionCounts.heart,
                laugh: confession.reactionCounts.laugh,
                fire: confession.reactionCounts.fire,
                sad: confession.reactionCounts.sad
            },
            comments: confession.commentCount,
            timeAgo: getTimeAgo(confession.createdAt),
            isAnonymous: confession.isAnonymous,
            // Check user's reactions
            userReactions: {
                heart: confession.reactions.heart.some(r => r.user.toString() === req.user.userId),
                laugh: confession.reactions.laugh.some(r => r.user.toString() === req.user.userId),
                fire: confession.reactions.fire.some(r => r.user.toString() === req.user.userId),
                sad: confession.reactions.sad.some(r => r.user.toString() === req.user.userId)
            }
        }));

        console.log(`📖 Found ${formattedConfessions.length} confessions for ${currentUser.college}`);

        res.json({
            success: true,
            data: {
                confessions: formattedConfessions,
                hasMore: confessions.length === parseInt(limit)
            }
        });

    } catch (error) {
        console.error('❌ Error fetching confessions:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Create new confession
router.post('/', auth, async (req, res) => {
    try {
        const { content, category = 'secret' } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ success: false, message: 'Content is required' });
        }

        if (content.length > 1000) {
            return res.status(400).json({ success: false, message: 'Content too long (max 1000 characters)' });
        }

        // Get current user
        const currentUser = await User.findById(req.user.userId);
        if (!currentUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Create confession
        const confession = new Confession({
            content: content.trim(),
            category,
            author: req.user.userId,
            college: currentUser.college,
            isAnonymous: true
        });

        await confession.save();

        console.log(`✍️ New confession created by user ${req.user.userId} in ${currentUser.college}`);

        res.status(201).json({
            success: true,
            data: {
                confession: {
                    id: confession._id,
                    content: confession.content,
                    category: confession.category,
                    reactions: { heart: 0, laugh: 0, fire: 0, sad: 0 },
                    comments: 0,
                    timeAgo: 'now',
                    isAnonymous: true,
                    userReactions: { heart: false, laugh: false, fire: false, sad: false }
                }
            }
        });

    } catch (error) {
        console.error('❌ Error creating confession:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


// React to confession
router.post('/:id/react', auth, async (req, res) => {
    try {
        const confessionId = req.params.id;
        const userId = req.user.userId;
        const { type } = req.body;

        if (!['heart', 'laugh', 'fire', 'sad'].includes(type)) {
            return res.status(400).json({ success: false, message: 'Invalid reaction type' });
        }

        const confession = await Confession.findById(confessionId);
        if (!confession) {
            return res.status(404).json({ success: false, message: 'Confession not found' });
        }

        // Check if user already reacted with this type
        const existingReaction = confession.reactions[type].find(reaction => reaction.user.toString() === userId);

        if (existingReaction) {
            // Remove reaction
            confession.reactions[type] = confession.reactions[type].filter(reaction => reaction.user.toString() !== userId);
            confession.reactionCounts[type] = Math.max(0, confession.reactionCounts[type] - 1);
        } else {
            // Add reaction
            confession.reactions[type].push({ user: userId });
            confession.reactionCounts[type] = confession.reactionCounts[type] + 1;
        }

        await confession.save();

        res.json({
            success: true,
            data: {
                reactionCounts: confession.reactionCounts,
                userReacted: !existingReaction
            }
        });

    } catch (error) {
        console.error('❌ Error reacting to confession:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Helper function to calculate time ago
function getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return `${Math.floor(diffInSeconds / 604800)}w`;
}

module.exports = router;