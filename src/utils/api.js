const API_BASE = 'http://localhost:3000'

export async function hostLogin(password) {
  const response = await fetch(`${API_BASE}/host/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password }),
  })
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
  return response.json()
}