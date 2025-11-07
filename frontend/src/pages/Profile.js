import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUser, FiShield, FiMail, FiKey, FiTrash2, 
  FiLogOut, FiSave, FiEdit3, FiX, FiPlus, FiAlertTriangle,
  FiEye, FiEyeOff
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { authAPI, recipeAPI } from '../services/api';

const ProfileContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
  background: #f7fafc;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 1rem;
  
  .icon {
    color: #667eea;
  }
`;

const Subtitle = styled.p`
  font-size: 1.125rem;
  color: #718096;
  max-width: 600px;
  margin: 0 auto;
`;

const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const ProfileCard = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.accent || 'linear-gradient(90deg, #667eea, #764ba2)'};
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const CardIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 12px;
  background: ${props => props.color || 'linear-gradient(135deg, #667eea, #764ba2)'};
  color: white;
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  &:disabled {
    background: #f7fafc;
    color: #a0aec0;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const CheckboxGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #cbd5e0;
  }
  
  &:has(input:checked) {
    border-color: #667eea;
    background: #f0f4ff;
  }
  
  input {
    width: 1rem;
    height: 1rem;
    accent-color: #667eea;
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          &:hover { background: linear-gradient(135deg, #5a67d8, #6b46c1); }
        `;
      case 'success':
        return `
          background: linear-gradient(135deg, #48bb78, #38a169);
          color: white;
          &:hover { background: linear-gradient(135deg, #38a169, #2f855a); }
        `;
      case 'danger':
        return `
          background: linear-gradient(135deg, #e53e3e, #c53030);
          color: white;
          &:hover { background: linear-gradient(135deg, #c53030, #9c2626); }
        `;
      case 'warning':
        return `
          background: linear-gradient(135deg, #ed8936, #dd6b20);
          color: white;
          &:hover { background: linear-gradient(135deg, #dd6b20, #c05621); }
        `;
      case 'outline':
        return `
          background: transparent;
          color: #4a5568;
          border: 2px solid #e2e8f0;
          &:hover { background: #f7fafc; border-color: #cbd5e0; }
        `;
      default:
        return `
          background: #f7fafc;
          color: #4a5568;
          &:hover { background: #edf2f7; }
        `;
    }
  }}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const AllergyList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const AllergyChip = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #fed7d7;
  color: #c53030;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
`;

const RemoveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border: none;
  border-radius: 50%;
  background: #c53030;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #9c2626;
    transform: scale(1.1);
  }
`;

const PasswordInput = styled.div`
  position: relative;
`;

const TogglePasswordButton = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  color: #a0aec0;
  cursor: pointer;
  padding: 0.25rem;
  
  &:hover {
    color: #718096;
  }
`;

const Modal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
`;

const ModalContent = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 50%;
  background: #f7fafc;
  color: #a0aec0;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #edf2f7;
    color: #718096;
  }
