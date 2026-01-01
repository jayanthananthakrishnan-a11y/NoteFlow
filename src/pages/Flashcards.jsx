import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'

// Sample flashcard data - in production this would come from props or API
const sampleFlashcards = [
  {
    id: 1,
    front: "What is the Pythagorean Theorem?",
    back: "In a right triangle, the square of the hypotenuse equals the sum of squares of the other two sides: a² + b² = c²"
  },
  {
    id: 2,
    front: "Define photosynthesis",
    back: "The process by which plants convert light energy into chemical energy, producing glucose and oxygen from carbon dioxide and water."
  },
  {
    id: 3,
    front: "What is the mitochondria's function?",
    back: "The mitochondria is the powerhouse of the cell, responsible for producing ATP through cellular respiration."
  },
  {
    id: 4,
    front: "What is Newton's First Law?",
    back: "An object at rest stays at rest and an object in motion stays in motion unless acted upon by an external force."
  },
  {
    id: 5,
    front: "What is the derivative of sin(x)?",
    back: "The derivative of sin(x) is cos(x)"
  }
]

export default function Flashcards() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const noteId = searchParams.get('noteId')
  const creatorId = searchParams.get('creator')
  
  const [currentCard, setCurrentCard] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [masteredCards, setMasteredCards] = useState(new Set())

  const handlePrevious = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1)
      setIsFlipped(false)
    }
  }

  const handleNext = () => {
    if (currentCard < sampleFlashcards.length - 1) {
      setCurrentCard(currentCard + 1)
      setIsFlipped(false)
    }
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleMastered = () => {
    setMasteredCards(new Set([...masteredCards, currentCard]))
    if (currentCard < sampleFlashcards.length - 1) {
      handleNext()
    }
  }

  const handleReset = () => {
    setCurrentCard(0)
    setIsFlipped(false)
    setMasteredCards(new Set())
  }

  const handleBack = () => {
    if (creatorId) {
      navigate(`/channel/${creatorId}`)
    } else if (noteId) {
      navigate(`/note/${noteId}`)
    } else {
      navigate('/')
    }
  }

  const progress = Math.round((masteredCards.size / sampleFlashcards.length) * 100)

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <h1 className="text-3xl font-bold mb-2">Flashcards</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Master key concepts with interactive flashcards
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {masteredCards.size} / {sampleFlashcards.length} mastered
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Flashcard */}
      <div className="mb-6 perspective-1000">
        <div
          className={`relative w-full h-80 cursor-pointer transition-transform duration-500 transform-style-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          onClick={handleFlip}
        >
          {/* Front of card */}
          <div className={`absolute inset-0 backface-hidden ${isFlipped ? 'invisible' : ''}`}>
            <div className="h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-xl p-8 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="bg-white/20 px-3 py-1 rounded-full text-white text-sm font-medium">
                  Question
                </span>
                <span className="text-white/80 text-sm">
                  {currentCard + 1} / {sampleFlashcards.length}
                </span>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <p className="text-2xl md:text-3xl font-semibold text-white text-center px-4">
                  {sampleFlashcards[currentCard].front}
                </p>
              </div>
              <div className="text-center text-white/80 text-sm">
                Click to reveal answer
              </div>
            </div>
          </div>

          {/* Back of card */}
          <div className={`absolute inset-0 backface-hidden rotate-y-180 ${!isFlipped ? 'invisible' : ''}`}>
            <div className="h-full bg-gradient-to-br from-green-500 to-teal-600 rounded-xl shadow-xl p-8 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="bg-white/20 px-3 py-1 rounded-full text-white text-sm font-medium">
                  Answer
                </span>
                <span className="text-white/80 text-sm">
                  {currentCard + 1} / {sampleFlashcards.length}
                </span>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <p className="text-xl md:text-2xl text-white text-center px-4">
                  {sampleFlashcards[currentCard].back}
                </p>
              </div>
              <div className="text-center text-white/80 text-sm">
                Click to see question
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex gap-2 flex-1">
          <button
            onClick={handlePrevious}
            disabled={currentCard === 0}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-1 sm:flex-none"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={currentCard === sampleFlashcards.length - 1}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-1 sm:flex-none"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleMastered}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex-1 sm:flex-none"
            disabled={masteredCards.has(currentCard)}
          >
            {masteredCards.has(currentCard) ? 'Mastered ✓' : 'Mark as Mastered'}
          </button>
          <button
            onClick={handleReset}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            title="Reset progress"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Card Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <h3 className="font-semibold mb-3">Card Status</h3>
        <div className="flex flex-wrap gap-2">
          {sampleFlashcards.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentCard(index)
                setIsFlipped(false)
              }}
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                currentCard === index
                  ? 'bg-blue-600 text-white'
                  : masteredCards.has(index)
                  ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Tip: Click on the card to flip it</p>
      </div>
    </div>
  )
}
