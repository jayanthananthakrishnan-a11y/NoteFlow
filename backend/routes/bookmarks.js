import express from 'express';
import Bookmark from '../models/Bookmark.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/bookmarks
 * @desc    Toggle bookmark on a note (add/remove)
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

    // Toggle bookmark
    const result = await Bookmark.toggle(userId, note_id);

    res.status(200).json({
      success: true,
      message: result.action === 'added' ? 'Note bookmarked successfully' : 'Bookmark removed successfully',
      data: result
    });
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    
    // Handle duplicate key constraint
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'Note is already bookmarked'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to toggle bookmark',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/bookmarks
 * @desc    Get all bookmarked notes for the current user
 * @access  Private
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    // Parse pagination params
    const limitNum = Math.min(parseInt(limit) || 20, 100); // Max 100
    const offsetNum = parseInt(offset) || 0;

    const result = await Bookmark.getByUserId(userId, limitNum, offsetNum);

    res.status(200).json({
      success: true,
      message: 'Bookmarked notes retrieved successfully',
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
    console.error('Error fetching bookmarks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookmarked notes',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/bookmarks/check/:note_id
 * @desc    Check if current user has bookmarked a note
 * @access  Private
 */
router.get('/check/:note_id', authenticate, async (req, res) => {
  try {
    const { note_id } = req.params;
    const userId = req.user.id;

    const hasBookmarked = await Bookmark.hasUserBookmarked(userId, note_id);

    res.status(200).json({
      success: true,
      message: 'Bookmark status retrieved successfully',
      data: {
        note_id,
        isBookmarked: hasBookmarked
      }
    });
  } catch (error) {
    console.error('Error checking bookmark status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check bookmark status',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/bookmarks/note/:note_id
 * @desc    Get bookmark count for a note
 * @access  Public
 */
router.get('/note/:note_id', async (req, res) => {
  try {
    const { note_id } = req.params;

    const bookmarkCount = await Bookmark.getCount(note_id);

    res.status(200).json({
      success: true,
      message: 'Bookmark count retrieved successfully',
      data: {
        note_id,
        bookmarkCount
      }
    });
  } catch (error) {
    console.error('Error fetching bookmark count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookmark count',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/bookmarks/note/:note_id/users
 * @desc    Get all users who bookmarked a note with pagination
 * @access  Public
 */
router.get('/note/:note_id/users', async (req, res) => {
  try {
    const { note_id } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Parse pagination params
    const limitNum = Math.min(parseInt(limit) || 50, 100);
    const offsetNum = parseInt(offset) || 0;

    const result = await Bookmark.getByNoteId(note_id, limitNum, offsetNum);

    res.status(200).json({
      success: true,
      message: 'Bookmarks retrieved successfully',
      data: {
        bookmarks: result.bookmarks,
        pagination: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
          hasMore: result.offset + result.limit < result.total
        }
      }
    });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookmarks',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/bookmarks/stats
 * @desc    Get bookmark statistics for the current user
 * @access  Private
 */
router.get('/stats', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Bookmark.getUserStats(userId);

    res.status(200).json({
      success: true,
      message: 'Bookmark statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    console.error('Error fetching bookmark stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookmark statistics',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/bookmarks/:note_id
 * @desc    Remove a bookmark from a note
 * @access  Private
 */
router.delete('/:note_id', authenticate, async (req, res) => {
  try {
    const { note_id } = req.params;
    const userId = req.user.id;

    const removed = await Bookmark.remove(userId, note_id);

    if (!removed) {
      return res.status(404).json({
        success: false,
        message: 'Bookmark not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Bookmark removed successfully',
      data: {
        note_id,
        isBookmarked: false
      }
    });
  } catch (error) {
    console.error('Error removing bookmark:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove bookmark',
      error: error.message
    });
  }
});

export default router;
