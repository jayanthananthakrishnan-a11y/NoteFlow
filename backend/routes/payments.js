/**
 * Payment Routes
 * Handles all payment-related endpoints for note purchases
 */

import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { PaymentRepository } from '../models/Payment.js';
import { NoteRepository } from '../models/Note.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/payments/purchase
 * @desc    Purchase a note (one-time payment)
 * @access  Private (authenticated users only)
 * 
 * Request Body Example:
 * {
 *   "note_id": "uuid-of-note",
 *   "payment_method": "credit_card"
 * }
 * 
 * Success Response (201):
 * {
 *   "success": true,
 *   "message": "Note purchased successfully",
 *   "data": {
 *     "payment": {
 *       "id": "payment-uuid",
 *       "note_id": "note-uuid",
 *       "amount": 9.99,
 *       "currency": "USD",
 *       "status": "completed",
 *       "date": "2025-12-25T14:30:00.000Z"
 *     },
 *     "note": {
 *       "id": "note-uuid",
 *       "title": "Advanced Calculus Notes",
 *       "content_access": {
 *         "can_view_full": true
 *       }
 *     }
 *   }
 * }
 * 
 * Error Response (400) - Already purchased:
 * {
 *   "success": false,
 *   "message": "You have already purchased this note"
 * }
 * 
 * Error Response (400) - Free note:
 * {
 *   "success": false,
 *   "message": "This note is free and does not require purchase"
 * }
 * 
 * Error Response (403) - Own note:
 * {
 *   "success": false,
 *   "message": "You cannot purchase your own note"
 * }
 * 
 * Error Response (404):
 * {
 *   "success": false,
 *   "message": "Note not found"
 * }
 */
