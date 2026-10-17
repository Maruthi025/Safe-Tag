import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './store/AuthContext'
import { NotificationProvider } from './store/NotificationContext'

// Layouts
import PublicLayout from './components/layout/PublicLayout'
import AdminLayout from './components/layout/AdminLayout'

// Public pages
import HomePage from './pages/public/HomePage'
import HowItWorksPage from './pages/public/HowItWorksPage'
import AboutPage from './pages/public/AboutPage'
import PrivacyPage from './pages/public/PrivacyPage'
import TermsPage from './pages/public/TermsPage'

// Auth pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Finder pages
import FinderPage from './pages/finder/FinderPage'
import SubmitSuccessPage from './pages/finder/SubmitSuccessPage'
import MyFoundReportsPage from './pages/finder/MyFoundReportsPage'
import FinderReportDetailPage from './pages/finder/FinderReportDetailPage'

// Admin pages
import DashboardPage from './pages/admin/DashboardPage'
import ItemsPage from './pages/admin/ItemsPage'
import ItemDetailPage from './pages/admin/ItemDetailPage'
import RegisterItemPage from './pages/admin/RegisterItemPage'
import LostReportsPage from './pages/admin/LostReportsPage'
import ReportLostPage from './pages/admin/ReportLostPage'
import FoundItemReportsPage from './pages/admin/FoundItemReportsPage'
import MatchDetailPage from './pages/admin/MatchDetailPage'
import NotificationsPage from './pages/admin/NotificationsPage'
import ProfilePage from './pages/admin/ProfilePage'
import QRPage from './pages/admin/QRPage'

import ProtectedRoute from './features/auth/ProtectedRoute'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Finder Routes (mobile friendly, accessible without account) */}
            <Route path="/finder" element={<FinderPage />} />
            <Route path="/finder/success" element={<SubmitSuccessPage />} />
            <Route path="/finder/reports" element={<MyFoundReportsPage />} />
            <Route path="/finder/report/:ref" element={<FinderReportDetailPage />} />

            {/* Protected Admin Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<DashboardPage />} />
                <Route path="/admin/items" element={<ItemsPage />} />
                <Route path="/admin/items/register" element={<RegisterItemPage />} />
                <Route path="/admin/items/:id" element={<ItemDetailPage />} />
                <Route path="/admin/lost-reports" element={<LostReportsPage />} />
                <Route path="/admin/lost-reports/new" element={<ReportLostPage />} />
                <Route path="/admin/found-reports" element={<FoundItemReportsPage />} />
                <Route path="/admin/matches" element={<FoundItemReportsPage />} />
                <Route path="/admin/matches/:id" element={<MatchDetailPage />} />
                <Route path="/admin/notifications" element={<NotificationsPage />} />
                <Route path="/admin/profile" element={<ProfilePage />} />
                <Route path="/admin/qr" element={<QRPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}