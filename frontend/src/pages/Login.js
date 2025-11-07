/**
 * Login Page Component
 * User authentication login form
 */
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Label, ErrorText, Card } from '../styles/GlobalStyle';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

const LoginWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing[4]};
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.primaryLight} 100%);
`;

const LoginCard = styled(Card)`
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const Logo = styled.div`
  font-size: ${props => props.theme.fontSize['3xl']};
  margin-bottom: ${props => props.theme.spacing[2]};
`;

const Title = styled.h1`
  font-size: ${props => props.theme.fontSize['2xl']};
  font-weight: ${props => props.theme.fontWeight.bold};
  color: ${props => props.theme.colors.gray[800]};
  margin-bottom: ${props => props.theme.spacing[2]};
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.gray[600]};
  margin-bottom: ${props => props.theme.spacing[8]};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing[4]};
`;

const InputGroup = styled.div`
  text-align: left;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const InputIcon = styled.div`
  position: absolute;
  left: ${props => props.theme.spacing[3]};
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.colors.gray[400]};
  pointer-events: none;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: ${props => props.theme.spacing[3]};
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.colors.gray[400]};
  background: none;
  border: none;
  cursor: pointer;
  padding: ${props => props.theme.spacing[1]};
  
  &:hover {
    color: ${props => props.theme.colors.gray[600]};
  }
`;

const StyledInput = styled(Input)`
  padding-left: 2.5rem;
  
  ${props => props.hasToggle && `
    padding-right: 2.5rem;
  `}
`;

const ForgotLink = styled(Link)`
  color: ${props => props.theme.colors.primary};
  font-size: ${props => props.theme.fontSize.sm};
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const RegisterLink = styled.div`
  margin-top: ${props => props.theme.spacing[6]};
  padding-top: ${props => props.theme.spacing[6]};
  border-top: 1px solid ${props => props.theme.colors.gray[200]};
  font-size: ${props => props.theme.fontSize.sm};
  color: ${props => props.theme.colors.gray[600]};
  
  a {
    color: ${props => props.theme.colors.primary};
    font-weight: ${props => props.theme.fontWeight.medium};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, error } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  if (isLoading) {
    return (
      <LoginWrapper>
        <LoginCard>
          <Logo>🔍</Logo>
          <Title>Loading...</Title>
        </LoginCard>
      </LoginWrapper>
    );
  }
  
  return (
    <LoginWrapper>
      <LoginCard>
        <Logo>🔍</Logo>
        <Title>Welcome Back</Title>
        <Subtitle>Sign in to your Recipe Recommenda account</Subtitle>
        
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label htmlFor="email">Email Address</Label>
            <InputWrapper>
              <InputIcon>
                <FiMail />
              </InputIcon>
              <StyledInput
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
                autoComplete="email"
              />
            </InputWrapper>
          </InputGroup>
          
          <InputGroup>
            <Label htmlFor="password">Password</Label>
            <InputWrapper>
              <InputIcon>
                <FiLock />
              </InputIcon>
              <StyledInput
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                required
                autoComplete="current-password"
                hasToggle
              />
              <PasswordToggle
                type="button"
                onClick={togglePasswordVisibility}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </PasswordToggle>
            </InputWrapper>
          </InputGroup>
          
          {error && <ErrorText>{error}</ErrorText>}
          
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={isSubmitting || !formData.email || !formData.password}
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </Button>
          
          <ForgotLink to="/forgot-password">
            Forgot your password?
          </ForgotLink>
        </Form>
        
        <RegisterLink>
          Don't have an account?{' '}
          <Link to="/register">Sign up for free</Link>
        </RegisterLink>
      </LoginCard>
    </LoginWrapper>
  );
};

export default Login;