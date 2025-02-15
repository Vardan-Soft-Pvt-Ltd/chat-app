import './App.css'
import { ChatPage } from './pages/chat/chat'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext'
import { Toaster } from 'sonner';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Toaster richColors position="top-right" />
        <div className="w-full h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
          <Routes>
            <Route path="/" element={<ChatPage />} />
            <Route path="/:agent_id" element={<ChatPage />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App;