import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FiArrowLeft, FiClock, FiUsers, FiHeart, FiStar, 
  FiCoffee, FiList, FiCheckCircle, FiShare2, FiPrinter 
} from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { recipeAPI } from '../services/api';

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: transparent;
  color: #4a5568;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 2rem;
  
  &:hover {
    background: #f7fafc;
    color: #2d3748;
  }
`;

const RecipeHeader = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
`;

const RecipeTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 1rem;
  line-height: 1.2;
`;

const RecipeDescription = styled.p`
  color: #718096;
  font-size: 1.125rem;
  line-height: 1.6;
  margin-bottom: 2rem;
`;

const RecipeMetrics = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  margin-bottom: 2rem;
`;

const MetricCard = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #f7fafc, #edf2f7);
  border-radius: 12px;
  border: 1px solid #e2e8f0;
`;

const MetricIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: ${props => props.color || '#667eea'};
  color: white;
  border-radius: 50%;
  font-size: 1.125rem;
`;

const MetricInfo = styled.div`
  h4 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #2d3748;
    margin: 0 0 0.25rem 0;
  }
  
  span {
    color: #718096;
    font-size: 0.875rem;
  }
`;

const BadgeContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 2rem;
`;

const Badge = styled.span`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  
  ${props => {
    switch (props.type) {
      case 'difficulty-easy':
        return 'background: #c6f6d5; color: #22543d;';
      case 'difficulty-medium':
        return 'background: #fed7aa; color: #c05621;';
      case 'difficulty-hard':
        return 'background: #fed7d7; color: #c53030;';
      case 'category':
        return 'background: #bee3f8; color: #2c5282;';
      default:
        return 'background: #e2e8f0; color: #4a5568;';
    }
  }}
`;

const ActionsBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${props => props.primary ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'white'};
  color: ${props => props.primary ? 'white' : '#4a5568'};
  border: ${props => props.primary ? 'none' : '1px solid #e2e8f0'};
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.primary ? 'linear-gradient(135deg, #5a67d8, #6b46c1)' : '#f7fafc'};
    transform: translateY(-1px);
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const IngredientsCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  height: fit-content;
`;

const InstructionsCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`;

const SectionTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1.5rem;
  
  .icon {
    color: #667eea;
  }
`;

const IngredientList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const IngredientItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f7fafc;
  
  &:last-child {
    border-bottom: none;
  }
`;

const IngredientCheckbox = styled.input`
  width: 1.25rem;
  height: 1.25rem;
  accent-color: #667eea;
  cursor: pointer;
`;

const IngredientText = styled.span`
  color: #4a5568;
  font-size: 1rem;
  flex: 1;
  text-decoration: ${props => props.checked ? 'line-through' : 'none'};
  opacity: ${props => props.checked ? 0.6 : 1};
`;

const InstructionList = styled.ol`
  list-style: none;
  padding: 0;
  margin: 0;
  counter-reset: step-counter;
`;

const InstructionItem = styled.li`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  counter-increment: step-counter;
  
  &:before {
    content: counter(step-counter);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border-radius: 50%;
    font-weight: 600;
    font-size: 0.875rem;
    flex-shrink: 0;
    margin-top: 0.25rem;
  }
