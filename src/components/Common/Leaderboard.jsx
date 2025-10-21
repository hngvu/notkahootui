export default function Leaderboard({ leaderboard }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-center mb-4">Bảng xếp hạng</h2>
      <div className="space-y-3">
        {leaderboard.map((player, index) => (
          <div
            key={index}
            className={`flex items-center p-3 rounded-lg ${
              index === 0
                ? 'bg-yellow-100 border-2 border-yellow-400'
                : index === 1
                ? 'bg-gray-100 border-2 border-gray-400'
                : index === 2
                ? 'bg-orange-100 border-2 border-orange-400'
                : 'bg-white border'
            }`}
          >
            <div className="flex items-center flex-1">
              <span className="text-xl font-bold w-8">#{index + 1}</span>
              <img
                src={player.avatar}
                alt={player.name}
                className="w-10 h-10 rounded-full mx-2"
              />
              <span className="text-lg">{player.name}</span>
            </div>
            <span className="text-xl font-bold">{player.score} điểm</span>
          </div>
        ))}
      </div>
    </div>
  )
}