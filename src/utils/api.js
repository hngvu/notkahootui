const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export async function hostLogin(password) {
  const response = await fetch(`${API_BASE}/host/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password }),
  })
  
  if (!response.ok) {
    throw new Error('Login failed')
  }
  
  return response.json()
}

export async function uploadQuestions(file) {
  const formData = new FormData()
  formData.append('file', file)

  const token = localStorage.getItem('hostToken')
  const response = await fetch(`${API_BASE}/host/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Upload failed')
  }
  
  return response.json()
}

export async function uploadQuestionsText(questionText) {
  const token = localStorage.getItem('hostToken')
  let response = await fetch(`${API_BASE}/host/upload-text`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ questionText }),
  })
  
  // Fallback to alias if 404 Not Found (some setups may call camelCase path)
  if (response.status === 404) {
    response = await fetch(`${API_BASE}/host/uploadText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ questionText }),
    })
  }

  if (!response.ok) {
    // Try to read JSON error; if not JSON, fall back to text
    let message = 'Upload failed'
    try {
      const error = await response.json()
      message = error.error || message
    } catch {
      try {
        message = await response.text()
      } catch { /* ignore */ }
    }
    throw new Error(message)
  }
  
  return response.json()
}