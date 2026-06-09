import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Auth } from './pages/Auth';
import { PatientDashboard } from './pages/PatientDashboard';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { SymptomChecker } from './pages/SymptomChecker';
import { BookAppointment } from './pages/BookAppointment';
import { Profile } from './pages/Profile';
import { VideoConsultation } from './pages/VideoConsultation';
import { MedicalHistory } from './pages/MedicalHistory';
import { UserRole } from './types';

const ProtectedRoute: React.FC<{ children: React.ReactNode, role?: UserRole }> = ({ children, role }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />; // Or unauthorized page

  return <Layout>{children}</Layout>;
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute role={UserRole.PATIENT}>
              <PatientDashboard />
            </ProtectedRoute>
          } />

          <Route path="/doctor-dashboard" element={
            <ProtectedRoute role={UserRole.DOCTOR}>
              <DoctorDashboard />
            </ProtectedRoute>
          } />

          <Route path="/symptom-checker" element={
            <ProtectedRoute role={UserRole.PATIENT}>
              <SymptomChecker />
            </ProtectedRoute>
          } />

          <Route path="/book-appointment" element={
            <ProtectedRoute role={UserRole.PATIENT}>
              <BookAppointment />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          <Route path="/consultation/:appointmentId" element={
            <ProtectedRoute>
              <VideoConsultation />
            </ProtectedRoute>
          } />

          <Route path="/medical-history" element={
            <ProtectedRoute role={UserRole.PATIENT}>
              <MedicalHistory />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
    </ThemeProvider>
  );
};

export default App;