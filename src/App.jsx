import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Search from './pages/Search'
import Channel from './pages/Channel'
import Notes from './pages/Notes'
import Note from './pages/Note'
import Flashcards from './pages/Flashcards'
import Quiz from './pages/Quiz'
import Dashboard from './pages/Dashboard'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import CreatorDashboard from './pages/CreatorDashboard'
import CheatSheets from './pages/CheatSheets'
import Posts from './pages/Posts'
import QuestionPapers from './pages/QuestionPapers'
import MyPurchases from './pages/MyPurchases'
import NavBar from './components/NavBar'
import Footer from './components/Footer'

export default function App() {
  const location = useLocation()
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
      <NavBar />
      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
        <div key={location.pathname} className="page-transition">
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/creator-dashboard" element={<CreatorDashboard />} />
            <Route path="/my-purchases" element={<MyPurchases />} />
            <Route path="/search" element={<Search />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/note/:id" element={<Note />} />
            <Route path="/cheatsheets" element={<CheatSheets />} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/question-papers" element={<QuestionPapers />} />
            <Route path="/channel/:creator/:section?" element={<Channel />} />
            <Route path="/flashcards" element={<Flashcards />} />
            <Route path="/quiz" element={<Quiz />} />
          </Routes>
        </div>
      </main>
      <Footer />
    </div>
  )
}
