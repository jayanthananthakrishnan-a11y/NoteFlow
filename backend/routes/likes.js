import express from 'express';
import Like from '../models/Like.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/likes
 * @desc    Toggle like on a note (like/unlike)
 * @access  Private (authenticated users only)
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { note_id } = req.body;
    const userId = req.user.id;

    // Validation
    if (!note_id) {
      return res.status(400).json({
        success: false,
        message: 'note_id is required'
      });
    }

    // Toggle like
    const result = await Like.toggle(userId, note_id);

    res.status(200).json({
      success: true,
      message: result.action === 'liked' ? 'Note liked successfully' : 'Note unliked successfully',
      data: result
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    
    // Handle duplicate key constraint
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'You have already liked this note'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to toggle like',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/likes
 * @desc    Get total likes for a note
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { note_id } = req.query;

    // Validation
    if (!note_id) {
      return res.status(400).json({
        success: false,
        message: 'note_id is required'
      });
    }

    // Get like count
    const likeCount = await Like.getCount(note_id);

    res.status(200).json({
      success: true,
      message: 'Like count retrieved successfully',
      data: {
        note_id,
        likeCount
      }
    });
  } catch (error) {
    console.error('Error fetching like count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch like count',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/likes/check/:note_id
 * @desc    Check if current user has liked a note
 * @access  Private
 */
router.get('/check/:note_id', authenticate, async (req, res) => {
  try {
    const { note_id } = req.params;
    const userId = req.user.id;

    const hasLiked = await Like.hasUserLiked(userId, note_id);

    res.status(200).json({
      success: true,
      message: 'Like status retrieved successfully',
      data: {
        note_id,
        isLiked: hasLiked
      }
    });
  } catch (error) {
    console.error('Error checking like status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check like status',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/likes/note/:note_id
 * @desc    Get all users who liked a note with pagination
 * @access  Public
 */
router.get('/note/:note_id', async (req, res) => {
  try {
    const { note_id } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Parse pagination params
    const limitNum = Math.min(parseInt(limit) || 50, 100); // Max 100
    const offsetNum = parseInt(offset) || 0;

    const result = await Like.getByNoteId(note_id, limitNum, offsetNum);

    res.status(200).json({
      success: true,
      message: 'Likes retrieved successfully',
      data: {
        likes: result.likes,
        pagination: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
          hasMore: result.offset + result.limit < result.total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching likes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch likes',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/likes/user/liked-notes
 * @desc    Get all notes liked by the current user
 * @access  Private
 */
router.get('/user/liked-notes', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    // Parse pagination params
    const limitNum = Math.min(parseInt(limit) || 20, 100);
    const offsetNum = parseInt(offset) || 0;

    const result = await Like.getLikedNotesByUser(userId, limitNum, offsetNum);

    res.status(200).json({
      success: true,
      message: 'Liked notes retrieved successfully',
      data: {
        notes: result.notes,
        pagination: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
          hasMore: result.offset + result.limit < result.total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching liked notes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch liked notes',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/likes/:note_id
 * @desc    Remove a like from a note
 * @access  Private
 */
router.delete('/:note_id', authenticate, async (req, res) => {
  try {
    const { note_id } = req.params;
    const userId = req.user.id;

    const removed = await Like.remove(userId, note_id);

    if (!removed) {
      return res.status(404).json({
        success: false,
        message: 'Like not found'
      });
    }

    // Get updated like count
    const likeCount = await Like.getCount(note_id);

    res.status(200).json({
      success: true,
      message: 'Like removed successfully',
      data: {
        note_id,
        likeCount,
        isLiked: false
      }
    });
  } catch (error) {
    console.error('Error removing like:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove like',
      error: error.message
    });
  }
});

export default router;
