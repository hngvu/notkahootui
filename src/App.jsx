import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import HostLogin from './components/Host/HostLogin'
import HostUpload from './components/Host/HostUpload'
import HostGame from './components/Host/HostGame'
import PlayerJoin from './components/Player/PlayerJoin'
import PlayerGame from './components/Player/PlayerGame'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<PlayerJoin />} />
        <Route path="/player/game" element={<PlayerGame />} />
        <Route path="/host/login" element={<HostLogin />} />
        <Route path="/host/upload" element={<HostUpload />} />
        <Route path="/host/game" element={<HostGame />} />
      </Routes>
    </Layout>
  )
}

export default App