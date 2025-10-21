import { useEffect, useRef, useState } from 'react'

export default function useWebSocket(url) {
  const [lastMessage, setLastMessage] = useState(null)
  const ws = useRef(null)

  useEffect(() => {
    if (url) {
      ws.current = new WebSocket(url)
      ws.current.onopen = () => {
        console.log('WebSocket connected to:', url)
      }
      ws.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason)
      }
      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
      ws.current.onmessage = (event) => {
        console.log('WebSocket message received:', event.data)
        setLastMessage(event)
      }

      return () => {
        ws.current.close()
      }
    }
  }, [url])

  const sendMessage = (message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(message)
    }
  }

  return { lastMessage, sendMessage }
}