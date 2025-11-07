import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiCoffee, FiClock, FiUsers, FiHeart, FiStar, FiArrowRight } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { recipeAPI } from '../services/api';
import { useRecipeRecommendations } from '../context/RecipeRecommendationContext';

const RecommendationsContainer = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h3`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.5rem;
  
  .icon {
    color: #667eea;
  }
`;

const Subtitle = styled.p`
  color: #718096;
  font-size: 0.9rem;
`;

const ConfidenceInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 1.5rem;
`;

const IngredientBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  background: linear-gradient(135deg, #4caf50, #45a049);
  color: white;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const ConfidenceBadge = styled.span`
  padding: 0.125rem 0.375rem;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  font-size: 0.7rem;
`;

const RecipesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const RecipeCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  }
`;

const RecipeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const RecipeTitle = styled.h4`
  font-size: 1.125rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
  line-height: 1.3;
  flex: 1;
`;

const FavoriteButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'isFavorite'
})`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  border-radius: 50%;
  background: ${props => props.isFavorite ? '#e53e3e' : '#f7fafc'};
  color: ${props => props.isFavorite ? 'white' : '#a0aec0'};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.isFavorite ? '#c53030' : '#edf2f7'};
    transform: scale(1.1);
  }
`;

const RecipeMetrics = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #718096;
`;

const MetricItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const ScoreContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const MatchScore = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const DifficultyBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  
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
  margin-bottom: 1rem;
`;

const IngredientsTitle = styled.h5`
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.5rem;
`;

const IngredientsWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
`;

const IngredientChip = styled.span`
  padding: 0.125rem 0.5rem;
  background: #edf2f7;
  color: #4a5568;
  border-radius: 12px;
  font-size: 0.75rem;