router.post(
  '/purchase',
  authenticate,
  [
    body('note_id')
      .notEmpty()
      .withMessage('Note ID is required')
      .isUUID()
      .withMessage('Invalid note ID format'),
    body('payment_method')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Payment method must be at most 50 characters')
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

      const { note_id, payment_method = 'internal' } = req.body;
      const userId = req.user.id;

      // 1. Check if note exists
      const note = await NoteRepository.findById(note_id, userId);
      if (!note) {
        return res.status(404).json({
          success: false,
          message: 'Note not found'
        });
      }

      // 2. Check if user is the creator (cannot buy own note)
      if (note.creator_id === userId) {
        return res.status(403).json({
          success: false,
          message: 'You cannot purchase your own note'
        });
      }

      // 3. Check if note is free
      const notePrice = parseFloat(note.price);
      if (notePrice === 0) {
        return res.status(400).json({
          success: false,
          message: 'This note is free and does not require purchase'
        });
      }

      // 4. Check if already purchased
      const alreadyPurchased = await PaymentRepository.hasPurchased(userId, note_id);
      if (alreadyPurchased) {
        return res.status(400).json({
          success: false,
          message: 'You have already purchased this note'
        });
      }

      // 5. Create payment record
      // In production, this would integrate with a payment gateway (Stripe, PayPal, etc.)
      // For now, we simulate immediate successful payment
      const paymentData = {
        user_id: userId,
        note_id: note_id,
        amount: notePrice,
        currency: 'USD',
        status: 'completed',
        payment_method: payment_method,
        transaction_id: `TXN-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        metadata: {
          note_title: note.title,
          creator_name: note.creator_name,
          purchase_date: new Date().toISOString()
        }
      };

      const payment = await PaymentRepository.create(paymentData);

      // 6. Fetch updated note to confirm purchase
      const updatedNote = await NoteRepository.findById(note_id, userId);

      res.status(201).json({
        success: true,
        message: 'Note purchased successfully',
        data: {
          payment: {
            id: payment.id,
            note_id: payment.note_id,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            date: payment.date
          },
          note: {
            id: updatedNote.id,
            title: updatedNote.title,
            subject: updatedNote.subject,
            creator_name: updatedNote.creator_name,
            content_access: {
              can_view_full: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Purchase note error:', error);
      
      // Handle unique constraint violation (race condition)
      if (error.code === '23505' && error.constraint === 'unique_user_note_purchase') {
        return res.status(400).json({
          success: false,
          message: 'You have already purchased this note'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Server error while processing purchase',
        error: error.message
      });
    }
  }
);

/**
 * @route   GET /api/payments/my-purchases
 * @desc    Get all purchases made by the authenticated user
 * @access  Private (authenticated users only)
 * 
 * Query Parameters:
 * - limit: Number of results per page (default: 20, max: 100)
 * - offset: Number of results to skip (default: 0)
 * 
 * Success Response (200):
 * {
 *   "success": true,
 *   "message": "Purchases retrieved successfully",
 *   "data": {
 *     "purchases": [
 *       {
 *         "id": "payment-uuid",
 *         "note_id": "note-uuid",
 *         "note_title": "Advanced Calculus Notes",
 *         "note_subject": "Mathematics",
 *         "note_thumbnail": "https://example.com/thumb.jpg",
 *         "note_content_type": "pdf",
 *         "creator_name": "Dr. Smith",
 *         "amount": 9.99,
 *         "currency": "USD",
 *         "status": "completed",
 *         "date": "2025-12-25T14:30:00.000Z"
 *       }
 *     ],
 *     "pagination": {
 *       "total": 5,
 *       "limit": 20,
 *       "offset": 0
 *     }
 *   }
 * }
 */
router.get(
  '/my-purchases',
  authenticate,
  [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('offset')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Offset must be a positive integer')
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

      const userId = req.user.id;
      const filters = {
        limit: parseInt(req.query.limit) || 20,
        offset: parseInt(req.query.offset) || 0
      };

      const purchases = await PaymentRepository.findByUser(userId, filters);

      res.status(200).json({
        success: true,
        message: 'Purchases retrieved successfully',
        data: {
          purchases,
          pagination: {
            total: purchases.length,
            limit: filters.limit,
            offset: filters.offset
          }
        }
      });
    } catch (error) {
      console.error('Fetch purchases error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching purchases',
        error: error.message
      });
    }
  }
);

/**
 * @route   GET /api/payments/creator-earnings
 * @desc    Get earnings summary for a creator (authenticated user must be creator)
 * @access  Private (creators only)
 * 
 * Query Parameters:
 * - limit: Number of transactions per page (default: 20, max: 100)
 * - offset: Number of transactions to skip (default: 0)
 * - period: Time grouping for analytics (day, week, month, year) - optional
 * 
 * Success Response (200):
 * {
 *   "success": true,
 *   "message": "Earnings retrieved successfully",
 *   "data": {
 *     "summary": {
 *       "totalSales": 25,
 *       "totalEarnings": 249.75,
 *       "currency": "USD"
 *     },
 *     "transactions": [
 *       {
 *         "id": "payment-uuid",
 *         "amount": 9.99,
 *         "currency": "USD",
 *         "date": "2025-12-25T14:30:00.000Z",
 *         "status": "completed",
 *         "note_id": "note-uuid",
 *         "note_title": "Advanced Calculus Notes",
 *         "buyer_name": "John Doe",
 *         "buyer_email": "john@example.com"
 *       }
 *     ],
 *     "pagination": {
 *       "limit": 20,
 *       "offset": 0
 *     }
 *   }
 * }
 * 
 * With period parameter (e.g., ?period=month):
 * {
 *   "success": true,
 *   "message": "Earnings retrieved successfully",
 *   "data": {
 *     "summary": { ...same as above },
 *     "transactions": [ ...same as above ],
 *     "analytics": [
 *       {
 *         "period": "2025-12",
 *         "sales_count": 10,
 *         "total_amount": 99.90
 *       },
 *       {
 *         "period": "2025-11",
 *         "sales_count": 15,
 *         "total_amount": 149.85
 *       }
 *     ],
 *     "pagination": { ...same as above }
 *   }
 * }
 * 
 * Error Response (403) - Not a creator:
 * {
 *   "success": false,
 *   "message": "Access denied. Only creators can view earnings"
 * }
 */
router.get(
  '/creator-earnings',
  authenticate,
  [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('offset')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Offset must be a positive integer'),
    query('period')
      .optional()
      .isIn(['day', 'week', 'month', 'year'])
      .withMessage('Period must be one of: day, week, month, year')
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

      // Check if user is a creator
      if (req.user.userType !== 'creator') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Only creators can view earnings'
        });
      }

      const creatorId = req.user.id;
      const filters = {
        limit: parseInt(req.query.limit) || 20,
        offset: parseInt(req.query.offset) || 0
      };

      const earningsData = await PaymentRepository.findEarningsByCreator(creatorId, filters);

      const response = {
        success: true,
        message: 'Earnings retrieved successfully',
        data: {
          summary: earningsData.summary,
          transactions: earningsData.transactions,
          pagination: {
            limit: filters.limit,
            offset: filters.offset
          }
        }
      };

      // If period is requested, add analytics data
      if (req.query.period) {
        const analytics = await PaymentRepository.getEarningsByPeriod(
          creatorId,
          req.query.period
        );
        response.data.analytics = analytics;
      }

      res.status(200).json(response);
    } catch (error) {
      console.error('Fetch creator earnings error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching earnings',
        error: error.message
      });
    }
  }
);

/**
 * @route   GET /api/payments/:id
 * @desc    Get details of a specific payment
 * @access  Private (payment owner or note creator only)
 * 
 * Success Response (200):
 * {
 *   "success": true,
 *   "message": "Payment retrieved successfully",
 *   "data": {
 *     "payment": {
 *       "id": "payment-uuid",
 *       "user_id": "user-uuid",
 *       "note_id": "note-uuid",
 *       "note_title": "Advanced Calculus Notes",
 *       "amount": 9.99,
 *       "currency": "USD",
 *       "status": "completed",
 *       "payment_method": "credit_card",
 *       "transaction_id": "TXN-12345",
 *       "date": "2025-12-25T14:30:00.000Z"
 *     }
 *   }
 * }
 * 
 * Error Response (403):
 * {
 *   "success": false,
 *   "message": "Access denied. You can only view your own payments"
 * }
 * 
 * Error Response (404):
 * {
 *   "success": false,
 *   "message": "Payment not found"
 * }
 */
router.get(
  '/:id',
  authenticate,
  [
    param('id').isUUID().withMessage('Invalid payment ID')
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

      const payment = await PaymentRepository.findById(req.params.id);

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      // Check authorization - only payment owner or note creator can view
      if (payment.user_id !== req.user.id && payment.note_creator_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own payments'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Payment retrieved successfully',
        data: {
          payment
        }
      });
    } catch (error) {
      console.error('Fetch payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching payment',
        error: error.message
      });
    }
  }
);

export default router;
