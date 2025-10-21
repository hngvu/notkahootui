import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AvatarSelector from '../Common/AvatarSelector'

export default function PlayerJoin() {
  const [gameCode, setGameCode] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [avatar, setAvatar] = useState('')
  const navigate = useNavigate()

  const handleJoin = () => {
    if (!gameCode || !playerName) {
      alert('Vui lòng nhập mã game và tên')
      return
    }
    // Lưu thông tin player vào localStorage hoặc state management
    localStorage.setItem('playerInfo', JSON.stringify({ name: playerName, avatar }))
    navigate(`/player/game?gameCode=${gameCode}`)
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
      <h1 className="text-3xl font-bold text-center mb-6">Kahoot Clone</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="gameCode">
            Mã Game
          </label>
          <input
            id="gameCode"
            type="text"
            value={gameCode}
            onChange={(e) => setGameCode(e.target.value.toUpperCase())}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Nhập mã game"
            maxLength={6}
          />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="playerName">
            Tên của bạn
          </label>
          <input
            id="playerName"
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Tên người chơi"
            maxLength={20}
          />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Avatar
          </label>
          <AvatarSelector onAvatarSelect={setAvatar} />
        </div>
        <button
          onClick={handleJoin}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
        >
          Tham gia
        </button>
      </div>
    </div>
  )
}