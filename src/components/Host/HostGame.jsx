import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import useWebSocket from 'react-use-websocket'
import Leaderboard from '../Common/Leaderboard'
import { WS_URL } from '../../utils/constants'

export default function HostGame() {
  const [searchParams] = useSearchParams()
  const gameId = searchParams.get('gameId')
  const [players, setPlayers] = useState([])
  const [gameState, setGameState] = useState('waiting') // waiting, question, results, leaderboard, finished
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [questionNumber, setQuestionNumber] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [questionResults, setQuestionResults] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [timeLeft, setTimeLeft] = useState(20)

  const { lastMessage, sendMessage } = useWebSocket(
    gameId ? `${WS_URL}/ws/host/${gameId}` : null,
    {
      shouldReconnect: () => true,
      reconnectAttempts: 10,
      reconnectInterval: 3000,
    }
  )

  useEffect(() => {
    if (lastMessage !== null) {
      const data = JSON.parse(lastMessage.data)
      switch (data.type) {
        case 'player_list_updated':
          setPlayers(data.players)
          break
        case 'new_question':
          setCurrentQuestion(data.question)
          setQuestionNumber(data.questionNumber)
          setTotalQuestions(data.totalQuestions)
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
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-50 p-4">
      {/* Header with Game ID and Controls */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Game ID: {gameId}</h1>
              <p className="text-gray-600 mt-1">Người chơi: {players.length}</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={startGame}
                disabled={gameState !== 'waiting'}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-400 transition"
              >
                Bắt đầu
              </button>
              <button
                onClick={nextQuestion}
                disabled={gameState !== 'leaderboard'}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-400 transition"
              >
                Câu tiếp
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="min-h-screen flex flex-col">
          
          {/* Waiting State - Player Grid */}
          {gameState === 'waiting' && (
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Chờ người chơi tham gia...</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {players.map(player => (
                  <div
                    key={player.id}
                    className="bg-white rounded-lg shadow-md p-4 text-center hover:shadow-lg transition"
                  >
                    <img
                      src={player.avatar}
                      alt={player.name}
                      className="w-16 h-16 rounded-lg mx-auto mb-3 object-cover"
                    />
                    <p className="font-semibold text-gray-800 text-sm truncate">{player.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Question Screen - Full Width */}
          {currentQuestion && gameState === 'question' && (
            <div className="flex-1 bg-linear-to-br from-purple-500 to-indigo-600 text-white rounded-xl p-8 shadow-xl">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <span className="text-xl font-semibold opacity-90">Câu {questionNumber}/{totalQuestions}</span>
                </div>
                <div className="bg-white text-purple-600 text-4xl font-bold px-8 py-4 rounded-lg shadow-lg">
                  {timeLeft}s
                </div>
              </div>
              
              <h3 className="text-4xl font-bold mb-12 text-center">{currentQuestion.text}</h3>
              
              <div className="grid grid-cols-2 gap-6 max-w-4xl mx-auto">
                {currentQuestion.options.map((option, index) => {
                  const colors = [
                    'bg-red-500 hover:bg-red-600',
                    'bg-blue-500 hover:bg-blue-600',
                    'bg-yellow-500 hover:bg-yellow-600',
                    'bg-green-500 hover:bg-green-600'
                  ]
                  return (
                    <div
                      key={index}
                      className={`${colors[index]} text-white p-8 rounded-lg text-center font-bold text-2xl shadow-lg transition-transform transform hover:scale-105 cursor-pointer`}
                    >
                      {option}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Results Screen */}
          {gameState === 'results' && questionResults && (
            <div className="bg-white rounded-xl shadow-lg p-8 flex-1">
              <h3 className="text-3xl font-bold mb-6 text-gray-800">Kết quả câu hỏi</h3>
              <p className="text-lg text-gray-600 mb-8">
                {questionResults.totalAnswers}/{questionResults.totalPlayers} người chơi đã trả lời
              </p>
              <div className="space-y-4">
                {questionResults.question.options.map((option, index) => {
                  const colors = ['bg-red-400', 'bg-blue-400', 'bg-yellow-400', 'bg-green-400']
                  const isCorrect = index === questionResults.correctAnswer
                  const percentage = questionResults.answerPercentages[index]
                  const count = questionResults.answerStats[index]
                  
                  return (
                    <div key={index} className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-semibold text-lg ${isCorrect ? 'text-green-600 font-bold' : ''}`}>
                          {option} {isCorrect && '✓'}
                        </span>
                        <span className="font-bold text-gray-700">{percentage}% ({count})</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-10 overflow-hidden">
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
            <div className="text-center bg-white rounded-xl shadow-lg p-12 flex-1">
              <h2 className="text-4xl font-bold mb-8 text-gray-800">🎉 Game kết thúc!</h2>
              <Leaderboard leaderboard={leaderboard} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}