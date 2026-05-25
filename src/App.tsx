import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './app/providers/AuthProvider'
import { SomitySettingsProvider } from './app/context/SomitySettingsProvider'
import AppRoutes from './app/routes/AppRoutes'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SomitySettingsProvider>
          <AppRoutes />
        </SomitySettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App