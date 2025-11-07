/**
 * Scan Page Component
 * Camera and file upload for ingredient scanning
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import { scanAPI, validateImageFile } from '../services/api';
import { Card, Button } from '../styles/GlobalStyle';
import { FiCamera, FiUpload, FiX, FiVideo } from 'react-icons/fi';
import toast from 'react-hot-toast';
import LiveCameraScanner from '../components/LiveCameraScanner';

const ScanWrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
  min-height: 100%;
  
  @media (max-width: 768px) {
    padding: 0.5rem;
    padding-bottom: 2rem; /* Extra padding for mobile to ensure content is visible above bottom nav */
  }
  
  @media (max-width: 480px) {
    padding-bottom: 3rem; /* Even more padding on small screens */
  }
`;

const Title = styled.h1`
  font-size: ${props => props.theme.fontSize['2xl']};
  font-weight: ${props => props.theme.fontWeight.bold};
  color: ${props => props.theme.colors.gray[800]};
  margin-bottom: ${props => props.theme.spacing[2]};
  text-align: center;
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.gray[600]};
  text-align: center;
  margin-bottom: ${props => props.theme.spacing[8]};
`;

const UploadArea = styled.div`
  border: 2px dashed ${props => props.theme.colors.gray[300]};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing[12]};
  text-align: center;
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  margin-bottom: ${props => props.theme.spacing[6]};
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: rgba(102, 126, 234, 0.05);
  }
  
  ${props => props.dragOver && `
    border-color: ${props.theme.colors.primary};
    background: rgba(102, 126, 234, 0.1);
  `}
`;

const UploadIcon = styled.div`
  font-size: 3rem;
  color: ${props => props.theme.colors.gray[400]};
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const UploadText = styled.p`
  font-size: ${props => props.theme.fontSize.lg};
  color: ${props => props.theme.colors.gray[600]};
  margin-bottom: ${props => props.theme.spacing[2]};
`;

const UploadSubtext = styled.p`
  font-size: ${props => props.theme.fontSize.sm};
  color: ${props => props.theme.colors.gray[500]};
  margin-bottom: ${props => props.theme.spacing[4]};
`;

const HiddenInput = styled.input`
  display: none;
`;

const ModeToggle = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  justify-content: center;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
`;

const ModeButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: 2px solid transparent;
  border-radius: 25px;
  background: ${props => props.active 
    ? 'linear-gradient(135deg, #667eea, #764ba2)' 
    : 'rgba(255, 255, 255, 0.1)'
  };
  color: ${props => props.active ? 'white' : '#718096'};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  @media (max-width: 480px) {
    flex: 1;
    justify-content: center;
    min-width: 120px;
  }
  
  &:hover {
    background: ${props => props.active 
      ? 'linear-gradient(135deg, #5a6fd8, #6a4190)' 
      : 'rgba(255, 255, 255, 0.15)'
    };
    transform: translateY(-2px);
  }
  
  ${props => props.active && `
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  `}
`;

const PreviewArea = styled(Card)`
  margin-bottom: ${props => props.theme.spacing[6]};
`;

const ImagePreview = styled.div`
  position: relative;
  margin-bottom: ${props => props.theme.spacing[4]};
  
  img {
    width: 100%;
    max-height: 400px;
    object-fit: cover;
    border-radius: ${props => props.theme.borderRadius.md};
  }
`;

const RemoveButton = styled.button`
  position: absolute;
  top: ${props => props.theme.spacing[2]};
  right: ${props => props.theme.spacing[2]};
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.full};
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background ${props => props.theme.transitions.fast};
  
  &:hover {
    background: rgba(0, 0, 0, 0.9);
  }
`;

const ResultsArea = styled(Card)`
  margin-top: ${props => props.theme.spacing[6]};
`;

const IngredientsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing[3]};
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: ${props => props.theme.spacing[2]};
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: ${props => props.theme.spacing[2]};
  }
`;

const IngredientCard = styled.div`
  background: ${props => props.theme.colors.gray[50]};
  border: 1px solid ${props => props.theme.colors.gray[200]};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing[3]};
  text-align: center;
  
  .ingredient-name {
    font-weight: ${props => props.theme.fontWeight.semibold};
    color: ${props => props.theme.colors.gray[800]};
    margin-bottom: ${props => props.theme.spacing[1]};
    text-transform: capitalize;
  }
  
  .confidence {
    font-size: ${props => props.theme.fontSize.sm};
    color: ${props => props.theme.colors.gray[600]};
  }
