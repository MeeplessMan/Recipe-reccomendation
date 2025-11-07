/**
 * Register Page Component
 * User registration form
 */
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Label, ErrorText, Card } from '../styles/GlobalStyle';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';

const RegisterWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing[4]};
  background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.primaryLight} 100%);
`;

const RegisterCard = styled(Card)`
  width: 100%;
  max-width: 450px;
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
  margin-bottom: ${props => props.theme.spacing[6]};
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

const SelectGroup = styled.div`
  text-align: left;
`;

const Select = styled.select`
  width: 100%;
  padding: ${props => props.theme.spacing[3]} ${props => props.theme.spacing[4]};
  border: 1px solid ${props => props.theme.colors.gray[300]};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.fontSize.sm};
  background: white;
  color: ${props => props.theme.colors.gray[700]};
  transition: border-color ${props => props.theme.transitions.fast};
  
  &:focus {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    outline: none;
  }
`;

const CheckboxGroup = styled.div`
  text-align: left;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: flex-start;
  gap: ${props => props.theme.spacing[2]};
  font-size: ${props => props.theme.fontSize.sm};
  color: ${props => props.theme.colors.gray[600]};
  cursor: pointer;
`;

const Checkbox = styled.input`
  margin-top: 0.125rem;
  accent-color: ${props => props.theme.colors.primary};
`;

const LoginLink = styled.div`
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

const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, isLoading, error } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    skill_level: 'beginner',
    dietary_restrictions: []
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'dietary_restrictions') {
        setFormData(prev => ({
          ...prev,
          dietary_restrictions: checked 
            ? [...prev.dietary_restrictions, value]
            : prev.dietary_restrictions.filter(item => item !== value)
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    // Username validation
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await register({
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        skill_level: formData.skill_level,
        dietary_restrictions: formData.dietary_restrictions
      });
      
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };
  
  if (isLoading) {
    return (
      <RegisterWrapper>
        <RegisterCard>
          <Logo>🔍</Logo>
          <Title>Loading...</Title>
        </RegisterCard>
      </RegisterWrapper>
    );
  }
  
  const dietaryOptions = [
    'vegetarian',
    'vegan',
    'gluten-free',
    'dairy-free',
    'nut-free',
    'low-sodium'
  ];
  
  return (
    <RegisterWrapper>
      <RegisterCard>
        <Logo>🔍</Logo>
        <Title>Create Account</Title>
        <Subtitle>Join Recipe Recommenda and start discovering recipes</Subtitle>
        
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label htmlFor="username">Username</Label>
            <InputWrapper>
              <InputIcon>
                <FiUser />
              </InputIcon>
              <StyledInput
                id="username"
                name="username"
                type="text"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleInputChange}
                error={validationErrors.username}
                required
                autoComplete="username"
              />
            </InputWrapper>
            {validationErrors.username && <ErrorText>{validationErrors.username}</ErrorText>}
          </InputGroup>
          
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
                error={validationErrors.email}
                required
                autoComplete="email"
              />
            </InputWrapper>
            {validationErrors.email && <ErrorText>{validationErrors.email}</ErrorText>}
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
                placeholder="Create a password"
                value={formData.password}
                onChange={handleInputChange}
                error={validationErrors.password}
                required
                autoComplete="new-password"
                hasToggle
              />
              <PasswordToggle
                type="button"
                onClick={() => togglePasswordVisibility('password')}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </PasswordToggle>
            </InputWrapper>
            {validationErrors.password && <ErrorText>{validationErrors.password}</ErrorText>}
          </InputGroup>
          
          <InputGroup>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <InputWrapper>
              <InputIcon>
                <FiLock />
              </InputIcon>
              <StyledInput
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                error={validationErrors.confirmPassword}
                required
                autoComplete="new-password"
                hasToggle
              />
              <PasswordToggle
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                aria-label="Toggle confirm password visibility"
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </PasswordToggle>
            </InputWrapper>
            {validationErrors.confirmPassword && <ErrorText>{validationErrors.confirmPassword}</ErrorText>}
          </InputGroup>
          
          <SelectGroup>
            <Label htmlFor="skill_level">Cooking Skill Level</Label>
            <Select
              id="skill_level"
              name="skill_level"
              value={formData.skill_level}
              onChange={handleInputChange}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </Select>
          </SelectGroup>
          
          <CheckboxGroup>
            <Label>Dietary Restrictions (optional)</Label>
            {dietaryOptions.map(option => (
              <CheckboxLabel key={option}>
                <Checkbox
                  type="checkbox"
                  name="dietary_restrictions"
                  value={option}
                  checked={formData.dietary_restrictions.includes(option)}
                  onChange={handleInputChange}
                />
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </CheckboxLabel>
            ))}
          </CheckboxGroup>
          
          {error && <ErrorText>{error}</ErrorText>}
          
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </Button>
        </Form>
        
        <LoginLink>
          Already have an account?{' '}
          <Link to="/login">Sign in here</Link>
        </LoginLink>
      </RegisterCard>
    </RegisterWrapper>
  );
};

export default Register;