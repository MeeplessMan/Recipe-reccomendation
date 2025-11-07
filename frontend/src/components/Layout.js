/**
 * Layout Component
 * Main layout wrapper with navigation and content area
 */
import React from 'react';
import styled from 'styled-components';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import { Container } from '../styles/GlobalStyle';

const LayoutWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${props => props.theme.colors.gray[50]};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    /* Ensure proper height calculation on mobile with bottom nav */
    min-height: 100vh;
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }
`;

const Header = styled.header`
  background: white;
  box-shadow: ${props => props.theme.shadows.sm};
  position: sticky;
  top: 0;
  z-index: 100;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    display: none;
  }
`;

const MainContent = styled.main`
  flex: 1;
  padding: ${props => props.theme.spacing[6]} 0;
  
  @media (max-width: 768px) {
    padding: ${props => props.theme.spacing[4]} 0;
    padding-bottom: 8rem; /* Increased space for bottom navigation */
  }
  
  @media (max-width: 480px) {
    padding: ${props => props.theme.spacing[3]} 0;
    padding-bottom: 9rem; /* Even more space for bottom navigation on small screens */
  }
`;

const MobileNavWrapper = styled.div`
  position: relative;
  z-index: 200;
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const Layout = () => {
  const location = useLocation();
  
  // Hide layout on auth pages
  const authPages = ['/login', '/register'];
  const isAuthPage = authPages.includes(location.pathname);
  
  if (isAuthPage) {
    return <Outlet />;
  }
  
  return (
    <LayoutWrapper>
      {/* Desktop Navigation */}
      <Header>
        <Container>
          <Navbar />
        </Container>
      </Header>
      
      {/* Main Content */}
      <MainContent>
        <Container>
          <Outlet />
        </Container>
      </MainContent>
      
      {/* Mobile Bottom Navigation */}
      <MobileNavWrapper>
        <BottomNav />
      </MobileNavWrapper>
    </LayoutWrapper>
  );
};

export default Layout;