`;

const InstructionText = styled.div`
  flex: 1;
  
  p {
    color: #4a5568;
    font-size: 1rem;
    line-height: 1.6;
    margin: 0;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  
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

const ErrorMessage = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  
  h3 {
    color: #e53e3e;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #718096;
    margin-bottom: 1.5rem;
  }
`;

const RecipeDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState(new Set());

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await recipeAPI.getRecipeById(id);
        setRecipe(response);
        
        // Check if recipe is in favorites (you might need to implement this)
        // const favoritesResponse = await recipeAPI.getFavorites();
        // setIsFavorite(favoritesResponse.favorites?.some(fav => fav.recipe.recipe_id === parseInt(id)));
        
      } catch (error) {
        console.error('Failed to fetch recipe:', error);
        setError(error.message || 'Failed to load recipe');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRecipe();
    }
  }, [id]);

  const handleFavoriteToggle = async () => {
    try {
      if (isFavorite) {
        await recipeAPI.removeFromFavorites(recipe.recipe_id);
        setIsFavorite(false);
        toast.success('Removed from favorites');
      } else {
        await recipeAPI.addToFavorites(recipe.recipe_id);
        setIsFavorite(true);
        toast.success('Added to favorites');
      }
    } catch (error) {
      toast.error('Failed to update favorites');
    }
  };

  const handleIngredientCheck = (index) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedIngredients(newChecked);
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

  const getTotalTime = () => {
    return (recipe?.prep_time_mins || 0) + (recipe?.cook_time_mins || 0);
  };

  const getDifficultyBadgeType = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'difficulty-easy';
      case 'medium': return 'difficulty-medium';
      case 'hard': return 'difficulty-hard';
      default: return 'difficulty-easy';
    }
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

  if (error || !recipe) {
    return (
      <Container>
        <ErrorMessage>
          <h3>Recipe Not Found</h3>
          <p>{error || 'The requested recipe could not be found.'}</p>
          <ActionButton onClick={() => navigate('/recipes')}>
            <FiArrowLeft />
            Back to Recipes
          </ActionButton>
        </ErrorMessage>
      </Container>
    );
  }

  return (
    <Container>
      <BackButton onClick={() => navigate(-1)}>
        <FiArrowLeft />
        Back
      </BackButton>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <RecipeHeader>
          <RecipeTitle>{recipe.title}</RecipeTitle>
          
          {recipe.description && (
            <RecipeDescription>{recipe.description}</RecipeDescription>
          )}

          <RecipeMetrics>
            <MetricCard>
              <MetricIcon color="#22c55e">
                <FiClock />
              </MetricIcon>
              <MetricInfo>
                <h4>{formatTime(recipe.prep_time_mins)}</h4>
                <span>Prep Time</span>
              </MetricInfo>
            </MetricCard>

            <MetricCard>
              <MetricIcon color="#f59e0b">
                <FiCoffee />
              </MetricIcon>
              <MetricInfo>
                <h4>{formatTime(recipe.cook_time_mins)}</h4>
                <span>Cook Time</span>
              </MetricInfo>
            </MetricCard>

            <MetricCard>
              <MetricIcon color="#8b5cf6">
                <FiUsers />
              </MetricIcon>
              <MetricInfo>
                <h4>{recipe.servings || 4}</h4>
                <span>Servings</span>
              </MetricInfo>
            </MetricCard>

            <MetricCard>
              <MetricIcon color="#06b6d4">
                <FiStar />
              </MetricIcon>
              <MetricInfo>
                <h4>{formatTime(getTotalTime())}</h4>
                <span>Total Time</span>
              </MetricInfo>
            </MetricCard>
          </RecipeMetrics>

          <BadgeContainer>
            <Badge type={getDifficultyBadgeType(recipe.difficulty)}>
              {(recipe.difficulty || 'easy').charAt(0).toUpperCase() + (recipe.difficulty || 'easy').slice(1)}
            </Badge>
            {recipe.category && (
              <Badge type="category">{recipe.category}</Badge>
            )}
            {recipe.dietary_restrictions?.map((restriction, index) => (
              <Badge key={index}>{restriction}</Badge>
            ))}
          </BadgeContainer>

          <ActionsBar>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <ActionButton primary onClick={handleFavoriteToggle}>
                {isFavorite ? <FaHeart /> : <FiHeart />}
                {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </ActionButton>
              
              <ActionButton onClick={() => window.print()}>
                <FiPrinter />
                Print Recipe
              </ActionButton>
              
              <ActionButton onClick={() => {
                navigator.share && navigator.share({
                  title: recipe.title,
                  text: `Check out this recipe: ${recipe.title}`,
                  url: window.location.href
                }).catch(() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Recipe link copied to clipboard');
                });
              }}>
                <FiShare2 />
                Share
              </ActionButton>
            </div>
          </ActionsBar>
        </RecipeHeader>

        <ContentGrid>
          <IngredientsCard>
            <SectionTitle>
              <FiList className="icon" />
              Ingredients
            </SectionTitle>
            
            <IngredientList>
              {recipe.ingredients?.map((ingredient, index) => (
                <IngredientItem key={index}>
                  <IngredientCheckbox
                    type="checkbox"
                    checked={checkedIngredients.has(index)}
                    onChange={() => handleIngredientCheck(index)}
                  />
                  <IngredientText checked={checkedIngredients.has(index)}>
                    {ingredient.quantity && ingredient.unit ? 
                      `${ingredient.quantity} ${ingredient.unit} ` : 
                      ingredient.quantity ? `${ingredient.quantity} ` : ''
                    }
                    {ingredient.name}
                  </IngredientText>
                </IngredientItem>
              )) || (
                <IngredientItem>
                  <IngredientText>No ingredients listed</IngredientText>
                </IngredientItem>
              )}
            </IngredientList>
          </IngredientsCard>

          <InstructionsCard>
            <SectionTitle>
              <FiCheckCircle className="icon" />
              Instructions
            </SectionTitle>
            
            <InstructionList>
              {recipe.instructions ? (
                recipe.instructions.split('\n').filter(step => step.trim()).map((step, index) => (
                  <InstructionItem key={index}>
                    <InstructionText>
                      <p>{step.trim()}</p>
                    </InstructionText>
                  </InstructionItem>
                ))
              ) : (
                <InstructionItem>
                  <InstructionText>
                    <p>No instructions provided for this recipe.</p>
                  </InstructionText>
                </InstructionItem>
              )}
            </InstructionList>
          </InstructionsCard>
        </ContentGrid>
      </motion.div>
    </Container>
  );
};

export default RecipeDetailPage;