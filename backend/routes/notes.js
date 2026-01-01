/**
 * Notes Routes
 * Handles all note-related endpoints
 */

import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { NoteRepository } from '../models/Note.js';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/notes
 * @desc    Upload a new note (creators only)
 * @access  Private (Creator only)
 * 
 * Request Body Example:
 * {
 *   "title": "Advanced Calculus Notes",
 *   "subject": "Mathematics",
 *   "topics": ["Derivatives", "Integrals", "Limits"],
 *   "description": "Comprehensive notes covering advanced calculus topics",
 *   "content_type": "pdf",
 *   "content_urls": ["https://example.com/calc1.pdf", "https://example.com/calc2.pdf"],
 *   "thumbnail_url": "https://example.com/thumbnail.jpg",
 *   "free_topics": ["Derivatives"],
 *   "paid_topics": ["Integrals", "Limits"],
 *   "price": 9.99,
 *   "is_published": true
 * }
 * 
 * Response Example (201):
 * {
 *   "success": true,
 *   "message": "Note created successfully",
 *   "data": {
 *     "note": { ...note object }
 *   }
 * }
 */
router.post(
  '/',
  authenticate,
  authorize('creator'),
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ min: 3, max: 255 })
      .withMessage('Title must be between 3 and 255 characters'),
    body('subject')
      .trim()
      .notEmpty()
      .withMessage('Subject is required')
      .isLength({ max: 100 })
      .withMessage('Subject must be at most 100 characters'),
    body('topics')
      .isArray({ min: 1 })
      .withMessage('Topics must be an array with at least one item'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Description must be at most 2000 characters'),
    body('content_type')
      .notEmpty()
      .withMessage('Content type is required')
      .isIn(['pdf', 'image', 'mixed'])
      .withMessage('Content type must be pdf, image, or mixed'),
    body('content_urls')
      .isArray({ min: 1 })
      .withMessage('Content URLs must be an array with at least one URL'),
    body('thumbnail_url')
      .optional()
      .isURL()
      .withMessage('Thumbnail URL must be a valid URL'),
    body('free_topics')
      .optional()
      .isArray()
      .withMessage('Free topics must be an array'),
    body('paid_topics')
      .optional()
      .isArray()
      .withMessage('Paid topics must be an array'),
    body('price')
      .optional()
      .isFloat({ min: 0, max: 9999.99 })
      .withMessage('Price must be between 0 and 9999.99'),
    body('is_published')
      .optional()
      .isBoolean()
      .withMessage('is_published must be a boolean')
  ],
  async (req, res) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const noteData = {
        creator_id: req.user.id,
        title: req.body.title,
        subject: req.body.subject,
        topics: req.body.topics,
        description: req.body.description || '',
        content_type: req.body.content_type,
        content_urls: req.body.content_urls,
        thumbnail_url: req.body.thumbnail_url || null,
        free_topics: req.body.free_topics || null,
        paid_topics: req.body.paid_topics || null,
        price: req.body.price || 0.00,
        is_published: req.body.is_published !== undefined ? req.body.is_published : true
      };

      const note = await NoteRepository.create(noteData);

      res.status(201).json({
        success: true,
        message: 'Note created successfully',
        data: {
          note
        }
      });
    } catch (error) {
      console.error('Create note error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while creating note',
        error: error.message
      });
    }
  }
);

/**
 * @route   GET /api/notes
 * @desc    Fetch all notes with optional filters
 * @access  Public
 * 
 * Query Parameters:
 * - subject: Filter by subject (e.g., "Mathematics")
 * - creator_id: Filter by creator ID
 * - search: Search in title and description
 * - price_filter: "free" or "paid"
 * - sort_by: Field to sort by (default: date_uploaded)
 * - sort_order: "asc" or "desc" (default: desc)
 * - limit: Number of results per page (default: 20)
 * - offset: Number of results to skip (default: 0)
 * 
 * Response Example (200):
 * {
 *   "success": true,
 *   "message": "Notes retrieved successfully",
 *   "data": {
 *     "notes": [ ...array of notes ],
 *     "pagination": {
 *       "total": 45,
 *       "limit": 20,
 *       "offset": 0,
 *       "hasMore": true
 *     }
 *   }
 * }
 */
