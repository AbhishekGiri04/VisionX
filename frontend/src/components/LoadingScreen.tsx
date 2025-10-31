import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <img 
          src="https://cdn.dribbble.com/userupload/22323866/file/original-e1f493ff9bca8bb642ebd4e2f9f5aef4.gif" 
          alt="Loading..." 
          className="loading-gif"
        />
        <div className="loading-text">
          <h1>VisionX</h1>
          <p>Initializing system...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;