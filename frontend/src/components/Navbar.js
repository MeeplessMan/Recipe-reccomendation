/**
 * Navbar Component
 * Desktop navigation bar
 */
import React from 'react';
import styled from 'styled-components';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../styles/GlobalStyle';
import { FiLogOut, FiSettings, FiHeart, FiBookmark } from 'react-icons/fi';

const Nav = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing[4]} 0;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  font-size: ${props => props.theme.fontSize.xl};
  font-weight: ${props => props.theme.fontWeight.bold};
  color: ${props => props.theme.colors.primary};
  text-decoration: none;
  
  &:hover {
    color: ${props => props.theme.colors.primaryDark};
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[6]};
`;

const NavLink = styled(Link).withConfig({
  shouldForwardProp: (prop) => prop !== 'active'
})`
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[3]};
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: ${props => props.theme.fontWeight.medium};
  color: ${props => props.theme.colors.gray[600]};
  text-decoration: none;
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.gray[100]};
  }
  
  ${props => props.active && `
    color: ${props.theme.colors.primary};
    background: rgba(102, 126, 234, 0.1);
  `}
`;

const UserMenu = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[3]};
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing[2]};
  padding: ${props => props.theme.spacing[2]};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.gray[700]};
`;

const UserAvatar = styled.div`
  width: 2rem;
  height: 2rem;
  border-radius: ${props => props.theme.borderRadius.full};
  background: ${props => props.theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${props => props.theme.fontWeight.semibold};
  font-size: ${props => props.theme.fontSize.sm};
`;

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  const isActive = (path) => location.pathname === path;
  
  return (
    <Nav>
      <Logo to="/">
        🔍 Recipe Recommenda
      </Logo>
      
      <NavLinks>
        <NavLink to="/dashboard" active={isActive('/dashboard')}>
          Dashboard
        </NavLink>
        <NavLink to="/scan" active={isActive('/scan')}>
          Scan Fridge
        </NavLink>
        <NavLink to="/recipes" active={isActive('/recipes')}>
          Recipes
        </NavLink>
        <NavLink to="/favorites" active={isActive('/favorites')}>
          <FiHeart style={{ marginRight: '0.5rem' }} />
          Favorites
        </NavLink>
        <NavLink to="/saved-recommendations" active={isActive('/saved-recommendations')}>
          <FiBookmark style={{ marginRight: '0.5rem' }} />
          Saved
        </NavLink>
      </NavLinks>
      
      <UserMenu>
        {user && (
          <>
            <UserInfo>
              <UserAvatar>
                {user.username ? user.username.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </UserAvatar>
              <span>{user.username || user.email}</span>
            </UserInfo>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/profile')}
              title="Profile Settings"
            >
              <FiSettings />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              title="Logout"
            >
              <FiLogOut />
            </Button>
          </>
        )}
      </UserMenu>
    </Nav>
  );
};

export default Navbar;