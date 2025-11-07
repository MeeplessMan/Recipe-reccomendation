import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiLock, FiEye, FiEyeOff, FiCheck, FiAlertTriangle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import axios from 'axios';

// Create a separate axios instance without interceptors for password reset
const resetAxios = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const Card = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
  text-align: center;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Icon = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #718096;
  font-size: 1rem;
  line-height: 1.6;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 2rem;
`;

const InputGroup = styled.div`
  position: relative;
  text-align: left;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.5rem;
`;

const InputContainer = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  padding-right: 3rem;
  border: 2px solid ${props => props.error ? '#e53e3e' : '#e2e8f0'};
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.error ? '#e53e3e' : '#667eea'};
    box-shadow: 0 0 0 3px ${props => props.error ? 'rgba(229, 62, 62, 0.1)' : 'rgba(102, 126, 234, 0.1)'};
  }
  
  &::placeholder {
    color: #a0aec0;
  }
`;

const ToggleButton = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: none;
  color: #a0aec0;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  
  &:hover {
    color: #718096;
  }
`;

const ErrorText = styled.span`
  display: block;
  font-size: 0.75rem;
  color: #e53e3e;
  margin-top: 0.5rem;
  text-align: left;
`;

const PasswordRequirements = styled.div`
  background: #f7fafc;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 0.5rem;
  text-align: left;
