import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp';
import CitizenDashboard from './pages/CitizenDashboard';
import SubmitReport from './pages/SubmitReport';
import ReportDetail from './pages/ReportDetail';
import LiveMap from './pages/LiveMap';
import AuthorityDashboard from './pages/AuthorityDashboard';

export default function App() {
  return (
    <div className="min-h-screen bg-ink text-text-primary font-body">
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/map" element={<LiveMap />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="citizen">
              <CitizenDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report/new"
          element={
            <ProtectedRoute role="citizen">
              <SubmitReport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report/:id"
          element={
            <ProtectedRoute>
              <ReportDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/authority"
          element={
            <ProtectedRoute role="authority">
              <AuthorityDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}
