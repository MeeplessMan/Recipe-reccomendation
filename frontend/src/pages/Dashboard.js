/**
 * Dashboard Page Component
 * Main dashboard with overview and quick actions
 */
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { scanAPI, recipeAPI } from '../services/api';
import { Card, Button } from '../styles/GlobalStyle';
import { FiCamera, FiBook, FiUser, FiHeart } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${props => props.theme.spacing[6]};
  margin-bottom: ${props => props.theme.spacing[8]};
`;

const WelcomeCard = styled(Card)`
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.primaryLight});
  color: white;
  text-align: center;
  
  h1 {
    font-size: ${props => props.theme.fontSize['2xl']};
    margin-bottom: ${props => props.theme.spacing[2]};
  }
  
  p {
    opacity: 0.9;
    font-size: ${props => props.theme.fontSize.lg};
  }
`;

const StatsCard = styled(Card)`
  text-align: center;
  
  .stat-number {
    font-size: ${props => props.theme.fontSize['3xl']};
    font-weight: ${props => props.theme.fontWeight.bold};
    color: ${props => props.theme.colors.primary};
    margin-bottom: ${props => props.theme.spacing[1]};
  }
  
  .stat-label {
    color: ${props => props.theme.colors.gray[600]};
    font-size: ${props => props.theme.fontSize.sm};
  }
`;

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing[4]};
  margin-bottom: ${props => props.theme.spacing[8]};
`;

const ActionCard = styled(Card)`
  text-align: center;
  cursor: pointer;
  transition: transform ${props => props.theme.transitions.fast};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
  
  .action-icon {
    font-size: 2rem;
    color: ${props => props.theme.colors.primary};
    margin-bottom: ${props => props.theme.spacing[3]};
  }
  
  .action-title {
    font-size: ${props => props.theme.fontSize.lg};
    font-weight: ${props => props.theme.fontWeight.semibold};
    margin-bottom: ${props => props.theme.spacing[2]};
  }
  
  .action-description {
    color: ${props => props.theme.colors.gray[600]};
    font-size: ${props => props.theme.fontSize.sm};
  }
`;

const RecentSection = styled.div`
  margin-bottom: ${props => props.theme.spacing[8]};
  
  h2 {
    font-size: ${props => props.theme.fontSize.xl};
    font-weight: ${props => props.theme.fontWeight.semibold};
    margin-bottom: ${props => props.theme.spacing[4]};
    color: ${props => props.theme.colors.gray[800]};
  }
`;

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalScans: 0,
    totalRecipes: 0,
    totalFavorites: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch user statistics
        const [scanHistory, favorites] = await Promise.all([
          scanAPI.getHistory(1, 100).catch(() => ({ scans: [] })),
          recipeAPI.getFavorites().catch(() => ({ favorites: [] }))
        ]);
        
        setStats({
          totalScans: scanHistory.scans?.length || 0,
          totalRecipes: 25, // Placeholder - would come from backend
          totalFavorites: favorites.favorites?.length || 0
        });
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const quickActions = [
    {
      icon: FiCamera,
      title: 'Scan Fridge',
      description: 'Take a photo to detect ingredients',
      link: '/scan'
    },
    {
      icon: FiBook,
      title: 'Browse Recipes',
      description: 'Discover new recipes to try',
      link: '/recipes'
    },
    {
      icon: FiHeart,
      title: 'My Favorites',
      description: 'View your saved recipes',
      link: '/favorites'
    },
    {
      icon: FiUser,
      title: 'Profile Settings',
      description: 'Update your preferences',
      link: '/profile'
    }
  ];

  const displayName = user?.username || user?.email?.split('@')[0] || 'User';

  return (
    <div>
      <DashboardGrid>
        <WelcomeCard>
          <h1>Welcome back, {displayName}! 👋</h1>
          <p>Ready to discover some delicious recipes?</p>
        </WelcomeCard>
      </DashboardGrid>

      <DashboardGrid>
        <StatsCard>
          <div className="stat-number">{stats.totalScans}</div>
          <div className="stat-label">Fridge Scans</div>
        </StatsCard>
        <StatsCard>
          <div className="stat-number">{stats.totalRecipes}</div>
          <div className="stat-label">Available Recipes</div>
        </StatsCard>
        <StatsCard>
          <div className="stat-number">{stats.totalFavorites}</div>
          <div className="stat-label">Favorite Recipes</div>
        </StatsCard>
      </DashboardGrid>

      <RecentSection>
        <h2>Quick Actions</h2>
        <QuickActions>
          {quickActions.map((action) => (
            <Link key={action.title} to={action.link}>
              <ActionCard>
                <div className="action-icon">
                  <action.icon />
                </div>
                <div className="action-title">{action.title}</div>
                <div className="action-description">{action.description}</div>
              </ActionCard>
            </Link>
          ))}
        </QuickActions>
      </RecentSection>

      <RecentSection>
        <h2>Getting Started</h2>
        <Card>
          <h3 style={{ marginBottom: '1rem', color: '#4a5568' }}>
            How to use Recipe Recommenda:
          </h3>
          <ol style={{ paddingLeft: '1.5rem', lineHeight: '1.8', color: '#718096' }}>
            <li>📸 <strong>Scan your fridge:</strong> Take a photo of your ingredients</li>
            <li>🤖 <strong>AI Detection:</strong> Our AI will identify what you have</li>
            <li>🍳 <strong>Get Recipes:</strong> Receive personalized recipe suggestions</li>
            <li>❤️ <strong>Save Favorites:</strong> Keep track of recipes you love</li>
            <li>👤 <strong>Customize Profile:</strong> Set dietary preferences and restrictions</li>
          </ol>
          <div style={{ marginTop: '1.5rem' }}>
            <Button as={Link} to="/scan" variant="primary">
              Start Your First Scan
            </Button>
          </div>
        </Card>
      </RecentSection>
    </div>
  );
};

export default Dashboard;