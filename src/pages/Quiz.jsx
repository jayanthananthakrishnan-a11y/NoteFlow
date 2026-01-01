import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Check, X, RotateCcw, Award } from 'lucide-react'

// Sample quiz data - in production this would come from props or API
const sampleQuiz = {
  title: "Science & Math Fundamentals",
  questions: [
    {
      id: 1,
      question: "What is the speed of light in a vacuum?",
      options: [
        "299,792,458 meters per second",
        "150,000,000 meters per second",
        "500,000,000 meters per second",
        "100,000,000 meters per second"
      ],
      correctAnswer: 0,
      explanation: "The speed of light in a vacuum is approximately 299,792,458 meters per second, often rounded to 3 × 10⁸ m/s."
    },
    {
      id: 2,
      question: "Which organelle is responsible for protein synthesis?",
      options: [
        "Mitochondria",
        "Golgi apparatus",
        "Ribosomes",
        "Lysosomes"
      ],
      correctAnswer: 2,
      explanation: "Ribosomes are the cellular structures responsible for protein synthesis through translation of mRNA."
    },
    {
      id: 3,
      question: "What is the quadratic formula?",
      options: [
        "x = -b ± √(b² - 4ac) / 2a",
        "x = b ± √(b² + 4ac) / 2a",
        "x = -b ± √(b² + 4ac) / a",
        "x = b ± √(4ac - b²) / 2a"
      ],
      correctAnswer: 0,
      explanation: "The quadratic formula x = (-b ± √(b² - 4ac)) / 2a is used to solve equations in the form ax² + bx + c = 0."
    },
    {
      id: 4,
      question: "What is Newton's Second Law of Motion?",
      options: [
        "Every action has an equal and opposite reaction",
        "F = ma (Force equals mass times acceleration)",
        "An object in motion stays in motion",
        "Energy cannot be created or destroyed"
      ],
      correctAnswer: 1,
      explanation: "Newton's Second Law states that Force equals mass times acceleration (F = ma), relating force, mass, and acceleration."
    },
    {
      id: 5,
      question: "What is the atomic number of Carbon?",
      options: [
        "4",
        "6",
        "8",
        "12"
      ],
      correctAnswer: 1,
      explanation: "Carbon has an atomic number of 6, meaning it has 6 protons in its nucleus."
    }
  ]
}

export default function Quiz() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const noteId = searchParams.get('noteId')
  const creatorId = searchParams.get('creator')
  
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)
  const [isReviewMode, setIsReviewMode] = useState(false)

  const handleSelectAnswer = (optionIndex) => {
    if (!isReviewMode && !showResults) {
      setSelectedAnswers({
        ...selectedAnswers,
        [currentQuestion]: optionIndex
      })
    }
  }

  const handleNext = () => {
    if (currentQuestion < sampleQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = () => {
    setShowResults(true)
    setIsReviewMode(true)
    setCurrentQuestion(0)
  }

  const handleRetake = () => {
    setSelectedAnswers({})
    setShowResults(false)
    setIsReviewMode(false)
    setCurrentQuestion(0)
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

  const calculateScore = () => {
    let correct = 0
    sampleQuiz.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correct++
      }
    })
    return {
      correct,
      total: sampleQuiz.questions.length,
      percentage: Math.round((correct / sampleQuiz.questions.length) * 100)
    }
  }

  const score = showResults ? calculateScore() : null
  const currentQ = sampleQuiz.questions[currentQuestion]
  const isAnswered = selectedAnswers[currentQuestion] !== undefined
  const isCorrect = isReviewMode && selectedAnswers[currentQuestion] === currentQ.correctAnswer
  const allQuestionsAnswered = Object.keys(selectedAnswers).length === sampleQuiz.questions.length

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
        <h1 className="text-3xl font-bold mb-2">{sampleQuiz.title}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {showResults ? 'Review your answers' : 'Test your knowledge with this quiz'}
        </p>
      </div>

      {/* Results Summary */}
      {showResults && (
        <div className="mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Quiz Complete!</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/20 rounded-lg p-4">
              <div className="text-3xl font-bold">{score.percentage}%</div>
              <div className="text-sm opacity-90">Score</div>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <div className="text-3xl font-bold">{score.correct}</div>
              <div className="text-sm opacity-90">Correct Answers</div>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <div className="text-3xl font-bold">{score.total - score.correct}</div>
              <div className="text-sm opacity-90">Incorrect Answers</div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {!showResults && (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {Object.keys(selectedAnswers).length} / {sampleQuiz.questions.length} answered
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${(Object.keys(selectedAnswers).length / sampleQuiz.questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Question Card */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
            Question {currentQuestion + 1} of {sampleQuiz.questions.length}
          </span>
          {isReviewMode && (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              isCorrect 
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
            }`}>
              {isCorrect ? 'Correct' : 'Incorrect'}
            </span>
          )}
        </div>

        <h3 className="text-xl font-semibold mb-6">{currentQ.question}</h3>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {currentQ.options.map((option, index) => {
            const isSelected = selectedAnswers[currentQuestion] === index
            const isCorrectOption = index === currentQ.correctAnswer
            const showCorrectAnswer = isReviewMode && isCorrectOption
            const showWrongAnswer = isReviewMode && isSelected && !isCorrectOption

            return (
              <button
                key={index}
                onClick={() => handleSelectAnswer(index)}
                disabled={isReviewMode}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  showCorrectAnswer
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : showWrongAnswer
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                } ${isReviewMode ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    showCorrectAnswer
                      ? 'border-green-500 bg-green-500'
                      : showWrongAnswer
                      ? 'border-red-500 bg-red-500'
                      : isSelected
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {showCorrectAnswer && <Check className="w-4 h-4 text-white" />}
                    {showWrongAnswer && <X className="w-4 h-4 text-white" />}
                    {isSelected && !isReviewMode && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <span className={`${
                    showCorrectAnswer || showWrongAnswer ? 'font-medium' : ''
                  }`}>
                    {option}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Explanation (shown in review mode) */}
        {isReviewMode && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border-l-4 border-blue-500">
            <h4 className="font-semibold mb-2 text-blue-600 dark:text-blue-400">Explanation</h4>
            <p className="text-gray-700 dark:text-gray-300">{currentQ.explanation}</p>
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {!showResults ? (
          <>
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <div className="flex-1"></div>
            {currentQuestion < sampleQuiz.questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next Question
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!allQuestionsAnswered}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {allQuestionsAnswered ? 'Submit Quiz' : `Answer ${sampleQuiz.questions.length - Object.keys(selectedAnswers).length} more`}
              </button>
            )}
          </>
        ) : (
          <>
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={currentQuestion === sampleQuiz.questions.length - 1}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
            <div className="flex-1"></div>
            <button
              onClick={handleRetake}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              Retake Quiz
            </button>
          </>
        )}
      </div>

      {/* Question Navigator */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <h3 className="font-semibold mb-3">Question Navigator</h3>
        <div className="flex flex-wrap gap-2">
          {sampleQuiz.questions.map((_, index) => {
            const isAnsweredQ = selectedAnswers[index] !== undefined
            const isCorrectQ = isReviewMode && selectedAnswers[index] === sampleQuiz.questions[index].correctAnswer
            const isCurrentQ = currentQuestion === index

            return (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                  isCurrentQ
                    ? 'bg-blue-600 text-white'
                    : isReviewMode && isCorrectQ
                    ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200'
                    : isReviewMode && isAnsweredQ && !isCorrectQ
                    ? 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200'
                    : isAnsweredQ
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {index + 1}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
