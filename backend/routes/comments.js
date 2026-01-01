import express from 'express';
import Comment from '../models/Comment.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/comments
 * @desc    Add a comment to a note
 * @access  Private (authenticated users only)
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { note_id, text, rating } = req.body;
    const userId = req.user.id;

    // Validation
    if (!note_id) {
      return res.status(400).json({
        success: false,
        message: 'note_id is required'
      });
    }

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }

    if (text.length > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Comment text cannot exceed 5000 characters'
      });
    }

    // Validate rating if provided
    if (rating !== null && rating !== undefined) {
      const ratingNum = parseInt(rating);
      if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      }
    }

    // Create comment
    const comment = await Comment.create(
      userId,
      note_id,
      text.trim(),
      rating || null
    );

    // Get the comment with user info
    const fullComment = await Comment.getById(comment.id);

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: fullComment
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/comments
 * @desc    Get comments for a note with pagination
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { note_id, limit = 10, offset = 0 } = req.query;

    // Validation
    if (!note_id) {
      return res.status(400).json({
        success: false,
        message: 'note_id is required'
      });
    }

    // Parse pagination params
    const limitNum = Math.min(parseInt(limit) || 10, 100); // Max 100
    const offsetNum = parseInt(offset) || 0;

    // Get comments
    const result = await Comment.getByNoteId(note_id, limitNum, offsetNum);

    // Get average rating
    const ratingData = await Comment.getAverageRating(note_id);

    res.status(200).json({
      success: true,
      message: 'Comments retrieved successfully',
      data: {
        comments: result.comments,
        pagination: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
          hasMore: result.offset + result.limit < result.total
        },
        rating: ratingData
      }
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comments',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/comments/:id
 * @desc    Get a single comment by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.getById(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Comment retrieved successfully',
      data: comment
    });
  } catch (error) {
    console.error('Error fetching comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comment',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/comments/:id
 * @desc    Update a comment
 * @access  Private (comment owner only)
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { text, rating } = req.body;
    const userId = req.user.id;

    // Validation
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }

    if (text.length > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Comment text cannot exceed 5000 characters'
      });
    }

    // Validate rating if provided
    if (rating !== null && rating !== undefined) {
      const ratingNum = parseInt(rating);
      if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      }
    }

    // Update comment
    const updatedComment = await Comment.update(
      id,
      userId,
      text.trim(),
      rating || null
    );

    if (!updatedComment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found or you are not authorized to update it'
      });
    }

    // Get full comment data
    const fullComment = await Comment.getById(id);

    res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      data: fullComment
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update comment',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/comments/:id
 * @desc    Delete a comment (soft delete)
 * @access  Private (comment owner only)
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const deleted = await Comment.delete(id, userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found or you are not authorized to delete it'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete comment',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/comments/rating/:note_id
 * @desc    Get average rating for a note
 * @access  Public
 */
router.get('/rating/:note_id', async (req, res) => {
  try {
    const { note_id } = req.params;

    const ratingData = await Comment.getAverageRating(note_id);

    res.status(200).json({
      success: true,
      message: 'Rating data retrieved successfully',
      data: ratingData
    });
  } catch (error) {
    console.error('Error fetching rating:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rating',
      error: error.message
    });
  }
});

export default router;
