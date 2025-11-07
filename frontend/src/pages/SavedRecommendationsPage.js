import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FiClock, FiUsers, FiHeart, FiStar, FiArrowRight, 
  FiEye, FiRefreshCw, FiCalendar, FiList, FiCoffee 
} from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useRecipeRecommendations } from '../context/RecipeRecommendationContext';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.5rem;
  
  .icon {
    color: #667eea;
  }
`;

const Subtitle = styled.p`
  color: #718096;
  font-size: 1rem;
`;

const CurrentRecommendationsSection = styled.div`
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  color: white;
`;

const CurrentHeader = styled.h2`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: white;
`;

const HistorySection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`;

const HistoryHeader = styled.h2`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #2d3748;
`;

const SessionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SessionCard = styled(motion.div)`
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #667eea;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
  }
`;

const SessionMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const SessionTime = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #718096;
  font-size: 0.875rem;
`;

const SessionStatus = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  
  ${props => props.complete ? `
    background: #c6f6d5;
    color: #22543d;
  ` : `
    background: #fed7aa;
    color: #c05621;
  `}
`;

const IngredientsPreview = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const IngredientBadge = styled.span`
  padding: 0.25rem 0.5rem;
  background: #f7fafc;
  color: #4a5568;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const RecipesPreview = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const RecipeCount = styled.span`
  color: #667eea;
  font-weight: 600;
`;

const ViewButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, #5a67d8, #6b46c1);
    transform: translateY(-1px);
  }
`;

const RecipesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

const RecipeCard = styled(motion.div)`
  background: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

const RecipeTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.5rem;
  line-height: 1.3;
`;

const RecipeMetrics = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
`;

const MetricItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const RecipeButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  color: #718096;
  
  .icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: #4a5568;
  }
  
  p {
    font-size: 1rem;
    line-height: 1.6;
    margin-bottom: 1.5rem;
  }
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, #5a67d8, #6b46c1);
    transform: translateY(-1px);
  }
`;

const SavedRecommendationsPage = () => {
  const navigate = useNavigate();
  const { 
    currentRecommendations, 
    recommendationHistory, 
    isRecommendationsAvailable 
  } = useRecipeRecommendations();
  
  const [expandedSession, setExpandedSession] = useState(null);

  const formatTime = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  const getTotalTime = (recipe) => {
    return (recipe.prep_time_mins || 0) + (recipe.cook_time_mins || 0);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const toggleSession = (sessionId) => {
    setExpandedSession(expandedSession === sessionId ? null : sessionId);
  };

  return (
    <Container>
      <Header>
        <Title>
          <FiStar className="icon" />
          Recipe Recommendations
        </Title>
        <Subtitle>
          Your personalized recipe recommendations based on scanned ingredients
        </Subtitle>
      </Header>

      {/* Current Recommendations */}
      {isRecommendationsAvailable && currentRecommendations.length > 0 && (
        <CurrentRecommendationsSection>
          <CurrentHeader>
            <FiRefreshCw />
            Latest Recommendations ({currentRecommendations.length} recipes)
          </CurrentHeader>
          
          <RecipesGrid>
            {currentRecommendations.slice(0, 4).map((recipe, index) => (
              <RecipeCard
                key={recipe.recipe_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={() => navigate(`/recipe/${recipe.recipe_id}`)}
              >
                <RecipeTitle>{recipe.title}</RecipeTitle>
                
                <RecipeMetrics>
                  <MetricItem>
                    <FiClock />
                    {formatTime(getTotalTime(recipe))}
                  </MetricItem>
                  <MetricItem>
                    <FiUsers />
                    {recipe.servings || 4}
                  </MetricItem>
                </RecipeMetrics>

                <RecipeButton onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/recipe/${recipe.recipe_id}`);
                }}>
                  <FiEye />
                  View Recipe
                </RecipeButton>
              </RecipeCard>
            ))}
          </RecipesGrid>
          
          {currentRecommendations.length > 4 && (
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <ActionButton onClick={() => setExpandedSession('current')}>
                View All {currentRecommendations.length} Recommendations
              </ActionButton>
            </div>
          )}
        </CurrentRecommendationsSection>
      )}

      {/* Recommendation History */}
      <HistorySection>
        <HistoryHeader>
          <FiCalendar />
          Recommendation History
        </HistoryHeader>

        {recommendationHistory.length > 0 ? (
          <SessionList>
            {recommendationHistory.map((session) => (
              <SessionCard
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => toggleSession(session.id)}
              >
                <SessionMeta>
                  <SessionTime>
                    <FiCalendar />
                    {formatDate(session.timestamp)}
                  </SessionTime>
                  <SessionStatus complete={session.scanComplete}>
                    {session.scanComplete ? 'Scan Complete' : 'In Progress'}
                  </SessionStatus>
                </SessionMeta>

                <IngredientsPreview>
                  {session.ingredients.slice(0, 5).map((ingredient, index) => (
                    <IngredientBadge key={index}>
                      {ingredient.name} ({Math.round(ingredient.confidence * 100)}%)
                    </IngredientBadge>
                  ))}
                  {session.ingredients.length > 5 && (
                    <IngredientBadge>+{session.ingredients.length - 5} more</IngredientBadge>
                  )}
                </IngredientsPreview>

                <RecipesPreview>
                  <RecipeCount>
                    {session.recipes.length} recipe{session.recipes.length !== 1 ? 's' : ''} found
                  </RecipeCount>
                  <ViewButton onClick={(e) => {
                    e.stopPropagation();
                    toggleSession(session.id);
                  }}>
                    {expandedSession === session.id ? 'Hide' : 'View'} Recipes
                    <FiArrowRight />
                  </ViewButton>
                </RecipesPreview>

                {expandedSession === session.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <RecipesGrid>
                      {session.recipes.map((recipe, index) => (
                        <div
                          key={recipe.recipe_id}
                          style={{
                            background: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '1rem',
                            cursor: 'pointer'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/recipe/${recipe.recipe_id}`);
                          }}
                        >
                          <h4 style={{ color: '#2d3748', marginBottom: '0.5rem' }}>
                            {recipe.title}
                          </h4>
                          <div style={{ 
                            display: 'flex', 
                            gap: '1rem', 
                            fontSize: '0.875rem', 
                            color: '#718096',
                            marginBottom: '0.75rem'
                          }}>
                            <span>{formatTime(getTotalTime(recipe))}</span>
                            <span>{recipe.servings || 4} servings</span>
                          </div>
                          <button
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              background: '#667eea',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/recipe/${recipe.recipe_id}`);
                            }}
                          >
                            View Recipe
                          </button>
                        </div>
                      ))}
                    </RecipesGrid>
                  </motion.div>
                )}
              </SessionCard>
            ))}
          </SessionList>
        ) : (
          <EmptyState>
            <FiCoffee className="icon" />
            <h3>No Recommendation History</h3>
            <p>
              Start scanning ingredients to get personalized recipe recommendations.
              Your scan history and recommended recipes will appear here.
            </p>
            <ActionButton onClick={() => navigate('/scan')}>
              <FiRefreshCw />
              Start Scanning
            </ActionButton>
          </EmptyState>
        )}
      </HistorySection>
    </Container>
  );
};

export default SavedRecommendationsPage;