import React, { useState, useEffect } from 'react';
import SplashScreen from './pages/SplashScreen';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import WardenDashboard from './pages/WardenDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ManagementDashboard from './pages/ManagementDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import ClickSpark from './components/ClickSpark';
import { SocketProvider } from './context/SocketContext';

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
        if (parsed.role === 'worker') {
          setCurrentScreen('worker-dashboard');
        } else if (parsed.role === 'warden' || parsed.role === 'headwarden') {
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
    if (userData.role === 'worker') {
      setCurrentScreen('worker-dashboard');
    } else if (userData.role === 'warden' || userData.role === 'headwarden') {
      setCurrentScreen('warden-dashboard');
    } else if (userData.role === 'management') {
      setCurrentScreen('management-dashboard');
    } else {
      setCurrentScreen('student-dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('campuscare_session');
    setUserSession(null);
    setCurrentScreen('login');
  };

  const handleUpdateSession = (updatedFields) => {
    setUserSession(prev => {
      const next = { ...prev, ...updatedFields };
      localStorage.setItem('campuscare_session', JSON.stringify(next));
      return next;
    });
  };

  return (
    <ClickSpark sparkColor="#FFC107" sparkSize={10} sparkRadius={25} sparkCount={8}>
      <SocketProvider user={userSession}>
        <div style={{ width: '100vw', minHeight: '100vh', backgroundColor: '#f4f7fc' }}>
          {currentScreen === 'splash' && (
            <SplashScreen 
              onComplete={() => setCurrentScreen('landing')} 
              onFinish={() => setCurrentScreen('landing')} 
            />
          )}
          {currentScreen === 'landing' && (
            <LandingPage 
              onLoginClick={() => setCurrentScreen('login')} 
              onNavigateLogin={() => setCurrentScreen('login')} 
              user={userSession}
            />
          )}
          {currentScreen === 'login' && (
            <LoginPage 
              onLoginSuccess={handleLoginSuccess} 
              onBackToWebsite={() => setCurrentScreen('landing')}
            />
          )}
          {currentScreen === 'student-dashboard' && (
            <StudentDashboard 
              user={userSession} 
              onLogout={handleLogout} 
              onUpdateProfile={handleUpdateSession}
            />
          )}
          {currentScreen === 'worker-dashboard' && (
            <WorkerDashboard 
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
      </SocketProvider>
    </ClickSpark>
  );
}

export default App;