`;

const RequirementItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: ${props => props.met ? '#38a169' : '#a0aec0'};
  margin-bottom: 0.25rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const Button = styled.button`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingSpinner = styled.div`
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const LinkText = styled.button`
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  font-size: 0.875rem;
  margin-top: 1rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ErrorMessage = styled.div`
  background: #fed7d7;
  color: #c53030;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PasswordResetConfirm = () => {
  console.log('PasswordResetConfirm component mounted');
  console.log('Current URL:', window.location.href);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [accessToken, setAccessToken] = useState('');
  const [tokenError, setTokenError] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);

  // Debug component lifecycle
  useEffect(() => {
    console.log('PasswordResetConfirm mounted successfully');
    console.log('Initial state - loading:', initialLoading, 'tokenError:', tokenError, 'accessToken:', !!accessToken);
    
    // Log any navigation attempts using window.history instead of global history
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    
    window.history.pushState = function(...args) {
      console.log('History push state called:', args);
      console.trace('Push state stack trace:');
      return originalPushState.apply(this, args);
    };
    
    window.history.replaceState = function(...args) {
      console.log('History replace state called:', args);
      console.trace('Replace state stack trace:');
      return originalReplaceState.apply(this, args);
    };
    
    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      console.log('Component cleanup completed');
    };
  }, []);

  useEffect(() => {
    console.log('Token extraction useEffect running');
    
    const extractToken = () => {
      try {
        // Get all possible token sources - be very careful not to trigger any redirects
        const currentUrl = new URL(window.location.href);
        const searchParams = currentUrl.searchParams;
        const hashParams = new URLSearchParams(currentUrl.hash.substring(1));
        
        // Try multiple token parameter names
        const token = searchParams.get('access_token') || 
                      searchParams.get('token') ||
                      hashParams.get('access_token') ||
                      hashParams.get('token') ||
                      hashParams.get('access-token');
        
        console.log('=== TOKEN EXTRACTION DEBUG ===');
        console.log('Full URL:', window.location.href);
        console.log('Search part:', window.location.search);
        console.log('Hash part:', window.location.hash);
        console.log('Extracted token (first 20 chars):', token ? token.substring(0, 20) + '...' : 'NONE');
        console.log('=== END TOKEN DEBUG ===');
        
        return token;
      } catch (error) {
        console.error('Error extracting token:', error);
        return null;
      }
    };

    // Initial token extraction - do this synchronously to avoid any race conditions
    const token = extractToken();
    
    if (token) {
      console.log('Token found immediately, setting state');
      setAccessToken(token);
      setTokenError('');
      setInitialLoading(false);
    } else {
      console.log('No token found, will wait and retry');
      
      // Set a longer timeout to allow for any redirects or hash changes
      const timeoutId = setTimeout(() => {
        console.log('Timeout reached, checking for token again');
        const retryToken = extractToken();
        
        if (retryToken) {
          console.log('Token found on retry');
          setAccessToken(retryToken);
          setTokenError('');
        } else {
          console.log('No token found after waiting');
          setTokenError('Invalid or missing reset token. Please request a new password reset.');
        }
        setInitialLoading(false);
      }, 3000);
      
      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, []); // Remove dependencies to prevent re-running

  const validatePassword = (password) => {
    const requirements = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    return {
      requirements,
      isValid: Object.values(requirements).every(Boolean)
    };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!accessToken) {
      toast.error('Invalid reset token');
      return;
    }
    
    const newErrors = {};
    
    // Validate password
    const { isValid: isPasswordValid } = validatePassword(formData.password);
    if (!isPasswordValid) {
      newErrors.password = 'Password does not meet requirements';
    }
    
    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Attempting password reset with token:', accessToken.substring(0, 20) + '...');
      
      // Use separate axios instance to avoid auth interceptors
      const response = await resetAxios.post('/api/auth/confirm-password-reset', {
        access_token: accessToken,
        password: formData.password
      });
      
      console.log('Password reset successful');
      toast.success('Password updated successfully! Please log in with your new password.');
      
      // Redirect to login page after successful reset
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error) {
      console.error('Password reset error:', error);
      
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordValidation = validatePassword(formData.password);

  console.log('=== RENDER STATE ===');
  console.log('initialLoading:', initialLoading);
  console.log('tokenError:', tokenError);
  console.log('accessToken exists:', !!accessToken);
  console.log('==================');

  // Show loading while processing token
  if (initialLoading) {
    return (
      <Container>
        <Card
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Header>
            <Icon>
              <FiLock />
            </Icon>
            <Title>Processing Reset Link...</Title>
            <Subtitle>Please wait while we validate your password reset token.</Subtitle>
          </Header>
          
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <LoadingSpinner />
          </div>
        </Card>
      </Container>
    );
  }

  if (tokenError) {
    return (
      <Container>
        <Card
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Header>
            <Icon>
              <FiAlertTriangle />
            </Icon>
            <Title>Invalid Reset Link</Title>
            <Subtitle>
              {tokenError}
              <br /><br />
              If you need to reset your password, please go to the login page and click "Forgot Password" to request a new reset link.
            </Subtitle>
          </Header>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
            <LinkText onClick={() => navigate('/forgot-password')}>
              Request New Reset Link
            </LinkText>
            <LinkText onClick={() => navigate('/login')}>
              Return to Login
            </LinkText>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <Card
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Header>
          <Icon>
            <FiLock />
          </Icon>
          <Title>Reset Password</Title>
          <Subtitle>
            Enter your new password below. Make sure it's strong and secure.
          </Subtitle>
        </Header>

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label>New Password</Label>
            <InputContainer>
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your new password"
                error={errors.password}
                required
              />
              <ToggleButton
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </ToggleButton>
            </InputContainer>
            {errors.password && <ErrorText>{errors.password}</ErrorText>}
            
            {formData.password && (
              <PasswordRequirements>
                <RequirementItem met={passwordValidation.requirements.length}>
                  <FiCheck size={12} />
                  At least 8 characters
                </RequirementItem>
                <RequirementItem met={passwordValidation.requirements.lowercase}>
                  <FiCheck size={12} />
                  One lowercase letter
                </RequirementItem>
                <RequirementItem met={passwordValidation.requirements.uppercase}>
                  <FiCheck size={12} />
                  One uppercase letter
                </RequirementItem>
                <RequirementItem met={passwordValidation.requirements.number}>
                  <FiCheck size={12} />
                  One number
                </RequirementItem>
                <RequirementItem met={passwordValidation.requirements.special}>
                  <FiCheck size={12} />
                  One special character
                </RequirementItem>
              </PasswordRequirements>
            )}
          </InputGroup>

          <InputGroup>
            <Label>Confirm New Password</Label>
            <InputContainer>
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your new password"
                error={errors.confirmPassword}
                required
              />
              <ToggleButton
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </ToggleButton>
            </InputContainer>
            {errors.confirmPassword && <ErrorText>{errors.confirmPassword}</ErrorText>}
          </InputGroup>

          <Button
            type="submit"
            disabled={loading || !passwordValidation.isValid || formData.password !== formData.confirmPassword}
          >
            {loading && <LoadingSpinner />}
            {loading ? 'Updating Password...' : 'Update Password'}
          </Button>
        </Form>

        <LinkText onClick={() => navigate('/login')}>
          Back to Login
        </LinkText>
      </Card>
    </Container>
  );
};

export default PasswordResetConfirm;