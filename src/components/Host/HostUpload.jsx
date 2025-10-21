import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { uploadQuestions } from '../../utils/api'

export default function HostUpload() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    try {
      const result = await uploadQuestions(file)
      navigate(`/host/game?gameId=${result.gameId}`)
    } catch (error) {
      alert('Upload thất bại: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
      <h1 className="text-2xl font-bold text-center mb-6">Upload Questions</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="file">
            Chọn file câu hỏi
          </label>
          <input
            id="file"
            type="file"
            accept=".txt"
            onChange={handleFileChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
          <p className="text-gray-600 text-xs mt-2">Định dạng: mỗi câu hỏi gồm 6 dòng, cách nhau bởi dòng trống</p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
        >
          {loading ? 'Uploading...' : 'Upload và tạo game'}
        </button>
      </form>
    </div>
  )
}