`;

const ScanPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [scanMode, setScanMode] = useState('upload'); // 'upload' or 'live'

  const handleFileSelect = (file) => {
    const validation = validateImageFile(file);
    
    if (!validation.isValid) {
      validation.errors.forEach(error => toast.error(error));
      return;
    }
    
    setSelectedFile(file);
    setScanResults(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleScan = async () => {
    if (!selectedFile) {
      toast.error('Please select an image first');
      return;
    }

    setIsScanning(true);
    
    try {
      const results = await scanAPI.uploadImage(selectedFile);
      setScanResults(results);
      toast.success(`Found ${results.detected_ingredients.length} ingredients!`);
    } catch (error) {
      console.error('Scan error:', error);
      toast.error('Scan failed. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setScanResults(null);
  };

  const handleModeSwitch = (mode) => {
    setScanMode(mode);
    // Clear any existing results when switching modes
    setScanResults(null);
    setSelectedFile(null);
  };

  const getFilePreview = () => {
    if (selectedFile) {
      return URL.createObjectURL(selectedFile);
    }
    return null;
  };

  return (
    <ScanWrapper>
      <Title>🔍 Scan Your Fridge</Title>
      <Subtitle>
        Choose between uploading an image or using live camera feed to detect ingredients
      </Subtitle>

      <ModeToggle>
        <ModeButton 
          active={scanMode === 'upload'} 
          onClick={() => handleModeSwitch('upload')}
        >
          <FiUpload /> Upload Image
        </ModeButton>
        <ModeButton 
          active={scanMode === 'live'} 
          onClick={() => handleModeSwitch('live')}
        >
          <FiVideo /> Live Camera
        </ModeButton>
      </ModeToggle>

      {scanMode === 'live' ? (
        <LiveCameraScanner />
      ) : (
        <>
          {!selectedFile ? (
        <UploadArea
          dragOver={dragOver}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById('fileInput').click()}
        >
          <UploadIcon>
            <FiCamera />
          </UploadIcon>
          <UploadText>Drop your image here or click to browse</UploadText>
          <UploadSubtext>
            Supports JPEG, PNG, WebP • Max file size: 10MB
          </UploadSubtext>
          <Button variant="primary">
            <FiUpload style={{ marginRight: '0.5rem' }} />
            Choose Image
          </Button>
          <HiddenInput
            id="fileInput"
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
          />
        </UploadArea>
      ) : (
        <PreviewArea>
          <h3 style={{ marginBottom: '1rem' }}>Selected Image</h3>
          <ImagePreview>
            <img src={getFilePreview()} alt="Preview" />
            <RemoveButton onClick={removeFile} title="Remove image">
              <FiX />
            </RemoveButton>
          </ImagePreview>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleScan}
            disabled={isScanning}
          >
            {isScanning ? 'Scanning...' : '🤖 Scan for Ingredients'}
          </Button>
        </PreviewArea>
      )}

      {scanResults && (
        <ResultsArea>
          <h3 style={{ marginBottom: '1rem' }}>
            🎯 Detected Ingredients ({scanResults.detected_ingredients.length})
          </h3>
          
          {scanResults.detected_ingredients.length > 0 ? (
            <>
              <IngredientsList>
                {scanResults.detected_ingredients.map((ingredient, index) => (
                  <IngredientCard key={index}>
                    <div className="ingredient-name">{ingredient.name}</div>
                    <div className="confidence">
                      {(ingredient.confidence * 100).toFixed(1)}% confidence
                    </div>
                  </IngredientCard>
                ))}
              </IngredientsList>
              
              <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <Button
                  variant="primary"
                  onClick={() => window.location.href = '/recipes?scan=true'}
                >
                  Find Recipes with These Ingredients
                </Button>
              </div>
            </>
          ) : (
            <p style={{ textAlign: 'center', color: '#718096' }}>
              No ingredients detected. Try taking a clearer photo or adjusting the lighting.
            </p>
          )}
        </ResultsArea>
      )}
        </>
      )}
    </ScanWrapper>
  );
};

export default ScanPage;