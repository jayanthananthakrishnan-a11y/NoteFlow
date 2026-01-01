import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Footer from '../Footer'

describe('Footer Component', () => {
  it('renders the footer with company name', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    )
    
    expect(screen.getByText(/NoteFlow/i)).toBeInTheDocument()
  })

  it('displays the current year in copyright', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    )
    
    const currentYear = new Date().getFullYear()
    expect(screen.getByText(new RegExp(`© ${currentYear}`, 'i'))).toBeInTheDocument()
  })

  it('renders Quick Links section', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    )
    
    expect(screen.getByText('Quick Links')).toBeInTheDocument()
    expect(screen.getByText('Browse Notes')).toBeInTheDocument()
  })

  it('renders Resources section', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    )
    
    expect(screen.getByText('Resources')).toBeInTheDocument()
    expect(screen.getByText('For Creators')).toBeInTheDocument()
  })

  it('renders Legal section', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    )
    
    expect(screen.getByText('Legal')).toBeInTheDocument()
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument()
    expect(screen.getByText('Terms of Service')).toBeInTheDocument()
  })

  it('renders social media links', () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    )
    
    const socialLinks = screen.getAllByRole('link', { name: /twitter|github|linkedin/i })
    expect(socialLinks.length).toBeGreaterThan(0)
  })
})
