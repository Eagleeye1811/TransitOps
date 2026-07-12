import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from '@/routes/AppRoutes'
import { ToastContainer } from '@/components/common/Toast'
import { useTheme } from '@/hooks/useTheme'

function App() {
  // Applies/removes the `dark` class on <html> as a side effect whenever the
  // theme changes — mounted once at the root so it takes effect on every
  // route, including the pre-auth Login page.
  useTheme()

  return (
    <BrowserRouter>
      <AppRoutes />
      <ToastContainer />
    </BrowserRouter>
  )
}

export default App
