import React, { useRef, useState } from 'react';

const ObjectRecognition: React.FC = () => {
  const webcamRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [result, setResult] = useState<any>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (webcamRef.current) {
        webcamRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error('Camera access denied:', error);
    }
  };

  const stopCamera = () => {
    if (webcamRef.current && webcamRef.current.srcObject) {
      const mediaStream = webcamRef.current.srcObject as MediaStream;
      mediaStream.getTracks().forEach(track => track.stop());
      webcamRef.current.srcObject = null;
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setIsCameraActive(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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
      const response = await fetch('http://localhost:8001/api/detect-objects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData })
      });
      
      const detectionResult = await response.json();
      if (detectionResult.success) {
        setResultImage(detectionResult.result_image);
        setResult(detectionResult);
      } else {
        console.error('Object detection failed:', detectionResult.error);
        setResultImage(imageData);
        setResult(null);
      }
    } catch (error) {
      console.error('API call failed:', error);
      setResultImage(imageData);
    }
    setIsProcessing(false);
  };

  return (
    <div className="object-detection-page">
      <div className="page-hero">
        <h1>Visual Intelligence Engine</h1>
        <p>Advanced object detection and recognition powered by MobileNetSSD neural networks</p>
      </div>
      <div className="feature-card">
        <div className="card-header">
          <div className="header-content">
            <div className="feature-icon">
              <span className="feature-emoji">⚽️</span>
            </div>
            <div className="header-text">
              <h2>Intelligent Object Detection</h2>
              <p>Advanced MobileNetSSD neural network for real-time multi-object detection and classification</p>
            </div>
          </div>
          <div className="status-badge">
            <span>{isCameraActive ? 'Camera Active' : 'Object Scanner Ready'}</span>
          </div>
        </div>
        
        <div className="webcam-section">
          <div className="webcam-container">
            <video ref={webcamRef} className="webcam" autoPlay muted />
            <div className="detection-overlay">
              <div className="scan-grid"></div>
            </div>
          </div>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
        
        <div className="control-panel">
          {!isCameraActive ? (
            <>
              <button className="primary-btn" onClick={startCamera}>
                <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                </svg>
                Start Camera
              </button>
              <button className="secondary-btn" onClick={() => fileInputRef.current?.click()}>
                <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>
                Upload Image
              </button>
            </>
          ) : (
            <>
              <button className="secondary-btn" onClick={stopCamera}>
                <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 6h12v12H6z"/>
                </svg>
                Stop Camera
              </button>
              <button className="primary-btn" onClick={capture} disabled={isProcessing}>
                <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.516 6.516 0 0 1 9.5 16 6.5 6.5 0 0 1 3 9.5 6.5 6.5 0 0 1 9.5 3m0 2C7.01 5 5 7.01 5 9.5S7.01 14 9.5 14 14 11.99 14 9.5 11.99 5 9.5 5z"/>
                </svg>
                {isProcessing ? 'Analyzing...' : 'Detect Objects'}
              </button>
            </>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>
        
        {resultImage && (
          <div className="analysis-result">
            <div className="detection-results-box">
              <div className="results-header">
                <svg className="result-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z"/>
                </svg>
                <h3>Object Detection Complete</h3>
              </div>
              <div className="detection-summary">
                {result?.detected_objects?.length > 0 ? (
                  <div className="objects-found">
                    <span className="count-badge">{result.detected_objects.length}</span>
                    <span className="objects-text">Objects Detected:</span>
                    <div className="objects-list">
                      {result.detected_objects.map((obj: string, index: number) => (
                        <span key={index} className="object-tag">{obj}</span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="no-objects">
                    <span className="no-objects-text">No objects detected in this image</span>
                  </div>
                )}
              </div>
            </div>
            <div className="result-content-center">
              <div className="result-image-container">
                <img src={resultImage} alt="Object Detection Analysis" />
              </div>
              <div className="result-actions-center">
                <button className="action-btn save-btn">
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15,9H5V5H15M12,19A3,3 0 0,1 9,16A3,3 0 0,1 12,13A3,3 0 0,1 15,16A3,3 0 0,1 12,19M17,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3Z"/>
                  </svg>
                  Save Image
                </button>
                <button className="action-btn whatsapp-btn">
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
                  </svg>
                  Share on WhatsApp
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ObjectRecognition;