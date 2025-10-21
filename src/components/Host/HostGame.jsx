import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import useWebSocket from 'react-use-websocket'
import Leaderboard from '../Common/Leaderboard'

export default function HostGame() {
  const [searchParams] = useSearchParams()
  const gameId = searchParams.get('gameId')
  const [players, setPlayers] = useState([])
  const [gameState, setGameState] = useState('waiting') // waiting, question, results, leaderboard, finished
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [questionResults, setQuestionResults] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [timeLeft, setTimeLeft] = useState(20)

  const { lastMessage, sendMessage } = useWebSocket(
    gameId ? `ws://localhost:3000/ws/host/${gameId}` : null,
    {
      shouldReconnect: () => true,
      reconnectAttempts: 10,
      reconnectInterval: 3000,
      onOpen: () => console.log('🎮 Host WebSocket connected'),
      onClose: () => console.log('🎮 Host WebSocket disconnected'),
      onError: (event) => console.error('🎮 Host WebSocket error:', event),
    }
  )

  useEffect(() => {
    if (lastMessage !== null) {
      const data = JSON.parse(lastMessage.data)
      console.log('🎮 Host received message:', data)
      switch (data.type) {
        case 'player_list_updated':
          setPlayers(data.players)
          break
        case 'new_question':
          setCurrentQuestion(data.question)
          setGameState('question')
          setTimeLeft(data.timeLimit || 20)
          setQuestionResults(null)
          break
        case 'question_results':
          setGameState('results')
          setQuestionResults(data)
          break
        case 'show_leaderboard':
          setLeaderboard(data.leaderboard)
          setGameState('leaderboard')
          break
        case 'game_over':
          setLeaderboard(data.finalLeaderboard)
          setGameState('finished')
          break
        default:
          break
      }
    }
  }, [lastMessage])

  // Timer countdown
  useEffect(() => {
    if (gameState === 'question' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [gameState, timeLeft])

  const startGame = () => {
    sendMessage(JSON.stringify({ type: 'start_game' }))
  }

  const nextQuestion = () => {
    sendMessage(JSON.stringify({ type: 'next_question' }))
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
      <h1 className="text-3xl font-bold text-center mb-6">Host Control Panel</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <h2 className="text-xl font-semibold mb-2">Game ID: {gameId}</h2>
            <div className="flex space-x-2">
              <button
                onClick={startGame}
                disabled={gameState !== 'waiting'}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
              >
                Bắt đầu
              </button>
              <button
                onClick={nextQuestion}
                disabled={gameState !== 'leaderboard'}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
              >
                Câu tiếp
              </button>
            </div>
          </div>

          {/* Question Screen */}
          {currentQuestion && gameState === 'question' && (
            <div className="bg-white border rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold">{currentQuestion.text}</h3>
                <div className="text-3xl font-bold text-blue-600">{timeLeft}s</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {currentQuestion.options.map((option, index) => {
                  const colors = ['bg-red-400', 'bg-blue-400', 'bg-yellow-400', 'bg-green-400']
                  return (
                    <div
                      key={index}
                      className={`${colors[index]} text-white p-4 rounded-lg text-center font-semibold`}
                    >
                      {option}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Results Screen with Chart */}
          {gameState === 'results' && questionResults && (
            <div className="bg-white border rounded-lg p-6 mb-4">
              <h3 className="text-2xl font-bold mb-4">Kết quả</h3>
              <p className="mb-4 text-gray-600">
                {questionResults.totalAnswers}/{questionResults.totalPlayers} người chơi đã trả lời
              </p>
              <div className="space-y-3">
                {questionResults.question.options.map((option, index) => {
                  const colors = ['bg-red-400', 'bg-blue-400', 'bg-yellow-400', 'bg-green-400']
                  const isCorrect = index === questionResults.correctAnswer
                  const percentage = questionResults.answerPercentages[index]
                  const count = questionResults.answerStats[index]
                  
                  return (
                    <div key={index} className="relative">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-semibold ${isCorrect ? 'text-green-600' : ''}`}>
                          {option} {isCorrect && '✓'}
                        </span>
                        <span className="font-bold">{percentage}% ({count})</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                        <div
                          className={`${colors[index]} h-full flex items-center justify-center text-white font-bold transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        >
                          {percentage > 10 && `${percentage}%`}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Leaderboard */}
          {gameState === 'leaderboard' && (
            <Leaderboard leaderboard={leaderboard} />
          )}

          {/* Game Over */}
          {gameState === 'finished' && (
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">🎉 Game kết thúc!</h2>
              <Leaderboard leaderboard={leaderboard} />
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Players ({players.length})</h2>
          <div className="space-y-2">
            {players.map(player => (
              <div key={player.id} className="flex items-center bg-gray-100 p-2 rounded">
                <img src={player.avatar} alt={player.name} className="w-8 h-8 rounded-full mr-2" />
                <span>{player.name}</span>
                <span className="ml-auto font-bold">{player.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}