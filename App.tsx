import { HashRouter, Route, Routes } from 'react-router'
import HomePage from './pages/Home'
import LoginPage from './pages/Auth/Login'
import InventoryPage from './pages/Inventory'
import LoansPage from './pages/Loans'
import RequestsPage from './pages/Requests'
import UsersPage from './pages/Users'
import ProfilePage from './pages/Profile'
import NotFoundPage from './pages/NotFound'
import AuditsPage from './pages/Audits'
import { Toaster } from 'sonner'

/**
 * Main App routing using HashRouter.
 * Defines all routes and global toaster.
 */
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/loans" element={<LoansPage />} />
        <Route path="/requests" element={<RequestsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/audits" element={<AuditsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster />
    </HashRouter>
  )
}
