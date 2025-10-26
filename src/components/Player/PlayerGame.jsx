import { useEffect, useState, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import Leaderboard from '../Common/Leaderboard'
import { WS_URL } from '../../utils/constants'

export default function PlayerGame() {
  const [searchParams] = useSearchParams()
  const gameCode = searchParams.get('gameCode')
  const [playerInfo, setPlayerInfo] = useState(null)
  const [gameState, setGameState] = useState('waiting') // waiting, question, answer, leaderboard, finished
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [answerResult, setAnswerResult] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [timeLeft, setTimeLeft] = useState(0)
  const hasJoined = useRef(false)

  const { lastMessage, sendMessage, readyState } = useWebSocket(
    gameCode ? `${WS_URL}/ws/player/${gameCode}` : null,
    {
      shouldReconnect: () => true,
      reconnectAttempts: 10,
      reconnectInterval: 3000,
    }
  )

  useEffect(() => {
    const info = JSON.parse(localStorage.getItem('playerInfo'))
    setPlayerInfo(info)
  }, [])

  // Send join_game message when WebSocket connects and player info is ready
  useEffect(() => {
    if (readyState === ReadyState.OPEN && playerInfo && !hasJoined.current) {
      sendMessage(JSON.stringify({
        type: 'join_game',
        playerName: playerInfo.name,
        avatarUrl: playerInfo.avatar || ''
      }))
      hasJoined.current = true
    }
  }, [readyState, playerInfo, sendMessage])

  useEffect(() => {
    if (lastMessage !== null) {
      const data = JSON.parse(lastMessage.data)
      switch (data.type) {
        case 'player_joined':
          break
        case 'joined_success':
          break
        case 'new_question':
          setCurrentQuestion(data.question)
          setGameState('question')
          setSelectedAnswer(null)
          setAnswerResult(null)
          setTimeLeft(data.timeLimit || 20)
          break
        case 'your_result':
          setAnswerResult(data)
          setGameState('answer')
          break
        case 'question_results':
          // Just update to show we're in results phase
          setGameState('results')
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

  const handleAnswerSelect = useCallback((index) => {
    if (gameState !== 'question') return
    setSelectedAnswer(index)
    // Auto-submit answer immediately
    sendMessage(JSON.stringify({
      type: 'submit_answer',
      answerIndex: index,
      timeLeft: timeLeft
    }))
    setGameState('waiting')
  }, [gameState, sendMessage, timeLeft])

  useEffect(() => {
    if (timeLeft > 0 && gameState === 'question') {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && gameState === 'question' && selectedAnswer === null) {
      // Auto submit when time runs out without answer
      setGameState('waiting')
    }
  }, [timeLeft, gameState, selectedAnswer])

  if (!playerInfo) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
      <div className="flex items-center mb-6">
        <img src={playerInfo.avatar} alt={playerInfo.name} className="w-12 h-12 rounded-full mr-4" />
        <h1 className="text-2xl font-bold">Chào {playerInfo.name}!</h1>
      </div>

      {gameState === 'waiting' && !currentQuestion && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-2xl font-semibold">Đang chờ host bắt đầu game...</p>
        </div>
      )}

      {gameState === 'waiting' && currentQuestion && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">✓</div>
          <p className="text-2xl font-semibold text-green-600">Đã nộp câu trả lời!</p>
          <p className="text-gray-600 mt-2">Chờ người chơi khác...</p>
        </div>
      )}

      {gameState === 'question' && currentQuestion && (
        <div>
          <div className="bg-blue-500 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h2 className="text-xl font-semibold">{currentQuestion.text}</h2>
            <div className="text-3xl font-bold">{timeLeft}s</div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {currentQuestion.options.map((option, index) => {
              const colors = ['bg-red-400 hover:bg-red-500', 'bg-blue-400 hover:bg-blue-500', 'bg-yellow-400 hover:bg-yellow-500', 'bg-green-400 hover:bg-green-500']
              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`p-6 rounded-lg text-left font-semibold text-white transition-all ${
                    selectedAnswer === index
                      ? 'ring-4 ring-white scale-105'
                      : ''
                  } ${colors[index]}`}
                >
                  {option}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {gameState === 'results' && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-2xl font-semibold">Đang xem kết quả...</p>
        </div>
      )}

      {gameState === 'answer' && answerResult && currentQuestion && (
        <div className="text-center py-8">
          <div className="text-8xl mb-6">
            {answerResult.correct ? '🎉' : '😢'}
          </div>
          <h2 className={`text-4xl font-bold mb-4 ${answerResult.correct ? 'text-green-600' : 'text-red-600'}`}>
            {answerResult.correct ? 'Chính xác!' : 'Sai rồi!'}
          </h2>
          {answerResult.correct && (
            <p className="text-2xl text-green-600 font-semibold">
              +{answerResult.points} điểm
            </p>
          )}
          {!answerResult.correct && answerResult.yourAnswer !== null && (
            <div className="mt-4">
              <p className="text-lg text-gray-600">Bạn đã chọn: <span className="font-semibold">{currentQuestion.options[answerResult.yourAnswer]}</span></p>
              <p className="text-lg text-green-600 mt-2">Đáp án đúng: <span className="font-semibold">{currentQuestion.options[answerResult.correctAnswer]}</span></p>
            </div>
          )}
        </div>
      )}

      {(gameState === 'leaderboard' || gameState === 'finished') && (
        <Leaderboard leaderboard={leaderboard} />
      )}
    </div>
  )
}