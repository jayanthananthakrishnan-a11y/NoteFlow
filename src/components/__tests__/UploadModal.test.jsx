import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UploadModal from '../UploadModal'

describe('UploadModal Component', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    mockOnClose.mockClear()
  })

  it('does not render when isOpen is false', () => {
    render(<UploadModal isOpen={false} onClose={mockOnClose} />)
    expect(screen.queryByText('Upload Note')).not.toBeInTheDocument()
  })

  it('renders when isOpen is true', () => {
    render(<UploadModal isOpen={true} onClose={mockOnClose} />)
    expect(screen.getByText('Upload Note')).toBeInTheDocument()
    expect(screen.getByText(/Share your study materials with the community/i)).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    render(<UploadModal isOpen={true} onClose={mockOnClose} />)
    
    const closeButton = screen.getByLabelText('Close')
    await userEvent.click(closeButton)
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('calls onClose when cancel button is clicked', async () => {
    render(<UploadModal isOpen={true} onClose={mockOnClose} />)
    
    const cancelButton = screen.getByText('Cancel')
    await userEvent.click(cancelButton)
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('renders all required form fields', () => {
    render(<UploadModal isOpen={true} onClose={mockOnClose} />)
    
    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Subject/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Content Type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Upload File/i)).toBeInTheDocument()
  })

  it('has title field as required', () => {
    render(<UploadModal isOpen={true} onClose={mockOnClose} />)
    
    const titleInput = screen.getByLabelText(/Title/i)
    expect(titleInput).toBeRequired()
  })

  it('has subject field as required', () => {
    render(<UploadModal isOpen={true} onClose={mockOnClose} />)
    
    const subjectSelect = screen.getByLabelText(/Subject/i)
    expect(subjectSelect).toBeRequired()
  })

  it('has description field as required', () => {
    render(<UploadModal isOpen={true} onClose={mockOnClose} />)
    
    const descriptionTextarea = screen.getByLabelText(/Description/i)
    expect(descriptionTextarea).toBeRequired()
  })

  it('toggles free/paid pricing options', async () => {
    render(<UploadModal isOpen={true} onClose={mockOnClose} />)
    
    const freeCheckbox = screen.getByLabelText(/Make this note free/i)
    expect(freeCheckbox).toBeChecked()
    
    // Price field should not be visible when free is checked
    expect(screen.queryByLabelText(/Price \(USD\)/i)).not.toBeInTheDocument()
    
    // Uncheck free checkbox
    await userEvent.click(freeCheckbox)
    expect(freeCheckbox).not.toBeChecked()
    
    // Price field should now be visible
    expect(screen.getByLabelText(/Price \(USD\)/i)).toBeInTheDocument()
  })

  it('shows file name after file selection', async () => {
    render(<UploadModal isOpen={true} onClose={mockOnClose} />)
    
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    const fileInput = screen.getByLabelText(/Upload File/i)
    
    await userEvent.upload(fileInput, file)
    
    expect(screen.getByText(/test\.pdf/i)).toBeInTheDocument()
  })

  it('shows thumbnail name after thumbnail selection', async () => {
    render(<UploadModal isOpen={true} onClose={mockOnClose} />)
    
    const thumbnail = new File(['image content'], 'thumbnail.jpg', { type: 'image/jpeg' })
    const thumbnailInput = screen.getByLabelText(/Thumbnail/i)
    
    await userEvent.upload(thumbnailInput, thumbnail)
    
    expect(screen.getByText(/thumbnail\.jpg/i)).toBeInTheDocument()
  })

  it('allows typing in all text inputs', async () => {
    render(<UploadModal isOpen={true} onClose={mockOnClose} />)
    
    const titleInput = screen.getByLabelText(/Title/i)
    await userEvent.type(titleInput, 'Test Title')
    expect(titleInput).toHaveValue('Test Title')
    
    const descriptionTextarea = screen.getByLabelText(/Description/i)
    await userEvent.type(descriptionTextarea, 'Test Description')
    expect(descriptionTextarea).toHaveValue('Test Description')
    
    const tagsInput = screen.getByLabelText(/Tags/i)
    await userEvent.type(tagsInput, 'tag1, tag2, tag3')
    expect(tagsInput).toHaveValue('tag1, tag2, tag3')
  })

  it('allows selecting subject from dropdown', async () => {
    render(<UploadModal isOpen={true} onClose={mockOnClose} />)
    
    const subjectSelect = screen.getByLabelText(/Subject/i)
    await userEvent.selectOptions(subjectSelect, 'Mathematics')
    
    expect(subjectSelect).toHaveValue('Mathematics')
  })

  it('allows selecting content type from dropdown', async () => {
    render(<UploadModal isOpen={true} onClose={mockOnClose} />)
    
    const contentTypeSelect = screen.getByLabelText(/Content Type/i)
    await userEvent.selectOptions(contentTypeSelect, 'image')
    
    expect(contentTypeSelect).toHaveValue('image')
  })

  it('displays uploading state during submission', async () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})
    
    render(<UploadModal isOpen={true} onClose={mockOnClose} />)
    
    // Fill required fields
    await userEvent.type(screen.getByLabelText(/Title/i), 'Test Title')
    await userEvent.selectOptions(screen.getByLabelText(/Subject/i), 'Mathematics')
    await userEvent.type(screen.getByLabelText(/Description/i), 'Test Description')
    
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    const fileInput = screen.getByLabelText(/Upload File/i)
    await userEvent.upload(fileInput, file)
    
    const submitButton = screen.getByText('Upload Note')
    await userEvent.click(submitButton)
    
    expect(screen.getByText('Uploading...')).toBeInTheDocument()
    
    alertMock.mockRestore()
  })
})
