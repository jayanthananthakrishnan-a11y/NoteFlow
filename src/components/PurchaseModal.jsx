import React, { useState } from 'react'
import { paymentsAPI } from '../services/api'
import { getUser } from '../utils/auth'

export default function PurchaseModal({ isOpen, onClose, note, onPurchaseSuccess }) {
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [email, setEmail] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const user = getUser()

  if (!isOpen || !note) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setProcessing(true)
    setError(null)
    
    try {
      // Call the real payment API
      const response = await paymentsAPI.purchaseNote(note.id, paymentMethod === 'card' ? 'credit_card' : 'paypal')
      
      if (response.success) {
        setSuccess(true)
        
        // Show success message
        setTimeout(() => {
          // Reset form
          setEmail('')
          setCardNumber('')
          setExpiryDate('')
          setCvv('')
          setSuccess(false)
          
          // Call success callback to refresh note
          if (onPurchaseSuccess) {
            onPurchaseSuccess()
          }
          
          onClose()
        }, 2000)
      }
    } catch (err) {
      console.error('Purchase error:', err)
      setError(err.message || 'Failed to process purchase. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Success State */}
        {success && (
          <div className="p-6 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-semibold mb-2">Purchase Successful!</h2>
            <p className="text-gray-600 dark:text-gray-400">
              You now have full access to <strong>{note.title}</strong>
            </p>
            <div className="mt-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Redirecting...</p>
            </div>
          </div>
        )}

        {/* Normal Form State */}
        {!success && (
          <>
            {/* Header */}
            <div className="border-b border-gray-200 dark:border-gray-700 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-semibold">Purchase Note</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Complete your purchase</p>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label="Close"
                  disabled={processing}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Note Details */}
            <div className="p-6 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-2">{note.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{note.subject}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Price:</span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">${note.price}</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Purchase Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                  placeholder="you@example.com"
                  required
                  disabled={processing}
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium mb-2">Payment Method (Simulation)</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`flex-1 py-2 px-4 rounded-lg border ${
                      paymentMethod === 'card'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    disabled={processing}
                  >
                    💳 Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paypal')}
                    className={`flex-1 py-2 px-4 rounded-lg border ${
                      paymentMethod === 'paypal'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    disabled={processing}
                  >
                    PayPal
                  </button>
                </div>
              </div>

              {/* Card Details */}
              {paymentMethod === 'card' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2" htmlFor="cardNumber">
                      Card Number
                    </label>
                    <input
                      id="cardNumber"
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                      placeholder="1234 5678 9012 3456"
                      required
                      disabled={processing}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" htmlFor="expiry">
                        Expiry Date
                      </label>
                      <input
                        id="expiry"
                        type="text"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                        placeholder="MM/YY"
                        required
                        disabled={processing}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" htmlFor="cvv">
                        CVV
                      </label>
                      <input
                        id="cvv"
                        type="text"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                        placeholder="123"
                        maxLength="4"
                        required
                        disabled={processing}
                      />
                    </div>
                  </div>
                </>
              )}

              {paymentMethod === 'paypal' && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    This is a simulated payment. In production, you will be redirected to PayPal.
                  </p>
                </div>
              )}

              {/* Info Notice */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-xs text-yellow-800 dark:text-yellow-300">
                  ℹ️ This is a simulated payment. No real charges will be made.
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={processing}
                >
                  {processing ? 'Processing...' : `Pay $${note.price}`}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
