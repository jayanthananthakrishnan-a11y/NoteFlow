# NoteFlow

NoteFlow is a collaborative note-taking platform that allows users to create, organize, and share notes seamlessly. This repository contains the **full-stack implementation** including both frontend (React + Vite) and backend (Node.js + Express + PostgreSQL) components.

---

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Frontend Setup](#frontend-setup)
  - [Backend Setup](#backend-setup)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- Full-stack note-taking application
- User authentication and authorization
- CRUD operations for notes, bookmarks, and comments
- Responsive, card-based frontend layout
- Dark mode support with Tailwind CSS
- Routing with React Router
- Payment integration (for premium features)
- Analytics for notes and user interactions

---

## Project Structure

```
NoteFlow/
├── backend/          # Node.js + Express backend
│   ├── models/       # Database models
│   ├── routes/       # API endpoints
│   ├── migrations/   # SQL migrations and seeds
│   ├── middleware/   # Authentication and validation
│   ├── config/       # Database config
│   ├── server.js     # Main backend server
│   └── package.json
├── src/              # React frontend
│   ├── components/   # React components
│   ├── pages/        # Pages (Home, Dashboard, Notes, etc.)
│   ├── hooks/        # Custom hooks
│   ├── services/     # API service calls
│   ├── styles/       # CSS & Tailwind
│   └── main.jsx
├── public/           # Static files
├── .gitignore
├── package.json      # Frontend package.json
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- PostgreSQL (for backend database)
- Git

---

### Frontend Setup

1. Navigate to the root project folder:

```bash
cd NoteFlow_RooCode
```

2. Install frontend dependencies:

```bash
npm install
```

3. Run the frontend development server:

```bash
npm run dev
```

4. Open your browser at `http://localhost:5173` (Vite default port)

---

### Backend Setup

1. Navigate to the backend folder:

```bash
cd backend
```

2. Install backend dependencies:

```bash
npm install
```

3. Set up your PostgreSQL database and configure credentials in `backend/config/database.js`.

4. Run migrations to create tables:

```bash
node run-migrations.cjs
```

5. Start the backend server:

```bash
node server.js
```

6. The backend API will run on `http://localhost:3000` by default

---

## Usage

- Sign up or log in
- Create, edit, and delete notes
- Bookmark and comment on notes
- Explore analytics and premium features (if integrated)
- Full frontend + backend integration allows real-time functionality

---

## Contributing

Contributions are welcome!  

1. Fork the repository  
2. Create a new branch:

```bash
git checkout -b feature/YourFeature
```

3. Make your changes  
4. Commit your changes:

```bash
git commit -m "Add YourFeature"
```

5. Push to the branch:

```bash
git push origin feature/YourFeature
```

6. Open a pull request

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
