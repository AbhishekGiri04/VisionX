import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import FaceDetection from './components/FaceDetection';
import ObjectRecognition from './components/ObjectRecognition';
import About from './components/About';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';
import './App.css';

function App() {
  const [activePage, setActivePage] = useState('face');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.body.className = '';
    if (activePage === 'face') {
      document.body.classList.add('home-page');
    } else if (activePage === 'object') {
      document.body.classList.add('object-page');

    } else if (activePage === 'about') {
      document.body.classList.add('about-page');
    }
  }, [activePage]);

  const renderPage = () => {
    switch (activePage) {
      case 'face': return <FaceDetection />;
      case 'object': return <ObjectRecognition />;

      case 'about': return <About />;
      default: return <FaceDetection />;
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="App">
      <Navbar activePage={activePage} setActivePage={setActivePage} />
      <div className="container">
        {activePage === 'face' && (
          <div className="hero-section">
            <div className="hero-container">
              <div className="hero-logo">
                <img src="https://images.steamusercontent.com/ugc/931562843186464445/FB881E67602FAE72C22ABE27EFF32B4D1D53261A/?imw=512&&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false" alt="VisionX Logo" />
              </div>
              <div className="hero-brand">
                <h1>VisionX</h1>
                <p className="hero-tagline">Pioneering the Future of Intelligent Vision</p>
              </div>
              <p className="hero-description">Next-generation AI vision platform with intelligent recognition capabilities.</p>
              <div className="hero-capabilities">
                <div className="capability-card">
                  <span className="capability-emoji">👤</span>
                  <h3>Face Detection</h3>
                  <p>Real-time facial detection with feature recognition</p>
                </div>
                <div className="capability-card">
                  <span className="capability-emoji">🧩</span>
                  <h3>Object Detection</h3>
                  <p>Smart visual analysis and recognition</p>
                </div>

              </div>
            </div>
          </div>
        )}
        {renderPage()}
      </div>
      <Footer setActivePage={setActivePage} />
    </div>
  );
}

export default App;