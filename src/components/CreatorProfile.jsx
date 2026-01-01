import React from 'react'

export default function CreatorProfile({ creator }) {
  if (!creator) return null
  const key = `noteflow:following`
  const [following, setFollowing] = React.useState(() => {
    try {
      const raw = localStorage.getItem(key)
      const arr = raw ? JSON.parse(raw) : []
      return arr.includes(creator.name)
    } catch (e) { return false }
  })

  function toggleFollow() {
    try {
      const raw = localStorage.getItem(key)
      const arr = raw ? JSON.parse(raw) : []
      let next = []
      if (arr.includes(creator.name)) {
        next = arr.filter(a => a !== creator.name)
      } else {
        next = [...arr, creator.name]
      }
      localStorage.setItem(key, JSON.stringify(next))
      setFollowing(next.includes(creator.name))
    } catch (e) {}
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded p-4 flex gap-4 items-center border border-gray-200 dark:border-gray-700">
      <img src={creator.avatar} alt="avatar" className="w-20 h-20 rounded-full object-cover" />
      <div className="flex-1">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">{creator.name}</h1>
          <button onClick={toggleFollow} className={`ml-2 px-3 py-1 rounded ${following ? 'bg-gray-300 dark:bg-gray-700' : 'bg-blue-600 text-white'}`}>
            {following ? 'Following' : 'Follow'}
          </button>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {creator.youtube ? (
            <a className="text-blue-600 dark:text-blue-400" href={creator.youtube} target="_blank" rel="noreferrer">YouTube channel</a>
          ) : (
            <span>No linked channel</span>
          )}
        </div>
      </div>
    </div>
  )
}
