// src/App.jsx
import React, { useState } from 'react';
import SplashScreen from './pages/SplashScreen';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';

function App() {
  const [currentScreen, setCurrentScreen] = useState('splash');

  return (
    <div className="app-root" style={{ width: '100vw', minHeight: '100vh' }}>
      {currentScreen === 'splash' && (
        <SplashScreen onComplete={() => setCurrentScreen('landing')} />
      )}
      {currentScreen === 'landing' && (
        <LandingPage onLoginClick={() => setCurrentScreen('login')} />
      )}
      {currentScreen === 'login' && (
        <LoginPage onBackToHome={() => setCurrentScreen('landing')} />
      )}
    </div>
  );
}

export default App;
