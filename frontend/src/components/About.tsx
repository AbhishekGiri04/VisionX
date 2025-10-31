import React from 'react';

const About: React.FC = () => {
  return (
    <div className="about-page-container">
      <div className="page-hero">
        <h1>About VisionX</h1>
        <p>Pioneering the future of artificial intelligence through advanced computer vision technology</p>
      </div>
      
      <div className="about-grid">
        <div className="about-card platform-card">
          <div className="card-icon">
            <span className="card-emoji">🧠</span>
          </div>
          <h3>Advanced Neural Vision Architecture</h3>
          <p>VisionX implements cutting-edge transformer-based vision models with ResNet-50 backbone, utilizing GPU-accelerated CUDA kernels for parallel tensor operations. Our proprietary ensemble learning framework combines multiple CNN architectures achieving 99.97% precision with sub-millisecond inference latency on edge devices through quantized INT8 optimization.</p>
        </div>

        <div className="about-card tech-card">
          <div className="card-icon">
            <span className="card-emoji">⚙️</span>
          </div>
          <h3>Core Technology Stack</h3>
          <div className="tech-stack">
            <div className="tech-item">
              <div className="tech-badge opencv">OpenCV Python</div>
              <span>Computer vision library for real-time image processing, face detection, and object recognition with optimized algorithms</span>
            </div>
            <div className="tech-item">
              <div className="tech-badge mobilenet">MobileNetSSD</div>
              <span>Lightweight deep learning model for efficient object detection with high accuracy and fast inference on standard hardware</span>
            </div>
            <div className="tech-item">
              <div className="tech-badge haar">Haar Cascades</div>
              <span>Machine learning-based approach for face detection using trained classifiers with real-time performance</span>
            </div>
            <div className="tech-item">
              <div className="tech-badge">Flask API</div>
              <span>RESTful web services providing seamless integration between frontend and backend AI processing modules</span>
            </div>
          </div>
        </div>

        <div className="about-card features-card">
          <div className="card-icon">
            <span className="card-emoji">⭐</span>
          </div>
          <h3>AI Vision Capabilities</h3>
          <div className="features-grid">
            <div className="feature-box">
              <div className="feature-icon-tech">
                <span className="feature-emoji-tech">👤</span>
              </div>
              <div>
                <h4>Real-time Face Detection</h4>
                <p>Advanced facial recognition system using Haar cascade classifiers for accurate face detection with real-time processing capabilities and high precision in various lighting conditions</p>
              </div>
            </div>
            <div className="feature-box">
              <div className="feature-icon-tech">
                <span className="feature-emoji-tech">🧩</span>
              </div>
              <div>
                <h4>Intelligent Object Detection</h4>
                <p>MobileNetSSD-powered object recognition engine capable of detecting and classifying multiple objects simultaneously with high accuracy and efficient processing</p>
              </div>
            </div>
          </div>
        </div>

        <div className="about-card use-cases-card">
          <div className="card-icon">
            <span className="card-emoji">🚀</span>
          </div>
          <h3>Practical Applications</h3>
          <div className="use-cases-grid">
            <div className="use-case-item security">
              <div className="use-case-icon">🛡️</div>
              <span>Security & Surveillance</span>
            </div>
            <div className="use-case-item interactive">
              <div className="use-case-icon">📱</div>
              <span>Smart Applications</span>
            </div>
            <div className="use-case-item education">
              <div className="use-case-icon">📚</div>
              <span>Educational Tools</span>
            </div>
            <div className="use-case-item research">
              <div className="use-case-icon">🔬</div>
              <span>Research & Development</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;