`;

const ViewRecipeButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #4caf50, #45a049);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, #45a049, #3d8b40);
    transform: translateY(-1px);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #718096;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
  
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

const RecipeRecommendations = ({ detectedIngredients, onRecipeSelect, isScanning = false }) => {
  const navigate = useNavigate();
  const { 
    currentRecommendations, 
    updateRecommendations, 
    markScanComplete,
    isRecommendationsAvailable 
  } = useRecipeRecommendations();
  
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [highConfidenceIngredients, setHighConfidenceIngredients] = useState([]);
  const [lastIngredientHash, setLastIngredientHash] = useState('');
  const [processedIngredients, setProcessedIngredients] = useState(new Set());

  // Load favorite status for recipes
  const loadFavoriteStatuses = async (recipes) => {
    try {
      const favoriteChecks = recipes.map(recipe => 
        recipeAPI.checkFavoriteStatus(recipe.recipe_id).catch(() => ({ is_favorited: false }))
      );
      const results = await Promise.all(favoriteChecks);
      
      const newFavorites = new Set();
      results.forEach((result, index) => {
        if (result.is_favorited) {
          newFavorites.add(recipes[index].recipe_id);
        }
      });
      
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Error loading favorite statuses:', error);
    }
  };

  // Load favorites when recommendations change
  useEffect(() => {
    if (currentRecommendations && currentRecommendations.length > 0) {
      loadFavoriteStatuses(currentRecommendations);
    }
  }, [currentRecommendations]);

  // Create a hash of ingredients to detect changes
  const createIngredientHash = (ingredients) => {
    if (!ingredients || ingredients.length === 0) return '';
    return ingredients
      .filter(ing => ing.confidence >= 0.5)
      .map(ing => ing.name.toLowerCase().trim())
      .sort()
      .join('|');
  };

  // Check for new ingredients that haven't been processed yet
  const getNewIngredients = (ingredients) => {
    if (!ingredients || ingredients.length === 0) return [];
    
    const highConfidence = ingredients.filter(ing => ing.confidence >= 0.5);
    const newIngredients = highConfidence.filter(ing => 
      !processedIngredients.has(ing.name.toLowerCase().trim())
    );
    
    return newIngredients;
  };

  useEffect(() => {
    if (detectedIngredients && detectedIngredients.length > 0) {
      const newIngredients = getNewIngredients(detectedIngredients);
      
      // Only fetch recommendations if we have truly new ingredients
      if (newIngredients.length > 0) {
        console.log(`Found ${newIngredients.length} new ingredients:`, newIngredients.map(ing => ing.name));
        
        // Add new ingredients to processed set
        const newProcessedSet = new Set(processedIngredients);
        newIngredients.forEach(ing => {
          newProcessedSet.add(ing.name.toLowerCase().trim());
        });
        setProcessedIngredients(newProcessedSet);
        
        // Fetch recommendations for ALL high-confidence ingredients (not just new ones)
        const allHighConfidence = detectedIngredients.filter(ing => ing.confidence >= 0.5);
        fetchRecommendations(allHighConfidence);
      } else {
        console.log('No new ingredients detected, keeping existing recommendations');
      }
    }
  }, [detectedIngredients]);

  const fetchRecommendations = async (ingredientsToProcess) => {
    setLoading(true);
    try {
      console.log(`Fetching recommendations for ${ingredientsToProcess.length} ingredients:`, 
        ingredientsToProcess.map(ing => `${ing.name} (${(ing.confidence * 100).toFixed(1)}%)`));
      
      const response = await recipeAPI.getRecommendations(ingredientsToProcess, 0.5);
      console.log(`Received ${response.recommendations?.length || 0} recipe recommendations`);
      
      const recommendations = response.recommendations || [];
      setHighConfidenceIngredients(response.high_confidence_ingredients || []);
      
      // Check if we have existing recommendations to merge with
      const existingRecommendations = currentRecommendations || [];
      let finalRecommendations = [];
      
      if (existingRecommendations.length === 0) {
        // First time getting recommendations
        finalRecommendations = recommendations;
        console.log('First recommendation fetch, showing all results');
      } else {
        // Merge new recommendations with existing ones, avoiding duplicates
        const existingIds = new Set(existingRecommendations.map(r => r.recipe_id));
        const newRecommendations = recommendations.filter(r => !existingIds.has(r.recipe_id));
        
        finalRecommendations = [...existingRecommendations, ...newRecommendations];
        console.log(`Merged ${newRecommendations.length} new recommendations with ${existingRecommendations.length} existing ones`);
      }
      
      // Update context with merged recommendations
      updateRecommendations(finalRecommendations, response.high_confidence_ingredients || []);
      
      if (recommendations.length === 0) {
        // Only show fallback if we have no existing recommendations
        if (existingRecommendations.length === 0) {
          console.log('No recommendations found, trying fallback recipes...');
          try {
            const fallbackResponse = await recipeAPI.searchRecipes({ limit: 5 });
            if (fallbackResponse.recipes && fallbackResponse.recipes.length > 0) {
              updateRecommendations(fallbackResponse.recipes, []);
              toast('Showing popular recipes since no matches found for detected ingredients', {
                icon: '🍽️',
                duration: 4000
              });
            } else {
              toast('No recipe recommendations found for detected ingredients', {
                icon: '🔍'
              });
            }
          } catch (fallbackError) {
            console.error('Fallback recipes failed:', fallbackError);
            toast('No recipe recommendations found for detected ingredients', {
              icon: '🔍'
            });
          }
        } else {
          console.log('No new recipes found for additional ingredients, keeping existing recommendations');
        }
      } else {
        const newCount = finalRecommendations.length - existingRecommendations.length;
        if (newCount > 0) {
          toast.success(`Found ${newCount} additional recipe recommendation${newCount > 1 ? 's' : ''}!`);
        }
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      // Only show fallback if we have no existing recommendations
      if ((currentRecommendations || []).length === 0) {
        try {
          const fallbackResponse = await recipeAPI.searchRecipes({ limit: 5 });
          if (fallbackResponse.recipes && fallbackResponse.recipes.length > 0) {
            updateRecommendations(fallbackResponse.recipes, []);
            toast('Showing popular recipes (recommendation service unavailable)', {
              icon: '🍽️',
              duration: 4000
            });
          } else {
            toast.error('Failed to load recipe recommendations');
          }
        } catch (fallbackError) {
          toast.error('Failed to load recipe recommendations');
        }
      } else {
        toast.error('Failed to fetch additional recommendations');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (recipeId) => {
    try {
      const isFavorite = favorites.has(recipeId);
      
      if (isFavorite) {
        await recipeAPI.removeFromFavorites(recipeId);
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          newFavorites.delete(recipeId);
          return newFavorites;
        });
        toast('Removed from favorites');
      } else {
        await recipeAPI.addToFavorites(recipeId);
        setFavorites(prev => new Set(prev).add(recipeId));
        toast.success('Added to favorites');
      }
    } catch (error) {
      toast.error('Failed to update favorites');
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

  if (!detectedIngredients || detectedIngredients.length === 0) {
    return null;
  }

  return (
    <RecommendationsContainer>
      <Header>
        <Title>
          <FiCoffee className="icon" />
          Recipe Recommendations
        </Title>
        <Subtitle>
          Based on your scanned ingredients with high confidence (≥65%)
        </Subtitle>
      </Header>

      {highConfidenceIngredients.length > 0 && (
        <ConfidenceInfo>
          {highConfidenceIngredients.map((ingredient, index) => (
            <IngredientBadge key={index}>
              {ingredient.name}
              <ConfidenceBadge>
                {(ingredient.confidence * 100).toFixed(0)}%
              </ConfidenceBadge>
            </IngredientBadge>
          ))}
        </ConfidenceInfo>
      )}

      {loading ? (
        <LoadingSpinner>
          <div className="spinner" />
        </LoadingSpinner>
      ) : currentRecommendations.length > 0 ? (
        <RecipesGrid>
          <AnimatePresence>
            {currentRecommendations.map((recipe, index) => (
              <RecipeCard
                key={recipe.recipe_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={() => onRecipeSelect && onRecipeSelect(recipe)}
              >
                <RecipeHeader>
                  <RecipeTitle>{recipe.title}</RecipeTitle>
                  <FavoriteButton
                    isFavorite={favorites.has(recipe.recipe_id)}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(recipe.recipe_id);
                    }}
                  >
                    {favorites.has(recipe.recipe_id) ? <FaHeart /> : <FiHeart />}
                  </FavoriteButton>
                </RecipeHeader>

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

                <ScoreContainer>
                  <MatchScore>
                    <FiStar />
                    {(recipe.ingredient_match_percentage || 0).toFixed(0)}% match
                  </MatchScore>
                  <DifficultyBadge difficulty={recipe.difficulty}>
                    {recipe.difficulty || 'easy'}
                  </DifficultyBadge>
                </ScoreContainer>

                {recipe.ingredients && recipe.ingredients.length > 0 && (
                  <IngredientsList>
                    <IngredientsTitle>Ingredients ({recipe.ingredients.length})</IngredientsTitle>
                    <IngredientsWrap>
                      {recipe.ingredients.slice(0, 6).map((ingredient, idx) => (
                        <IngredientChip key={idx}>
                          {ingredient.name}
                        </IngredientChip>
                      ))}
                      {recipe.ingredients.length > 6 && (
                        <IngredientChip>+{recipe.ingredients.length - 6} more</IngredientChip>
                      )}
                    </IngredientsWrap>
                  </IngredientsList>
                )}

                <ViewRecipeButton onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/recipe/${recipe.recipe_id}`);
                  onRecipeSelect && onRecipeSelect(recipe);
                }}>
                  View Recipe
                  <FiArrowRight />
                </ViewRecipeButton>
              </RecipeCard>
            ))}
          </AnimatePresence>
        </RecipesGrid>
      ) : (
        <EmptyState>
          <FiCoffee size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <p>No recipe recommendations found for the detected ingredients.</p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Try scanning more ingredients or check if they were detected with sufficient confidence.
          </p>
        </EmptyState>
      )}
    </RecommendationsContainer>
  );
};

export default RecipeRecommendations;