`;

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuth();
  
  // Profile state
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    skill_level: 'beginner',
    dietary_restrictions: []
  });
  
  // Editing states
  const [editingProfile, setEditingProfile] = useState(false);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form data
  const [allergies, setAllergies] = useState([]);
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [newAllergy, setNewAllergy] = useState({
    ingredient_id: '',
    severity: 'mild',
    symptoms: ''
  });
  
  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  
  const dietaryOptions = [
    'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 
    'nut-free', 'low-carb', 'keto', 'paleo'
  ];

  useEffect(() => {
    console.log('Profile component mounted, user from context:', user);
    
    // If user is available from AuthContext, use that immediately
    if (user && user.email) {
      console.log('Using user data from AuthContext');
      setProfileData({
        username: user.username || '',
        email: user.email || '',
        skill_level: user.skill_level || 'beginner',
        dietary_restrictions: user.dietary_restrictions || []
      });
      setLoading(false);
      
      // Load additional data in background after component is ready
      setTimeout(() => {
        console.log('Loading allergies and ingredients in background...');
        loadAllergies().catch(console.error);
        loadIngredients().catch(console.error);
      }, 1000);
    } else {
      console.log('No user in context, will try to load from API');
      // Only try API if no user context available
      loadProfileData();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadProfileData = async () => {
    try {
      console.log('Loading profile data...');
      
      // If user is already available from AuthContext, use that data
      if (user && user.email) {
        console.log('Using existing user data from context:', user);
        setProfileData({
          username: user.username || '',
          email: user.email || '',
          skill_level: user.skill_level || 'beginner',
          dietary_restrictions: user.dietary_restrictions || []
        });
        setLoading(false);
        return;
      }
      
      // Only fetch if user data is not available
      const response = await authAPI.getCurrentUser();
      console.log('Profile response:', response);
      
      if (response.user) {
        setProfileData({
          username: response.user.username || '',
          email: response.user.email || '',
          skill_level: response.user.skill_level || 'beginner',
          dietary_restrictions: response.user.dietary_restrictions || []
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      // Don't show error toast immediately, might be network issue
      console.log('Will use existing user data if available');
      
      // Use existing user data as fallback
      if (user && user.email) {
        setProfileData({
          username: user.username || '',
          email: user.email || '',
          skill_level: user.skill_level || 'beginner',
          dietary_restrictions: user.dietary_restrictions || []
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAllergies = async () => {
    try {
      console.log('Loading allergies...');
      const response = await authAPI.getAllergies();
      console.log('Allergies response:', response);
      setAllergies(response.allergies || []);
    } catch (error) {
      console.error('Error loading allergies:', error);
      // Silently fail for allergies - not critical for page load
      setAllergies([]);
    }
  };

  const loadIngredients = async () => {
    try {
      console.log('Loading ingredients...');
      const response = await recipeAPI.getAllIngredients();
      console.log('Ingredients response:', response);
      setAvailableIngredients(response.ingredients || []);
    } catch (error) {
      console.error('Error loading ingredients:', error);
      // Silently fail for ingredients - not critical for page load
      setAvailableIngredients([]);
    }
  };

  const handleProfileUpdate = async () => {
    setSaving(true);
    try {
      const updateData = {
        username: profileData.username,
        skill_level: profileData.skill_level,
        dietary_restrictions: profileData.dietary_restrictions
      };
      
      // Use the updateProfile method from AuthContext instead of direct API call
      const result = await updateProfile(updateData);
      
      if (result.success) {
        setEditingProfile(false);
        // The AuthContext already updates the user state and shows success message
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAllergy = async () => {
    if (!newAllergy.ingredient_id) {
      toast.error('Please select an ingredient');
      return;
    }
    
    try {
      await authAPI.addAllergy(newAllergy);
      setNewAllergy({ ingredient_id: '', severity: 'mild', symptoms: '' });
      loadAllergies().catch(console.error);
      toast.success('Allergy added successfully!');
    } catch (error) {
      console.error('Error adding allergy:', error);
      toast.error('Failed to add allergy');
    }
  };

  const handleRemoveAllergy = async (allergyId) => {
    try {
      await authAPI.removeAllergy(allergyId);
      loadAllergies().catch(console.error);
      toast.success('Allergy removed successfully!');
    } catch (error) {
      console.error('Error removing allergy:', error);
      toast.error('Failed to remove allergy');
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      toast.error('Please enter your email');
      return;
    }
    
    try {
      await authAPI.resetPassword(resetEmail);
      setShowPasswordResetModal(false);
      setResetEmail('');
      toast.success('Password reset email sent!');
    } catch (error) {
      console.error('Error sending reset email:', error);
      toast.error('Failed to send reset email');
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error('Please enter your password to confirm');
      return;
    }
    
    try {
      await authAPI.deleteAccount(deletePassword);
      toast.success('Account deleted successfully');
      logout();
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account. Please check your password.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  if (loading) {
    return (
      <ProfileContainer>
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ 
            width: '3rem', 
            height: '3rem', 
            border: '3px solid #e2e8f0', 
            borderTop: '3px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p>Loading profile...</p>
        </div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </ProfileContainer>
    );
  }

  console.log('Profile render - loading:', loading, 'user:', user, 'profileData:', profileData);

  // Early return if no user is available (after all hooks)
  if (!user) {
    console.log('No user available in Profile component');
    return (
      <ProfileContainer>
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <p>Please log in to view your profile.</p>
        </div>
      </ProfileContainer>
    );
  }

  return (
    <ProfileContainer>
      <Header>
        <Title>
          <FiUser className="icon" />
          Profile Settings
        </Title>
        <Subtitle>
          Manage your account, preferences, and personal information
        </Subtitle>
      </Header>

      <ProfileGrid>
        {/* Profile Information */}
        <ProfileCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <CardHeader>
            <CardIcon>
              <FiUser />
            </CardIcon>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>

          <FormGroup>
            <Label>Email Address</Label>
            <Input
              type="email"
              value={profileData.email}
              disabled
              placeholder="Email cannot be changed"
            />
          </FormGroup>

          <FormGroup>
            <Label>Username</Label>
            <Input
              type="text"
              value={profileData.username}
              onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
              disabled={!editingProfile}
              placeholder="Enter your username"
            />
          </FormGroup>

          <FormGroup>
            <Label>Cooking Skill Level</Label>
            <Select
              value={profileData.skill_level}
              onChange={(e) => setProfileData(prev => ({ ...prev, skill_level: e.target.value }))}
              disabled={!editingProfile}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Dietary Restrictions</Label>
            <CheckboxGroup>
              {dietaryOptions.map(option => (
                <CheckboxItem key={option}>
                  <input
                    type="checkbox"
                    checked={profileData.dietary_restrictions.includes(option)}
                    disabled={!editingProfile}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setProfileData(prev => ({
                          ...prev,
                          dietary_restrictions: [...prev.dietary_restrictions, option]
                        }));
                      } else {
                        setProfileData(prev => ({
                          ...prev,
                          dietary_restrictions: prev.dietary_restrictions.filter(d => d !== option)
                        }));
                      }
                    }}
                  />
                  <span style={{ textTransform: 'capitalize' }}>{option}</span>
                </CheckboxItem>
              ))}
            </CheckboxGroup>
          </FormGroup>

          <ButtonGroup>
            {editingProfile ? (
              <>
                <Button variant="success" onClick={handleProfileUpdate} disabled={saving}>
                  <FiSave />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="outline" onClick={() => setEditingProfile(false)}>
                  <FiX />
                  Cancel
                </Button>
              </>
            ) : (
              <Button variant="primary" onClick={() => setEditingProfile(true)}>
                <FiEdit3 />
                Edit Profile
              </Button>
            )}
          </ButtonGroup>
        </ProfileCard>

        {/* Allergies Management */}
        <ProfileCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          accent="linear-gradient(90deg, #e53e3e, #c53030)"
        >
          <CardHeader>
            <CardIcon color="linear-gradient(135deg, #e53e3e, #c53030)">
              <FiAlertTriangle />
            </CardIcon>
            <CardTitle>Allergies & Restrictions</CardTitle>
          </CardHeader>

          {allergies.length > 0 && (
            <>
              <Label>Current Allergies</Label>
              <AllergyList>
                {allergies.map(allergy => (
                  <AllergyChip key={allergy.allergy_id}>
                    <span>{allergy.ingredients?.name} ({allergy.severity})</span>
                    <RemoveButton onClick={() => handleRemoveAllergy(allergy.allergy_id)}>
                      <FiX size={12} />
                    </RemoveButton>
                  </AllergyChip>
                ))}
              </AllergyList>
            </>
          )}

          <FormGroup style={{ marginTop: '1.5rem' }}>
            <Label>Add New Allergy</Label>
            <Select
              value={newAllergy.ingredient_id}
              onChange={(e) => setNewAllergy(prev => ({ ...prev, ingredient_id: e.target.value }))}
            >
              <option value="">Select an ingredient</option>
              {availableIngredients.map(ingredient => (
                <option key={ingredient.ingredient_id} value={ingredient.ingredient_id}>
                  {ingredient.name}
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Severity</Label>
            <Select
              value={newAllergy.severity}
              onChange={(e) => setNewAllergy(prev => ({ ...prev, severity: e.target.value }))}
            >
              <option value="mild">Mild</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Symptoms (Optional)</Label>
            <TextArea
              value={newAllergy.symptoms}
              onChange={(e) => setNewAllergy(prev => ({ ...prev, symptoms: e.target.value }))}
              placeholder="Describe your symptoms..."
            />
          </FormGroup>

          <Button variant="warning" onClick={handleAddAllergy} style={{ width: '100%' }}>
            <FiPlus />
            Add Allergy
          </Button>
        </ProfileCard>

        {/* Security Settings */}
        <ProfileCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          accent="linear-gradient(90deg, #48bb78, #38a169)"
        >
          <CardHeader>
            <CardIcon color="linear-gradient(135deg, #48bb78, #38a169)">
              <FiShield />
            </CardIcon>
            <CardTitle>Security Settings</CardTitle>
          </CardHeader>

          <FormGroup>
            <Label>Password Management</Label>
            <Button 
              variant="outline" 
              onClick={() => setShowPasswordResetModal(true)}
              style={{ width: '100%', marginBottom: '1rem' }}
            >
              <FiKey />
              Send Password Reset Email
            </Button>
          </FormGroup>

          <FormGroup>
            <Label>Account Actions</Label>
            <Button variant="success" onClick={handleLogout} style={{ width: '100%', marginBottom: '1rem' }}>
              <FiLogOut />
              Logout
            </Button>
            <Button 
              variant="danger" 
              onClick={() => setShowDeleteModal(true)}
              style={{ width: '100%' }}
            >
              <FiTrash2 />
              Delete Account
            </Button>
          </FormGroup>
        </ProfileCard>
      </ProfileGrid>

      {/* Password Reset Modal */}
      <AnimatePresence>
        {showPasswordResetModal && (
          <Modal
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPasswordResetModal(false)}
          >
            <ModalContent
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalHeader>
                <ModalTitle>Reset Password</ModalTitle>
                <CloseButton onClick={() => setShowPasswordResetModal(false)}>
                  <FiX />
                </CloseButton>
              </ModalHeader>

              <FormGroup>
                <Label>Email Address</Label>
                <Input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter your email address"
                />
              </FormGroup>

              <ButtonGroup>
                <Button variant="primary" onClick={handlePasswordReset}>
                  <FiMail />
                  Send Reset Email
                </Button>
                <Button variant="outline" onClick={() => setShowPasswordResetModal(false)}>
                  Cancel
                </Button>
              </ButtonGroup>
            </ModalContent>
          </Modal>
        )}
      </AnimatePresence>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <Modal
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteModal(false)}
          >
            <ModalContent
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalHeader>
                <ModalTitle>Delete Account</ModalTitle>
                <CloseButton onClick={() => setShowDeleteModal(false)}>
                  <FiX />
                </CloseButton>
              </ModalHeader>

              <div style={{ marginBottom: '1.5rem', color: '#e53e3e' }}>
                <FiAlertTriangle size={48} style={{ display: 'block', margin: '0 auto 1rem' }} />
                <p style={{ textAlign: 'center', fontWeight: '600' }}>
                  This action cannot be undone. This will permanently delete your account and all associated data.
                </p>
              </div>

              <FormGroup>
                <Label>Confirm Password</Label>
                <PasswordInput>
                  <Input
                    type={showDeletePassword ? 'text' : 'password'}
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter your password to confirm"
                  />
                  <TogglePasswordButton
                    type="button"
                    onClick={() => setShowDeletePassword(!showDeletePassword)}
                  >
                    {showDeletePassword ? <FiEyeOff /> : <FiEye />}
                  </TogglePasswordButton>
                </PasswordInput>
              </FormGroup>

              <ButtonGroup>
                <Button variant="danger" onClick={handleDeleteAccount}>
                  <FiTrash2 />
                  Delete Account Permanently
                </Button>
                <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </Button>
              </ButtonGroup>
            </ModalContent>
          </Modal>
        )}
      </AnimatePresence>
    </ProfileContainer>
  );
};

export default Profile;