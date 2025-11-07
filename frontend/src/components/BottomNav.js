/**
 * BottomNav Component
 * Mobile bottom navigation bar
 */
import React from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiCamera, FiBook, FiHeart, FiUser, FiBookmark } from 'react-icons/fi';

const NavWrapper = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  border-top: 1px solid ${props => props.theme.colors.gray[200]};
  z-index: 100;
  
  @media (min-width: ${props => props.theme.breakpoints.md + 1}px) {
    display: none;
  }
`;

const NavContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: ${props => props.theme.spacing[2]} ${props => props.theme.spacing[4]};
  padding-bottom: calc(${props => props.theme.spacing[2]} + env(safe-area-inset-bottom, 0px));
  max-width: 600px;
  margin: 0 auto;
`;

const NavItem = styled(Link).withConfig({
  shouldForwardProp: (prop) => prop !== 'active'
})`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.theme.spacing[1]};
  padding: ${props => props.theme.spacing[2]};
  border-radius: ${props => props.theme.borderRadius.md};
  text-decoration: none;
  transition: all ${props => props.theme.transitions.fast};
  min-width: 3rem;
  
  color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.gray[500]};
  
  &:hover {
    color: ${props => props.theme.colors.primary};
    background: rgba(102, 126, 234, 0.1);
  }
  
  ${props => props.active && `
    background: rgba(102, 126, 234, 0.1);
  `}
`;

const NavIcon = styled.div`
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NavLabel = styled.span`
  font-size: ${props => props.theme.fontSize.xs};
  font-weight: ${props => props.theme.fontWeight.medium};
  text-align: center;
`;

const BottomNav = () => {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;
  
  const navItems = [
    {
      path: '/dashboard',
      icon: FiHome,
      label: 'Home'
    },
    {
      path: '/scan',
      icon: FiCamera,
      label: 'Scan'
    },
    {
      path: '/recipes',
      icon: FiBook,
      label: 'Recipes'
    },
    {
      path: '/saved-recommendations',
      icon: FiBookmark,
      label: 'Saved'
    },
    {
      path: '/favorites',
      icon: FiHeart,
      label: 'Favorites'
    },
    {
      path: '/profile',
      icon: FiUser,
      label: 'Profile'
    }
  ];
  
  return (
    <NavWrapper>
      <NavContainer>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavItem
              key={item.path}
              to={item.path}
              active={isActive(item.path)}
            >
              <NavIcon>
                <Icon />
              </NavIcon>
              <NavLabel>{item.label}</NavLabel>
            </NavItem>
          );
        })}
      </NavContainer>
    </NavWrapper>
  );
};

export default BottomNav;