import React, { useState, useEffect } from 'react';
import SplashScreen from './pages/SplashScreen';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import WardenDashboard from './pages/WardenDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ManagementDashboard from './pages/ManagementDashboard';
import TargetCursor from './components/TargetCursor';

function App() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [userSession, setUserSession] = useState(null);

  // Recover session on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('campuscare_session');
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        setUserSession(parsed);
        if (parsed.role === 'warden' || parsed.role === 'headwarden') {
          setCurrentScreen('warden-dashboard');
        } else if (parsed.role === 'management') {
          setCurrentScreen('management-dashboard');
        } else {
          setCurrentScreen('student-dashboard');
        }
      } catch {
        localStorage.removeItem('campuscare_session');
      }
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUserSession(userData);
    localStorage.setItem('campuscare_session', JSON.stringify(userData));
    if (userData.role === 'warden' || userData.role === 'headwarden') {
      setCurrentScreen('warden-dashboard');
    } else if (userData.role === 'management') {
      setCurrentScreen('management-dashboard');
    } else {
      setCurrentScreen('student-dashboard');
    }
  };

  const handleLogout = () => {
    setUserSession(null);
    localStorage.removeItem('campuscare_session');
    setCurrentScreen('landing');
  };

  const handleUpdateSession = (updatedUserData) => {
    setUserSession(updatedUserData);
    localStorage.setItem('campuscare_session', JSON.stringify(updatedUserData));
  };

  return (
    <div className="app-container">
      <TargetCursor 
        spinDuration={2}
        hideDefaultCursor={true}
        parallaxOn={true}
      />
      {currentScreen === 'splash' && (
        <SplashScreen onComplete={() => setCurrentScreen('landing')} />
      )}
      {currentScreen === 'landing' && (
        <LandingPage onLoginClick={() => setCurrentScreen('login')} />
      )}
      {currentScreen === 'login' && (
        <LoginPage 
          onBackToHome={() => setCurrentScreen('landing')} 
          onLoginSuccess={handleLoginSuccess}
        />
      )}
      {currentScreen === 'student-dashboard' && (
        <StudentDashboard 
          user={userSession} 
          onLogout={handleLogout} 
          onUpdateProfile={handleUpdateSession}
        />
      )}
      {currentScreen === 'warden-dashboard' && (
        <WardenDashboard 
          user={userSession} 
          onLogout={handleLogout} 
          onUpdateProfile={handleUpdateSession}
        />
      )}
      {currentScreen === 'management-dashboard' && (
        <ManagementDashboard 
          user={userSession} 
          onLogout={handleLogout} 
          onUpdateProfile={handleUpdateSession}
        />
      )}
    </div>
  );
}

export default App;
