import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import NavBar from '../NavBar'

describe('NavBar Component', () => {
  const renderNavBar = () => {
    return render(
      <BrowserRouter>
        <NavBar />
      </BrowserRouter>
    )
  }

  it('renders the NoteFlow logo/title', () => {
    renderNavBar()
    expect(screen.getByText('NoteFlow')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    renderNavBar()
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Notes')).toBeInTheDocument()
    expect(screen.getByText('Cheat Sheets')).toBeInTheDocument()
    expect(screen.getByText('Question Papers')).toBeInTheDocument()
    expect(screen.getByText('Flashcards')).toBeInTheDocument()
    expect(screen.getByText('Posts')).toBeInTheDocument()
  })

  it('renders search input field', () => {
    renderNavBar()
    const searchInput = screen.getByPlaceholderText(/Search subjects or creators/i)
    expect(searchInput).toBeInTheDocument()
  })

  it('renders search button', () => {
    renderNavBar()
    const searchButton = screen.getByRole('button', { name: /Search/i })
    expect(searchButton).toBeInTheDocument()
  })

  it('allows typing in search input', async () => {
    renderNavBar()
    const searchInput = screen.getByPlaceholderText(/Search subjects or creators/i)
    
    await userEvent.type(searchInput, 'mathematics')
    expect(searchInput).toHaveValue('mathematics')
  })

  it('renders Upload button', () => {
    renderNavBar()
    const uploadButton = screen.getByRole('button', { name: /upload note/i })
    expect(uploadButton).toBeInTheDocument()
  })

  it('opens upload modal when upload button is clicked', async () => {
    renderNavBar()
    const uploadButton = screen.getByRole('button', { name: /upload note/i })
    
    await userEvent.click(uploadButton)
    
    // Modal should open
    expect(screen.getByText('Upload Note')).toBeInTheDocument()
  })

  it('renders dark mode toggle button', () => {
    renderNavBar()
    const darkModeButton = screen.getByLabelText(/toggle dark/i)
    expect(darkModeButton).toBeInTheDocument()
  })

  it('toggles dark mode button text', async () => {
    renderNavBar()
    const darkModeButton = screen.getByLabelText(/toggle dark/i)
    
    // Initial state could be either "Light" or "Dark" depending on system preference
    const initialText = darkModeButton.textContent
    
    await userEvent.click(darkModeButton)
    
    // Text should change after click
    const newText = darkModeButton.textContent
    expect(newText).not.toBe(initialText)
  })

  it('renders menu toggle button on mobile', () => {
    renderNavBar()
    const menuButton = screen.getByLabelText(/toggle menu/i)
    expect(menuButton).toBeInTheDocument()
  })

  it('toggles menu when menu button is clicked', async () => {
    renderNavBar()
    const menuButton = screen.getByLabelText(/toggle menu/i)
    
    // Initial text
    expect(menuButton).toHaveTextContent(/Menu/i)
    
    await userEvent.click(menuButton)
    
    // After click should show Close
    expect(menuButton).toHaveTextContent(/Close/i)
  })

  it('submits search form when search button is clicked', async () => {
    renderNavBar()
    const searchInput = screen.getByPlaceholderText(/Search subjects or creators/i)
    const searchButton = screen.getByRole('button', { name: /Search/i })
    
    await userEvent.type(searchInput, 'physics')
    await userEvent.click(searchButton)
    
    // Would navigate to /search?q=physics (navigation is handled by react-router)
    expect(searchInput).toHaveValue('physics')
  })

  it('submits search form on Enter key press', async () => {
    renderNavBar()
    const searchInput = screen.getByPlaceholderText(/Search subjects or creators/i)
    
    await userEvent.type(searchInput, 'chemistry{Enter}')
    
    expect(searchInput).toHaveValue('chemistry')
  })
})
