const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const User = require('../models/User');

// @route   POST /api/comments
// @desc    Add a comment to a Trip or Memory
// @access  Protected (User must be logged in, frontend passes userId)
router.post('/', async (req, res) => {
    try {
        const { userId, targetId, targetModel, text } = req.body;

        if (!userId || !targetId || !targetModel || !text) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        if (!['Trip', 'Memory'].includes(targetModel)) {
            return res.status(400).json({ message: 'Invalid target model' });
        }

        const newComment = new Comment({
            user: userId,
            targetId,
            targetModel,
            text
        });

        const savedComment = await newComment.save();

        // Push this comment ID to the user's myComments array
        await User.findByIdAndUpdate(userId, {
            $push: { myComments: savedComment._id }
        });

        // Populate user data before returning so the frontend can immediately render the avatar/name
        const populatedComment = await Comment.findById(savedComment._id)
            .populate('user', 'name username image role');

        res.status(201).json(populatedComment);
    } catch (err) {
        console.error("Error posting comment:", err);
        // Handle duplicate comment spam gracefully
        if (err.code === 11000) {
            return res.status(400).json({ message: 'You have already posted this exact comment here.' });
        }
        res.status(500).json({ message: 'Server error while posting comment' });
    }
});

// @route   GET /api/comments/:targetModel/:targetId
// @desc    Get all comments for a specific Trip or Memory
// @access  Public
router.get('/:targetModel/:targetId', async (req, res) => {
    try {
        const { targetModel, targetId } = req.params;

        if (!['Trip', 'Memory'].includes(targetModel)) {
            return res.status(400).json({ message: 'Invalid target model' });
        }

        const comments = await Comment.find({ targetId, targetModel })
            .populate('user', 'name username image role')
            .sort({ createdAt: -1 }); // Newest first

        res.json(comments);
    } catch (err) {
        console.error("Error fetching comments:", err);
        res.status(500).json({ message: 'Server error while fetching comments' });
    }
});

// @route   DELETE /api/comments/:commentId
// @desc    Delete a comment (Admin or Comment Owner)
// @access  Protected
router.delete('/:commentId', async (req, res) => {
    try {
        const { userId } = req.body; // Expect frontend to send the acting user's ID
        const commentId = req.params.commentId;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Ideally here we would also fetch the acting User to check if role === 'admin'
        // But for simplicity, we'll just check ownership
        if (comment.user.toString() !== userId) {
            // Need to verify if admin later
            const actingUser = await User.findById(userId);
            if (!actingUser || actingUser.role !== 'admin') {
                return res.status(403).json({ message: 'Not authorized to delete this comment' });
            }
        }

        await Comment.findByIdAndDelete(commentId);

        // Remove from User's myComments array
        await User.findByIdAndUpdate(comment.user, {
            $pull: { myComments: commentId }
        });

        res.json({ message: 'Comment deleted successfully' });
    } catch (err) {
        console.error("Error deleting comment:", err);
        res.status(500).json({ message: 'Server error while deleting comment' });
    }
});

module.exports = router;