router.get(
  '/',
  optionalAuth,
  [
    query('subject').optional().trim(),
    query('creator_id').optional().trim(), // Removed UUID validation to allow numeric IDs
    query('search').optional().trim(),
    query('price_filter').optional().isIn(['free', 'paid']),
    query('sort_by')
      .optional()
      .isIn(['date_uploaded', 'date_modified', 'title', 'price', 'subject'])
      .withMessage('Invalid sort_by field'),
    query('sort_order').optional().isIn(['asc', 'desc']),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 })
  ],
  async (req, res) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const filters = {
        subject: req.query.subject,
        creator_id: req.query.creator_id,
        search: req.query.search,
        price_filter: req.query.price_filter,
        sort_by: req.query.sort_by || 'date_uploaded',
        sort_order: req.query.sort_order || 'desc',
        limit: parseInt(req.query.limit) || 20,
        offset: parseInt(req.query.offset) || 0
      };

      const [notes, total] = await Promise.all([
        NoteRepository.findAll(filters),
        NoteRepository.count(filters)
      ]);

      // Check if user is authenticated
      const isAuthenticated = !!req.user;

      res.status(200).json({
        success: true,
        message: 'Notes retrieved successfully',
        data: {
          notes,
          pagination: {
            total,
            limit: filters.limit,
            offset: filters.offset,
            hasMore: filters.offset + filters.limit < total
          },
          is_authenticated: isAuthenticated
        }
      });
    } catch (error) {
      console.error('Fetch notes error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching notes',
        error: error.message
      });
    }
  }
);

/**
 * @route   GET /api/notes/:id
 * @desc    Fetch single note with free vs locked content
 * @access  Public (but content access depends on purchase status)
 * 
 * Response Example (200) - For unpurchased paid note:
 * {
 *   "success": true,
 *   "message": "Note retrieved successfully",
 *   "data": {
 *     "note": {
 *       "id": "uuid",
 *       "title": "Advanced Calculus Notes",
 *       "subject": "Mathematics",
 *       "price": 9.99,
 *       "is_purchased": false,
 *       "is_owner": false,
 *       "free_topics": ["Derivatives"],
 *       "paid_topics": ["Integrals", "Limits"],
 *       "content_access": {
 *         "can_view_full": false,
 *         "available_content": [...free content URLs],
 *         "locked_content_count": 2
 *       }
 *     }
 *   }
 * }
 * 
 * Response Example (200) - For purchased or owned note:
 * {
 *   "success": true,
 *   "message": "Note retrieved successfully",
 *   "data": {
 *     "note": {
 *       ...same as above but...
 *       "is_purchased": true,
 *       "content_access": {
 *         "can_view_full": true,
 *         "available_content": [...all content URLs]
 *       }
 *     }
 *   }
 * }
 */
router.get(
  '/:id',
  optionalAuth,
  async (req, res) => {
    try {
      // Basic validation - just check that ID exists
      const noteId = req.params.id;
      if (!noteId || noteId.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Note ID is required'
        });
      }

      // Check if user is authenticated
      const isAuthenticated = !!req.user;
      const userId = req.user?.id || null;
      
      const note = await NoteRepository.findById(req.params.id, userId);

      if (!note) {
        return res.status(404).json({
          success: false,
          message: 'Note not found'
        });
      }

      // Safely check ownership and purchase status (handle guest users)
      const isOwner = isAuthenticated && note.is_owner === true;
      const isPurchased = isAuthenticated && note.is_purchased === true;
      
      // Convert price to number for comparison
      const notePrice = parseFloat(note.price) || 0;
      const isFreeNote = notePrice === 0;
      
      // Determine content access
      const canViewFull = isOwner || isPurchased || isFreeNote;
      
      // Prepare content access information
      let contentAccess;
      if (canViewFull) {
        contentAccess = {
          can_view_full: true,
          available_content: note.content_urls
        };
      } else {
        // Filter to show only free content (preview for paid notes)
        const totalContentCount = Array.isArray(note.content_urls)
          ? note.content_urls.length
          : (typeof note.content_urls === 'string' ? JSON.parse(note.content_urls).length : 0);
        
        contentAccess = {
          can_view_full: false,
          available_content: note.free_topics ? note.content_urls.slice(0, 1) : [], // Show preview only
          locked_content_count: Math.max(0, totalContentCount - 1)
        };
      }

      // Prepare response note object with authentication status
      const responseNote = {
        id: note.id,
        creator_id: note.creator_id,
        creator_name: note.creator_name,
        creator_email: note.creator_email,
        creator_profile_picture: note.creator_profile_picture,
        title: note.title,
        subject: note.subject,
        topics: note.topics,
        description: note.description,
        content_type: note.content_type,
        thumbnail_url: note.thumbnail_url,
        free_topics: note.free_topics,
        paid_topics: note.paid_topics,
        price: note.price,
        date_uploaded: note.date_uploaded,
        date_modified: note.date_modified,
        is_authenticated: isAuthenticated,
        is_owner: isOwner,
        is_purchased: isPurchased,
        can_view_full: canViewFull,
        content_access: contentAccess
      };

      res.status(200).json({
        success: true,
        message: 'Note retrieved successfully',
        data: {
          note: responseNote
        }
      });
    } catch (error) {
      console.error('Fetch note by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching note',
        error: error.message
      });
    }
  }
);

