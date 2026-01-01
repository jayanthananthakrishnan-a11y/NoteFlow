import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PurchaseModal from '../PurchaseModal'

describe('PurchaseModal Component', () => {
  const mockNote = {
    id: 1,
    title: 'Test Note',
    subject: 'Mathematics',
    price: '9.99'
  }

  const mockOnClose = vi.fn()

  it('does not render when isOpen is false', () => {
    render(<PurchaseModal isOpen={false} onClose={mockOnClose} note={mockNote} />)
    expect(screen.queryByText('Purchase Note')).not.toBeInTheDocument()
  })

  it('renders when isOpen is true', () => {
    render(<PurchaseModal isOpen={true} onClose={mockOnClose} note={mockNote} />)
    expect(screen.getByText('Purchase Note')).toBeInTheDocument()
  })

  it('displays note details correctly', () => {
    render(<PurchaseModal isOpen={true} onClose={mockOnClose} note={mockNote} />)
    
    expect(screen.getByText(mockNote.title)).toBeInTheDocument()
    expect(screen.getByText(mockNote.subject)).toBeInTheDocument()
    expect(screen.getByText(`$${mockNote.price}`)).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    render(<PurchaseModal isOpen={true} onClose={mockOnClose} note={mockNote} />)
    
    const closeButton = screen.getByLabelText('Close')
    await userEvent.click(closeButton)
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('calls onClose when cancel button is clicked', async () => {
    render(<PurchaseModal isOpen={true} onClose={mockOnClose} note={mockNote} />)
    
    const cancelButton = screen.getByText('Cancel')
    await userEvent.click(cancelButton)
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('switches between card and paypal payment methods', async () => {
    render(<PurchaseModal isOpen={true} onClose={mockOnClose} note={mockNote} />)
    
    const paypalButton = screen.getByText('PayPal')
    await userEvent.click(paypalButton)
    
    expect(screen.getByText(/You will be redirected to PayPal/i)).toBeInTheDocument()
  })

  it('requires email field to be filled', async () => {
    render(<PurchaseModal isOpen={true} onClose={mockOnClose} note={mockNote} />)
    
    const emailInput = screen.getByLabelText(/Email Address/i)
    expect(emailInput).toBeRequired()
  })

  it('requires card fields when card payment is selected', () => {
    render(<PurchaseModal isOpen={true} onClose={mockOnClose} note={mockNote} />)
    
    const cardNumberInput = screen.getByLabelText(/Card Number/i)
    const expiryInput = screen.getByLabelText(/Expiry Date/i)
    const cvvInput = screen.getByLabelText(/CVV/i)
    
    expect(cardNumberInput).toBeRequired()
    expect(expiryInput).toBeRequired()
    expect(cvvInput).toBeRequired()
  })

  it('displays processing state when form is submitted', async () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})
    
    render(<PurchaseModal isOpen={true} onClose={mockOnClose} note={mockNote} />)
    
    // Fill form
    await userEvent.type(screen.getByLabelText(/Email Address/i), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/Card Number/i), '1234567890123456')
    await userEvent.type(screen.getByLabelText(/Expiry Date/i), '12/25')
    await userEvent.type(screen.getByLabelText(/CVV/i), '123')
    
    const submitButton = screen.getByText(`Pay $${mockNote.price}`)
    await userEvent.click(submitButton)
    
    expect(screen.getByText('Processing...')).toBeInTheDocument()
    
    alertMock.mockRestore()
  })
})
