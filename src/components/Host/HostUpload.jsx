import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { uploadQuestions, uploadQuestionsText } from '../../utils/api'

export default function HostUpload() {
  const [file, setFile] = useState(null)
  const [questionText, setQuestionText] = useState('')
  const [uploadMode, setUploadMode] = useState('file') // 'file' or 'text'
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState([])
  const navigate = useNavigate()

  const sampleFormat = `What is the capital of France?
London
Berlin
Paris
Madrid
3

What is 2 + 2?
3
4
5
6
2`

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const handleTextChange = (e) => {
    const text = e.target.value
    setQuestionText(text)
    
    // Preview questions
    if (text.trim()) {
      try {
        // Normalize CRLF and split on one-or-more blank lines
        const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim()
        let blocks = normalized.split(/\n\s*\n+/).filter(b => b.trim())
        // Fallback: chunk by 6 non-empty lines if only one block detected
        if (blocks.length <= 1) {
          const allLines = normalized.split('\n').map(l => l.trim()).filter(l => l)
          const chunked = []
          for (let i = 0; i + 5 < allLines.length; i += 6) {
            chunked.push(allLines.slice(i, i + 6).join('\n'))
          }
          if (chunked.length > 1) blocks = chunked
        }
        const previews = blocks.map((block, i) => {
          const lines = block.split('\n').map(l => l.trim()).filter(l => l)
          if (lines.length >= 1) {
            return `${i + 1}. ${lines[0]}`
          }
          return `${i + 1}. (không hợp lệ)`
        })
        setPreview(previews)
      } catch {
        setPreview([])
      }
    } else {
      setPreview([])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)
    try {
      let result
      if (uploadMode === 'file') {
        if (!file) {
          alert('Vui lòng chọn file')
          return
        }
        result = await uploadQuestions(file)
      } else {
        if (!questionText.trim()) {
          alert('Vui lòng nhập câu hỏi')
          return
        }
        result = await uploadQuestionsText(questionText)
      }
      
      console.log('✅ Upload success:', result)
      alert(`Tạo game thành công! ${result.questionCount} câu hỏi`)
      navigate(`/host/game?gameId=${result.gameId}`)
    } catch (error) {
      console.error('❌ Upload failed:', error)
      alert('Upload thất bại: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
      <h1 className="text-2xl font-bold text-center mb-6">Upload Questions</h1>
      
      {/* Mode Toggle */}
      <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
        <button
          type="button"
          onClick={() => setUploadMode('file')}
          className={`flex-1 py-2 px-4 rounded-md font-semibold transition ${
            uploadMode === 'file'
              ? 'bg-white text-blue-600 shadow'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          📁 Upload File
        </button>
        <button
          type="button"
          onClick={() => setUploadMode('text')}
          className={`flex-1 py-2 px-4 rounded-md font-semibold transition ${
            uploadMode === 'text'
              ? 'bg-white text-blue-600 shadow'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          ✏️ Nhập Text
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {uploadMode === 'file' ? (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="file">
              Chọn file câu hỏi (.txt)
            </label>
            <input
              id="file"
              type="file"
              accept=".txt"
              onChange={handleFileChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            <p className="text-gray-600 text-xs mt-2">
              Định dạng: mỗi câu hỏi gồm 6 dòng (câu hỏi + 4 đáp án + số thứ tự đáp án đúng), cách nhau bởi dòng trống
            </p>
          </div>
        ) : (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="text">
              Nhập câu hỏi
            </label>
            <textarea
              id="text"
              value={questionText}
              onChange={handleTextChange}
              placeholder={sampleFormat}
              rows={15}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline font-mono text-sm"
            />
            <p className="text-gray-600 text-xs mt-2">
              Format: Câu hỏi + 4 đáp án + số đáp án đúng (1-4). Mỗi câu cách nhau 1 dòng trống.
            </p>
            
            {preview.length > 0 && (
              <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                <p className="font-semibold text-sm text-blue-800 mb-2">
                  Preview: {preview.length} câu hỏi
                </p>
                <ul className="text-sm text-gray-700 space-y-1">
                  {preview.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:bg-gray-400"
        >
          {loading ? '⏳ Đang tạo game...' : '🚀 Tạo game'}
        </button>
      </form>

      {/* Sample Format */}
      <div className="mt-6 p-4 bg-gray-100 rounded">
        <p className="font-semibold text-sm mb-2">📝 Ví dụ format:</p>
        <pre className="text-xs bg-white p-3 rounded overflow-x-auto">{sampleFormat}</pre>
      </div>
    </div>
  )
}