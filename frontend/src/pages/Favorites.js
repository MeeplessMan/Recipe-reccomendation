import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiUsers, FiHeart, FiArrowRight, FiTrash2, FiStar } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { recipeAPI } from '../services/api';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  
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
    color: #e53e3e;
  }
`;

const Subtitle = styled.p`
  font-size: 1.125rem;
  color: #718096;
  max-width: 600px;
  margin: 0 auto;
`;

const StatsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 1.5rem 2rem;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.25);
  
  @media (max-width: 768px) {
    margin: 0 auto;
    max-width: 200px;
  }
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  opacity: 0.9;
`;

const FavoritesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const FavoriteCard = styled(motion.div)`
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea, #764ba2);
  }
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.15);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
`;

const RecipeTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
  line-height: 1.3;
  flex: 1;
  margin-right: 1rem;
`;

const FavoriteActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  border-radius: 50%;
  background: ${props => props.variant === 'remove' ? '#fed7d7' : '#e53e3e'};
  color: ${props => props.variant === 'remove' ? '#c53030' : 'white'};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.variant === 'remove' ? '#feb2b2' : '#c53030'};
    transform: scale(1.1);
  }
`;

const AddedDate = styled.div`
  font-size: 0.875rem;
  color: #a0aec0;
  margin-bottom: 1rem;
`;

const RecipeMetrics = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  color: #718096;
  
  @media (max-width: 480px) {
    flex-wrap: wrap;
    gap: 1rem;
  }
`;

const MetricItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
`;

const DifficultyBadge = styled.span`
  padding: 0.375rem 0.875rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: inline-block;
  
  ${props => {
    switch (props.difficulty) {
      case 'easy':
        return 'background: #c6f6d5; color: #22543d;';
      case 'medium':
        return 'background: #fed7aa; color: #c05621;';
      case 'hard':
        return 'background: #fed7d7; color: #c53030;';
      default:
        return 'background: #e2e8f0; color: #4a5568;';
    }
  }}
`;

const IngredientsList = styled.div`
  margin-bottom: 1.5rem;
`;

const IngredientsTitle = styled.h5`
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.75rem;
`;

const IngredientsWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
`;

const IngredientChip = styled.span`
  padding: 0.25rem 0.75rem;
  background: #edf2f7;
  color: #4a5568;
  border-radius: 16px;
  font-size: 0.75rem;
`;

const ViewRecipeButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, #5a67d8, #6b46c1);
    transform: translateY(-1px);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #718096;
  
  .icon {
    font-size: 4rem;
    margin-bottom: 1.5rem;
    opacity: 0.5;
  }
  
  h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #4a5568;
  }
  
  p {
    font-size: 1rem;
    line-height: 1.6;
    max-width: 500px;
    margin: 0 auto;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem;
  
  .spinner {
    width: 3rem;
    height: 3rem;
    border: 3px solid #e2e8f0;
    border-top: 3px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await recipeAPI.getFavorites();
      console.log('Favorites API response:', response);
      
      if (response.favorites) {
        setFavorites(response.favorites);
      } else {
        setFavorites([]);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError('Failed to load favorite recipes');
      toast.error('Failed to load favorite recipes');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (recipeId, recipeName) => {
    try {
      await recipeAPI.removeFromFavorites(recipeId);
      setFavorites(prev => prev.filter(fav => fav.recipe.recipe_id !== recipeId));
      toast.success(`Removed "${recipeName}" from favorites`);
    } catch (err) {
      console.error('Error removing favorite:', err);
      toast.error('Failed to remove from favorites');
    }
  };

  const formatTime = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>
          <div className="spinner" />
        </LoadingSpinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <EmptyState>
          <FiHeart className="icon" />
          <h3>Unable to Load Favorites</h3>
          <p>{error}</p>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <FaHeart className="icon" />
          My Favorite Recipes
        </Title>
        <Subtitle>
          Your personal collection of bookmarked recipes, ready to cook anytime
        </Subtitle>
      </Header>

      <StatsContainer>
        <StatCard>
          <StatNumber>{favorites.length}</StatNumber>
          <StatLabel>Saved Recipes</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>
            {favorites.reduce((sum, fav) => sum + (fav.recipe.ingredients?.length || 0), 0)}
          </StatNumber>
          <StatLabel>Total Ingredients</StatLabel>
        </StatCard>
      </StatsContainer>

      {favorites.length === 0 ? (
        <EmptyState>
          <FiHeart className="icon" />
          <h3>No Favorite Recipes Yet</h3>
          <p>
            Start exploring recipes and click the heart icon to save your favorites here. 
            Your saved recipes will appear in this collection for easy access.
          </p>
        </EmptyState>
      ) : (
        <FavoritesGrid>
          <AnimatePresence>
            {favorites.map((favorite, index) => {
              const recipe = favorite.recipe;
              return (
                <FavoriteCard
                  key={recipe.recipe_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  onClick={() => navigate(`/recipe/${recipe.recipe_id}`)}
                >
                  <CardHeader>
                    <div style={{ flex: 1 }}>
                      <RecipeTitle>{recipe.title}</RecipeTitle>
                      <AddedDate>
                        Added {formatDate(favorite.added_at)}
                      </AddedDate>
                    </div>
                    <FavoriteActions>
                      <ActionButton
                        variant="remove"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFavorite(recipe.recipe_id, recipe.title);
                        }}
                        title="Remove from favorites"
                      >
                        <FiTrash2 />
                      </ActionButton>
                    </FavoriteActions>
                  </CardHeader>

                  <RecipeMetrics>
                    <MetricItem>
                      <FiClock />
                      {formatTime((recipe.prep_time_mins || 0) + (recipe.cook_time_mins || 0))}
                    </MetricItem>
                    <MetricItem>
                      <FiUsers />
                      {recipe.servings || 4} servings
                    </MetricItem>
                  </RecipeMetrics>

                  <DifficultyBadge difficulty={recipe.difficulty}>
                    {recipe.difficulty || 'easy'}
                  </DifficultyBadge>

                  {recipe.ingredients && recipe.ingredients.length > 0 && (
                    <IngredientsList>
                      <IngredientsTitle>
                        Ingredients ({recipe.ingredients.length})
                      </IngredientsTitle>
                      <IngredientsWrap>
                        {recipe.ingredients.slice(0, 5).map((ingredient, idx) => (
                          <IngredientChip key={idx}>
                            {ingredient.name}
                          </IngredientChip>
                        ))}
                        {recipe.ingredients.length > 5 && (
                          <IngredientChip>
                            +{recipe.ingredients.length - 5} more
                          </IngredientChip>
                        )}
                      </IngredientsWrap>
                    </IngredientsList>
                  )}

                  <ViewRecipeButton
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/recipe/${recipe.recipe_id}`);
                    }}
                  >
                    View Full Recipe
                    <FiArrowRight />
                  </ViewRecipeButton>
                </FavoriteCard>
              );
            })}
          </AnimatePresence>
        </FavoritesGrid>
      )}
    </Container>
  );
};

export default Favorites;