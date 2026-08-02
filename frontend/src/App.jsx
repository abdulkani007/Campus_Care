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

// Global fetch interceptor to automatically append X-Hostel-Type header
const originalFetch = window.fetch;
window.fetch = function (url, options) {
  let finalOptions = options;
  if (finalOptions === null || typeof finalOptions !== 'object') {
    finalOptions = {};
  }
  const sessionStr = localStorage.getItem('campuscare_session');
  if (sessionStr) {
    try {
      const session = JSON.parse(sessionStr);
      if (session && session.hostelType) {
        finalOptions.headers = finalOptions.headers || {};
        // Only append if not already specified manually
        if (!finalOptions.headers['X-Hostel-Type'] && !finalOptions.headers['x-hostel-type']) {
          finalOptions.headers['X-Hostel-Type'] = session.hostelType;
        }
      }
    } catch (e) {
      // ignore
    }
  }
  return originalFetch(url, finalOptions);
};

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
    if (userSession) {
      const nextSession = { ...userSession, ...updatedFields };
      setUserSession(nextSession);
      localStorage.setItem('campuscare_session', JSON.stringify(nextSession));
    }
  };

  return (
    <ClickSpark>
      <SocketProvider user={userSession}>
        <div className="App">
          {currentScreen === 'splash' && (
            <SplashScreen onComplete={() => setCurrentScreen('landing')} onFinished={() => setCurrentScreen('landing')} />
          )}
          {currentScreen === 'landing' && (
            <LandingPage 
              onGetStarted={() => setCurrentScreen('login')} 
              onLoginClick={() => setCurrentScreen('login')} 
            />
          )}
          {currentScreen === 'login' && (
            <LoginPage 
              onLoginSuccess={handleLoginSuccess} 
              onBackToHome={() => setCurrentScreen('landing')}
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
