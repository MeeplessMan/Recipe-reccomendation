import React, { useRef, useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { FaCamera, FaStop, FaPause, FaPlay, FaSave, FaUtensils } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { scanAPI } from '../services/api';
import RecipeRecommendations from './RecipeRecommendations';
import { useRecipeRecommendations } from '../context/RecipeRecommendationContext';

const CameraContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
  width: 100%;
  
  @media (max-width: 768px) {
    gap: 15px;
    padding: 0 0.5rem;
    padding-bottom: 2rem; /* Extra bottom padding to ensure content is visible above bottom nav */
  }
`;

const VideoWrapper = styled.div`
  position: relative;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  background: #000;
`;

const VideoElement = styled.video`
  width: 100%;
  max-width: 640px;
  height: auto;
  aspect-ratio: 4/3;
  display: block;
  background: #000;
  
  @media (max-width: 768px) {
    max-width: 100%;
  }
  
  @media (max-width: 480px) {
    max-width: 95vw;
  }
`;

const OverlayCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

const ControlsContainer = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
  
  @media (max-width: 768px) {
    gap: 10px;
  }
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const ControlButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  
  @media (max-width: 480px) {
    width: 100%;
    justify-content: center;
    padding: 14px 20px;
  }
  
  ${props => props.primary && `
    background: linear-gradient(135deg, #4caf50, #45a049);
    color: white;
    
    &:hover {
      background: linear-gradient(135deg, #45a049, #3d8b40);
      transform: translateY(-2px);
    }
  `}
  
  ${props => props.secondary && `
    background: linear-gradient(135deg, #f44336, #d32f2f);
    color: white;
    
    &:hover {
      background: linear-gradient(135deg, #d32f2f, #c62828);
      transform: translateY(-2px);
    }
  `}
  
  ${props => props.tertiary && `
    background: linear-gradient(135deg, #ff9800, #f57c00);
    color: white;
    
    &:hover {
      background: linear-gradient(135deg, #f57c00, #ef6c00);
      transform: translateY(-2px);
    }
  `}
  
  ${props => props.recipe && `
    background: ${props.active ? 'linear-gradient(135deg, #9c27b0, #7b1fa2)' : 'linear-gradient(135deg, #e1bee7, #ce93d8)'};
    color: ${props.active ? 'white' : '#4a148c'};
    
    &:hover {
      background: linear-gradient(135deg, ${props.active ? '#7b1fa2, #6a1b9a' : '#ce93d8, #ba68c8'});
      transform: translateY(-2px);
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  
  ${props => props.active && `
    background: rgba(76, 175, 80, 0.1);
    color: #4caf50;
  `}
  
  ${props => props.paused && `
    background: rgba(255, 152, 0, 0.1);
    color: #ff9800;
  `}
  
  ${props => props.inactive && `
    background: rgba(158, 158, 158, 0.1);
    color: #9e9e9e;
  `}
  
  ${props => props.error && `
    background: rgba(244, 67, 54, 0.1);
    color: #f44336;
  `}
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.2);
  border-radius: 8px;
  color: #f44336;
  font-size: 14px;
  margin: 10px 0;
  width: 100%;
  max-width: 600px;
  
  @media (max-width: 480px) {
    font-size: 13px;
    padding: 10px 12px;
  }
`;

const StatusDot = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'pulse',
})`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  animation: ${props => props.pulse ? 'pulse 2s infinite' : 'none'};
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

const DetectedIngredients = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  margin-top: 15px;
  min-height: 40px;
  width: 100%;
  padding: 0 1rem;
  
  @media (max-width: 480px) {
    gap: 8px;
    padding: 0 0.5rem;
  }
`;

const IngredientTag = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #2196f3, #1976d2);
  color: white;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  animation: slideIn 0.3s ease;
  
  @media (max-width: 480px) {
    font-size: 12px;
    padding: 5px 10px;
    gap: 6px;
  };
  
  @keyframes slideIn {
    from { transform: scale(0.8); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
`;

const ConfidenceBar = styled.div`
  width: 40px;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  overflow: hidden;
  
  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${props => props.confidence}%;
    background: #4caf50;
    transition: width 0.3s ease;
  }
`;

const LiveCameraScanner = () => {
  const { markScanComplete } = useRecipeRecommendations();
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const errorCountRef = useRef(0);
  const lastScanTimeRef = useRef(0);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [detectedIngredients, setDetectedIngredients] = useState([]);
  const [scanCount, setScanCount] = useState(0);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      errorCountRef.current = 0;
      
      // Check if camera is already running and clean up first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'environment', // Prefer back camera
          frameRate: { ideal: 15, max: 30 } // Limit frame rate to reduce resource usage
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Add event listeners to monitor stream health
        stream.getTracks().forEach(track => {
          track.onended = () => {
            console.warn('Camera track ended unexpectedly');
            setCameraError('Camera disconnected unexpectedly');
            setIsStreaming(false);
            setIsScanning(false);
            toast.error('Camera connection lost. Please restart.');
          };
          
          track.onerror = (event) => {
            console.error('Camera track error:', event);
            setCameraError('Camera error occurred');
            toast.error('Camera error. Try restarting the camera.');
          };
        });
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          setIsStreaming(true);
          toast.success('Camera started successfully!');
        };
        
        videoRef.current.onerror = (error) => {
          console.error('Video element error:', error);
          setCameraError('Video playback error');
          toast.error('Video playback failed. Please try again.');
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError(error.message);
      
      let errorMessage = 'Failed to access camera. ';
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera permissions and refresh the page.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage += 'Camera not supported by this browser.';
      } else {
        errorMessage += 'Please check your camera and try again.';
      }
      
      toast.error(errorMessage);
    }
  }, []);
  
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsStreaming(false);
    setIsScanning(false);
    
    // Mark scan as complete when stopping camera
    if (showRecommendations && detectedIngredients.length > 0) {
      markScanComplete();
      toast.success('Scan completed! Recommendations saved.');
    }
    
    setDetectedIngredients([]);
    clearInterval(scanIntervalRef.current);
    toast('Camera stopped');
  }, [markScanComplete, showRecommendations, detectedIngredients.length]);
  
  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Use video's actual dimensions or default to responsive size
    const width = video.videoWidth || video.clientWidth || 640;
    const height = video.videoHeight || video.clientHeight || 480;
    
    canvas.width = width;
    canvas.height = height;
    
    // Draw current frame
    ctx.drawImage(video, 0, 0, width, height);
    
    // Convert to blob
    return new Promise(resolve => {
      canvas.toBlob(resolve, 'image/jpeg', 0.8);
    });
  }, []);

  const drawBoundingBoxes = useCallback((ingredients) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ingredients.forEach((ingredient, index) => {
      if (ingredient.bbox) {
        const { bbox } = ingredient;
        const color = `hsl(${(index * 60) % 360}, 70%, 50%)`;
        
        // Calculate width and height from coordinates
        const x = bbox.x1;
        const y = bbox.y1;
        const width = bbox.x2 - bbox.x1;
        const height = bbox.y2 - bbox.y1;
        
        // Draw bounding box
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, width, height);
        
        // Draw label background
        const label = `${ingredient.name} (${(ingredient.confidence * 100).toFixed(0)}%)`;
        ctx.font = '14px Arial';
        const labelWidth = ctx.measureText(label).width;
        
        ctx.fillStyle = color;
        ctx.fillRect(x, y - 25, labelWidth + 10, 20);
        
        // Draw label text
        ctx.fillStyle = 'white';
        ctx.fillText(label, x + 5, y - 10);
      }
    });
  }, []);
  
  const clearBoundingBoxes = useCallback(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  }, []);
  
  const pauseScanning = useCallback(() => {
    setIsScanning(false);
    clearInterval(scanIntervalRef.current);
    clearBoundingBoxes();
    toast('Scanning paused');
  }, [clearBoundingBoxes]);

  const scanFrame = useCallback(async () => {
    if (!isStreaming || !videoRef.current) return;
    
    // Throttle scanning to prevent overwhelming the system
    const now = Date.now();
    if (now - lastScanTimeRef.current < 800) return; // Minimum 800ms between scans
    lastScanTimeRef.current = now;
    
    // Check if video is still playing
    if (videoRef.current.readyState < 2) {
      console.warn('Video not ready for scanning');
      return;
    }
    
    try {
      const frameBlob = await captureFrame();
      if (!frameBlob) {
        console.warn('Failed to capture frame');
        return;
      }
      
      const formData = new FormData();
      formData.append('image', frameBlob, 'frame.jpg');
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await scanAPI.liveScan(formData, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.detected_ingredients && response.detected_ingredients.length > 0) {
        console.log('Ingredients detected:', response.detected_ingredients);
        setDetectedIngredients(response.detected_ingredients);
        drawBoundingBoxes(response.detected_ingredients);
        errorCountRef.current = 0; // Reset error count on success
        
        // Auto-show recommendations if high-confidence ingredients are detected
        const highConfidenceIngredients = response.detected_ingredients.filter(
          ingredient => ingredient.confidence >= 0.5
        );
        
        console.log(`Total ingredients: ${response.detected_ingredients.length}, High confidence (>=50%): ${highConfidenceIngredients.length}`);
        console.log('High confidence ingredients:', highConfidenceIngredients.map(ing => `${ing.name} (${(ing.confidence * 100).toFixed(1)}%)`));
        
        if (highConfidenceIngredients.length > 0 && !showRecommendations) {
          console.log(`Auto-showing recommendations for ${highConfidenceIngredients.length} high-confidence ingredients`);
          setShowRecommendations(true);
        }
      } else {
        setDetectedIngredients([]);
        clearBoundingBoxes();
      }
      
      setScanCount(prev => {
        const newCount = prev + 1;
        console.log('Scan count:', newCount);
        return newCount;
      });
    } catch (error) {
      console.error('Scan error:', error);
      
      // Only count certain types of errors, ignore network timeouts and aborts
      const shouldCountError = !(
        error.name === 'AbortError' ||
        error.message.includes('timeout') ||
        error.message.includes('network') ||
        error.message.includes('fetch')
      );
      
      if (shouldCountError) {
        errorCountRef.current++;
      }
      
      // Be more lenient with error counting - allow more retries before stopping
      if (errorCountRef.current >= 10) {
        console.warn('Too many scan errors, pausing scanning');
        pauseScanning();
        toast.error('Multiple scan failures detected. Scanning paused. Please try restarting.');
        errorCountRef.current = 0;
      } else if (shouldCountError && errorCountRef.current === 1) {
        // Only show error message for the first real error, not network issues
        toast.error('Scan failed. Retrying...');
      }
    }
  }, [isStreaming, captureFrame, drawBoundingBoxes, clearBoundingBoxes, pauseScanning]);
  
  const startScanning = useCallback(() => {
    if (!isStreaming || !videoRef.current) {
      toast.error('Camera must be running to start scanning');
      return;
    }
    
    setIsScanning(true);
    setScanCount(0);
    errorCountRef.current = 0;
    lastScanTimeRef.current = 0;
    
    // Use a more conservative interval to prevent overwhelming the system
    scanIntervalRef.current = setInterval(scanFrame, 1500); // Scan every 1.5 seconds
    toast.success('Live scanning started!');
  }, [scanFrame, isStreaming]);
  
  const saveDetectedIngredients = useCallback(async () => {
    if (detectedIngredients.length === 0) {
      toast('No ingredients detected to save');
      return;
    }
    
    console.log('Saving ingredients:', detectedIngredients);
    
    try {
      // Save ingredients without interrupting the scanning process
      await scanAPI.saveLiveScan({ ingredients: detectedIngredients });
      toast.success(`Saved ${detectedIngredients.length} ingredients to your fridge!`);
      console.log('Ingredients saved successfully');
    } catch (error) {
      console.error('Save error:', error);
      // Don't show error for save failures to avoid disrupting the scanning experience
      toast.error('Failed to save ingredients. Please try again.');
    }
  }, [detectedIngredients]);
  
  // Monitor camera health and auto-recover if needed
  useEffect(() => {
    let healthCheckInterval;
    
    if (isStreaming && videoRef.current) {
      healthCheckInterval = setInterval(() => {
        const video = videoRef.current;
        if (video && streamRef.current) {
          // Check if video is still playing
          if (video.readyState === 0 || video.paused) {
            console.warn('Camera health check failed - video not playing');
            // Try to restart the video
            video.play().catch(error => {
              console.error('Failed to restart video playback:', error);
            });
          }
          
          // Check if stream tracks are still active
          const tracks = streamRef.current.getTracks();
          const hasActiveTracks = tracks.some(track => track.readyState === 'live');
          
          if (!hasActiveTracks) {
            console.warn('Camera health check failed - no active tracks');
            setCameraError('Camera connection lost');
            setIsStreaming(false);
            setIsScanning(false);
            toast.error('Camera disconnected. Please restart.');
          }
        }
      }, 5000); // Check every 5 seconds
    }
    
    return () => {
      if (healthCheckInterval) {
        clearInterval(healthCheckInterval);
      }
    };
  }, [isStreaming]);
  
  useEffect(() => {
    return () => {
      // Cleanup on component unmount only
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
      // Stop camera streams directly without dependencies
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []); // Empty dependency array - only run on mount/unmount
  
  return (
    <CameraContainer>
      <VideoWrapper>
        <VideoElement
          ref={videoRef}
          autoPlay
          playsInline
          muted
        />
        <OverlayCanvas ref={canvasRef} />
      </VideoWrapper>
      
      <ControlsContainer>
        {!isStreaming ? (
          <ControlButton primary onClick={startCamera}>
            <FaCamera /> {cameraError ? 'Restart Camera' : 'Start Camera'}
          </ControlButton>
        ) : (
          <>
            <ControlButton secondary onClick={stopCamera}>
              <FaStop /> Stop Camera
            </ControlButton>
            
            {cameraError ? (
              <ControlButton primary onClick={startCamera}>
                <FaCamera /> Restart Camera
              </ControlButton>
            ) : !isScanning ? (
              <ControlButton primary onClick={startScanning}>
                <FaPlay /> Start Scanning
              </ControlButton>
            ) : (
              <ControlButton tertiary onClick={pauseScanning}>
                <FaPause /> Pause Scanning
              </ControlButton>
            )}
            
            {detectedIngredients.length > 0 && (
              <>
                <ControlButton primary onClick={saveDetectedIngredients}>
                  <FaSave /> Save Ingredients
                </ControlButton>
                <ControlButton 
                  recipe 
                  active={showRecommendations}
                  onClick={() => setShowRecommendations(!showRecommendations)}
                >
                  <FaUtensils /> {showRecommendations ? 'Hide' : 'Show'} Recipe Ideas
                </ControlButton>
              </>
            )}
          </>
        )}
        
        {isStreaming && (
          <StatusIndicator 
            active={isScanning && !cameraError} 
            paused={!isScanning && isStreaming && !cameraError}
            inactive={!isStreaming}
            error={cameraError}
          >
            <StatusDot pulse={isScanning && !cameraError} />
            {cameraError ? 'Camera Error' : isScanning ? `Scanning... (${scanCount})` : isStreaming ? 'Camera Ready' : 'Camera Off'}
          </StatusIndicator>
        )}
      </ControlsContainer>
      
      {cameraError && (
        <ErrorMessage>
          <span>⚠️</span>
          <span>{cameraError}</span>
        </ErrorMessage>
      )}
      
      {detectedIngredients.length > 0 && (
        <DetectedIngredients>
          {detectedIngredients.map((ingredient, index) => (
            <IngredientTag key={`${ingredient.name}-${index}`}>
              {ingredient.name} ({(ingredient.confidence * 100).toFixed(1)}%)
              <ConfidenceBar confidence={ingredient.confidence * 100} />
            </IngredientTag>
          ))}
        </DetectedIngredients>
      )}
      
      {showRecommendations && detectedIngredients.length > 0 && (
        <RecipeRecommendations 
          detectedIngredients={detectedIngredients}
          isScanning={isScanning}
          onRecipeSelect={(recipe) => {
            toast.success(`Selected: ${recipe.title}`);
            // You can add navigation to recipe detail page here
            console.log('Selected recipe:', recipe);
          }}
        />
      )}
    </CameraContainer>
  );
};

export default LiveCameraScanner;