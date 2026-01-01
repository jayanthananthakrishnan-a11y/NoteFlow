import React from 'react'

// Base skeleton component
export function Skeleton({ className = '', variant = 'rect' }) {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700'
  const variantClasses = {
    rect: 'rounded',
    circle: 'rounded-full',
    text: 'rounded h-4'
  }
  
  return <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />
}

// Card skeleton for notes/posts
export function CardSkeleton() {
  return (
    <article className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded overflow-hidden shadow-sm">
      <Skeleton className="w-full h-40" />
      <div className="p-3 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </article>
  )
}

// Grid of card skeletons
export function CardSkeletonGrid({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

// Flashcard skeleton
export function FlashcardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-8 shadow-lg">
      <div className="space-y-4">
        <Skeleton className="h-6 w-24 mx-auto" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-10 w-32 mx-auto" />
      </div>
    </div>
  )
}

// List item skeleton
export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
      <Skeleton variant="circle" className="w-12 h-12 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  )
}

// Page loading overlay
export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-900 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 dark:border-blue-400 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Loading...</p>
      </div>
    </div>
  )
}

export default Skeleton
