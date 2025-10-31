import React, { useRef, useState } from 'react';

const FaceDetection: React.FC = () => {
  const webcamRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [faceCount, setFaceCount] = useState<number>(0);
  const [featuresDetected, setFeaturesDetected] = useState<boolean>(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (webcamRef.current) {
        webcamRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (error) {
      console.error('Camera access denied:', error);
    }
  };

  const stopCamera = () => {
    if (webcamRef.current && webcamRef.current.srcObject) {
      const stream = webcamRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      webcamRef.current.srcObject = null;
      setIsStreaming(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        processImage(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const capture = () => {
    if (!webcamRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const video = webcamRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx?.drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg');
    processImage(imageData);
  };

  const processImage = async (imageData: string) => {
    setIsProcessing(true);
    
    try {
      console.log('Sending request to backend...');
      
      const response = await fetch('http://localhost:8000/api/detect-faces', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ image: imageData })
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('API Response:', result);
      
      if (result.success && result.result_image) {
        setResultImage(result.result_image);
        setFaceCount(result.face_count || 0);
        setFeaturesDetected(result.features_detected || false);
        console.log(`✅ Success: ${result.face_count} faces detected`);
      } else {
        console.error('API Error:', result.error);
        alert('Face detection failed: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Network Error:', error);
      alert(`Network error: ${error}. Backend status: ${await checkBackend()}`);
    }
    
    setIsProcessing(false);
  };
  
  const captureAndAnalyzeAI = async () => {
    if (!webcamRef.current || !canvasRef.current) return;
    
    setIsProcessing(true);
    
    const canvas = canvasRef.current;
    const video = webcamRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx?.drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg');
    
    try {
      const response = await fetch('http://localhost:8000/api/ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          image: imageData, 
          type: 'direct_analysis' 
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setResultImage(imageData);
        setAiAnalysis(result.analysis);
        setFaceCount(0);
        setFeaturesDetected(true);
      } else {
        alert('AI Analysis failed: ' + result.error);
      }
    } catch (error) {
      alert('AI Analysis error: ' + error);
    }
    setIsProcessing(false);
  };

  const analyzeWithAI = async () => {
    if (!resultImage) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch('http://localhost:8000/api/ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          image: resultImage, 
          type: 'face_analysis' 
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setAiAnalysis(result.analysis);
      } else {
        alert('AI Analysis failed: ' + result.error);
      }
    } catch (error) {
      alert('AI Analysis error: ' + error);
    }
    setIsProcessing(false);
  };

  const checkBackend = async () => {
    try {
      const response = await fetch('http://localhost:8000/health');
      return response.ok ? 'Running' : 'Not responding';
    } catch {
      return 'Not running';
    }
  };

  return (
    <div className="feature-card">
      <div className="card-header">
        <div className="header-content">
          <div className="feature-icon">
            <span className="feature-emoji">👦🏻</span>
          </div>
          <div className="header-text">
            <h2>Face Detection</h2>
            <p>Real-time facial detection with feature recognition</p>
          </div>
        </div>
        <div className="status-badge">
          <span>Face Scanner Ready</span>
        </div>
      </div>
      
      <div className="webcam-section">
        <div className="webcam-container">
          <video ref={webcamRef} className="webcam" autoPlay muted />
          <div className="webcam-overlay">
            <div className="scan-line"></div>
          </div>
        </div>
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
      
      <div className="control-panel">
        {!isStreaming ? (
          <>
            <button className="primary-btn" onClick={startCamera}>
              Start Camera
            </button>
            <button className="secondary-btn" onClick={() => fileInputRef.current?.click()}>
              Upload Image
            </button>
          </>
        ) : (
          <>
            <button className="secondary-btn" onClick={capture} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Detect Faces'}
            </button>
            <button className="secondary-btn" onClick={stopCamera}>
              Stop Camera
            </button>
          </>
        )}
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*" 
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
      </div>
      
      {resultImage && (
        <div className="analysis-result">
          <div className="result-header-center">
            <div className="result-status">
              <h2>Face Detection Complete</h2>
            </div>
            <div className="face-count-display">
              <span className="count-number">{faceCount}</span>
              <span className="count-text">Face{faceCount !== 1 ? 's' : ''} Found</span>
              {featuresDetected && (
                <div className="features-status">
                  <span className="features-indicator">Features Detected</span>
                </div>
              )}
            </div>

          </div>
          <div className="result-content-center">
            <div className="result-image-container">
              <img src={resultImage} alt="Face Detection Result" />
            </div>
            <div className="result-actions-center">
              <button 
                className="action-btn save-btn"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = resultImage;
                  link.download = `VisionX-FaceDetection-${Date.now()}.jpg`;
                  link.click();
                }}
              >
                Save Image
              </button>
              <button 
                className="action-btn whatsapp-btn"
                onClick={() => {
                  const text = `VisionX Face Detection Results: ${faceCount} face(s) detected`;
                  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + ' - ' + window.location.href)}`;
                  window.open(whatsappUrl, '_blank');
                }}
                style={{
                  backgroundColor: '#25D366',
                  color: 'white',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                Share on WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FaceDetection;