/**
 * @route   PUT /api/notes/:id
 * @desc    Update a note (creators only, must be owner)
 * @access  Private (Creator only, note owner)
 * 
 * Request Body Example:
 * {
 *   "title": "Updated Calculus Notes",
 *   "description": "Updated description",
 *   "price": 12.99,
 *   "is_published": true
 * }
 * 
 * Response Example (200):
 * {
 *   "success": true,
 *   "message": "Note updated successfully",
 *   "data": {
 *     "note": { ...updated note object }
 *   }
 * }
 * 
 * Error Example (403):
 * {
 *   "success": false,
 *   "message": "You are not authorized to update this note"
 * }
 */
router.put(
  '/:id',
  authenticate,
  authorize('creator'),
  [
    param('id').isUUID().withMessage('Invalid note ID'),
    body('title')
      .optional()
      .trim()
      .isLength({ min: 3, max: 255 })
      .withMessage('Title must be between 3 and 255 characters'),
    body('subject')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Subject must be at most 100 characters'),
    body('topics')
      .optional()
      .isArray({ min: 1 })
      .withMessage('Topics must be an array with at least one item'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Description must be at most 2000 characters'),
    body('content_type')
      .optional()
      .isIn(['pdf', 'image', 'mixed'])
      .withMessage('Content type must be pdf, image, or mixed'),
    body('content_urls')
      .optional()
      .isArray({ min: 1 })
      .withMessage('Content URLs must be an array with at least one URL'),
    body('thumbnail_url')
      .optional()
      .isURL()
      .withMessage('Thumbnail URL must be a valid URL'),
    body('free_topics')
      .optional()
      .isArray()
      .withMessage('Free topics must be an array'),
    body('paid_topics')
      .optional()
      .isArray()
      .withMessage('Paid topics must be an array'),
    body('price')
      .optional()
      .isFloat({ min: 0, max: 9999.99 })
      .withMessage('Price must be between 0 and 9999.99'),
    body('is_published')
      .optional()
      .isBoolean()
      .withMessage('is_published must be a boolean')
  ],
  async (req, res) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const updates = {};
      const allowedFields = [
        'title', 'subject', 'topics', 'description',
        'content_type', 'content_urls', 'thumbnail_url',
        'free_topics', 'paid_topics', 'price', 'is_published'
      ];

      // Extract only the fields that are present in the request
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid fields provided for update'
        });
      }

      const note = await NoteRepository.update(req.params.id, req.user.id, updates);

      if (!note) {
        return res.status(404).json({
          success: false,
          message: 'Note not found or you are not authorized to update this note'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Note updated successfully',
        data: {
          note
        }
      });
    } catch (error) {
      console.error('Update note error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while updating note',
        error: error.message
      });
    }
  }
);

/**
 * @route   DELETE /api/notes/:id
 * @desc    Delete a note (creators only, must be owner)
 * @access  Private (Creator only, note owner)
 * 
 * Response Example (200):
 * {
 *   "success": true,
 *   "message": "Note deleted successfully"
 * }
 * 
 * Error Example (404):
 * {
 *   "success": false,
 *   "message": "Note not found or you are not authorized to delete this note"
 * }
 */
router.delete(
  '/:id',
  authenticate,
  authorize('creator'),
  [
    param('id').isUUID().withMessage('Invalid note ID')
  ],
  async (req, res) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const deleted = await NoteRepository.delete(req.params.id, req.user.id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Note not found or you are not authorized to delete this note'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Note deleted successfully'
      });
    } catch (error) {
      console.error('Delete note error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while deleting note',
        error: error.message
      });
    }
  }
);

export default router;
