import { useState, useEffect } from 'react'

export default function AvatarSelector({ onAvatarSelect }) {
  const [avatars, setAvatars] = useState([])
  const [selectedAvatar, setSelectedAvatar] = useState('')

  useEffect(() => {
    generateAvatars()
  }, [])

  const generateAvatars = () => {
    const styles = ['adventurer', 'avataaars', 'bottts', 'lorelei', 'micah', 'miniavs']
    const newAvatars = []
    for (let i = 0; i < 12; i++) {
      const style = styles[Math.floor(Math.random() * styles.length)]
      const seed = Math.random().toString(36).substring(7)
      const avatarUrl = `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`
      newAvatars.push(avatarUrl)
    }
    setAvatars(newAvatars)
  }

  const handleAvatarClick = (avatarUrl) => {
    setSelectedAvatar(avatarUrl)
    onAvatarSelect(avatarUrl)
  }

  return (
    <div>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {avatars.map((avatar, index) => (
          <img
            key={index}
            src={avatar}
            alt={`Avatar ${index}`}
            className={`w-16 h-16 rounded-full cursor-pointer border-2 ${
              selectedAvatar === avatar ? 'border-blue-500' : 'border-gray-300'
            }`}
            onClick={() => handleAvatarClick(avatar)}
          />
        ))}
      </div>
      <button
        onClick={generateAvatars}
        className="text-sm bg-gray-200 hover:bg-gray-300 py-1 px-2 rounded"
      >
        Tạo avatar mới
      </button>
    </div>
  )
}