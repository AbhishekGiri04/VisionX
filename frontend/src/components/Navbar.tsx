import React from 'react';

interface NavbarProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activePage, setActivePage }) => {
  return (
    <nav className="modern-navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <div className="brand-icon">
            <span className="brain-emoji">🧠</span>
          </div>
          <div className="brand-text">
            <h2>VisionX</h2>
            <span>AI Vision Platform</span>
          </div>
        </div>
        
        <div className="navbar-menu">
          <div className="nav-items">
            <button 
              className={`nav-item ${activePage === 'face' ? 'active' : ''}`}
              onClick={() => setActivePage('face')}
            >
              <span className="nav-text">Home</span>
              <div className="nav-indicator"></div>
            </button>
            
            <button 
              className={`nav-item ${activePage === 'object' ? 'active' : ''}`}
              onClick={() => setActivePage('object')}
            >
              <span className="nav-text">Visual Intelligence</span>
              <div className="nav-indicator"></div>
            </button>
            

            
            <button 
              className={`nav-item ${activePage === 'about' ? 'active' : ''}`}
              onClick={() => setActivePage('about')}
            >
              <span className="nav-text">About</span>
              <div className="nav-indicator"></div>
            </button>
          </div>
        </div>
        

      </div>
    </nav>
  );
};

export default Navbar;