# NoteFlow Component Tests

This directory contains unit tests for NoteFlow components using Vitest and React Testing Library.

## Test Files

- **Footer.test.jsx** - Tests for the Footer component including navigation links and social media
- **NavBar.test.jsx** - Tests for the NavBar component including search functionality, dark mode toggle, and upload button
- **PurchaseModal.test.jsx** - Tests for the purchase modal including form validation and payment processing
- **UploadModal.test.jsx** - Tests for the upload modal including file uploads and form validation

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm test:ui

# Run tests with coverage
npm test:coverage
```

## Test Coverage

The tests cover:
- Component rendering
- User interactions (clicks, typing, form submissions)
- Form validation
- Modal open/close functionality
- State management
- Conditional rendering

## Technologies Used

- **Vitest** - Fast unit test framework
- **React Testing Library** - Testing utilities for React components
- **@testing-library/jest-dom** - Custom matchers for DOM assertions
- **@testing-library/user-event** - Simulating user interactions
- **jsdom** - DOM implementation for Node.js
