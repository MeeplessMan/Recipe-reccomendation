import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FiSearch, FiFilter, FiClock, FiUsers, FiHeart, FiStar, 
  FiCoffee, FiEye, FiBookOpen, FiX, FiRefreshCw 
} from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { recipeAPI } from '../services/api';

const BrowsingContainer = styled.div`
  padding: 2rem 1rem;
  max-width: 1200px;
  margin: 0 auto;
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

const SearchAndFilters = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  
  @media (min-width: 768px) {
    flex-direction: row;
    align-items: flex-end;
  }
`;

const SearchSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  @media (min-width: 768px) {
    flex-direction: row;
    gap: 1rem;
  }
`;

const SearchInputContainer = styled.div`
  position: relative;
  flex: 1;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  &::placeholder {
    color: #a0aec0;
  }
`;

const SearchIcon = styled(FiSearch)`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
  font-size: 1.125rem;
`;

const SearchButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  
  &:hover {
    background: linear-gradient(135deg, #5a67d8, #6b46c1);
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const FiltersSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const FilterLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a5568;
`;

const FilterSelect = styled.select`
  padding: 0.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const ClearFiltersButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  background: transparent;
  color: #718096;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #f7fafc;
    color: #4a5568;
  }
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ResultsCount = styled.p`
  color: #718096;
  font-size: 0.875rem;
`;

const SortSelect = styled.select`
  padding: 0.5rem 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const RecipesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
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

const RecipeTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
  line-height: 1.3;
  flex: 1;
  margin-right: 0.75rem;
`;

const FavoriteButton = styled.button`
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
  flex-shrink: 0;
  position: relative;
  
  &:hover {
    background: ${props => props.isFavorite ? '#c53030' : '#edf2f7'};
    transform: scale(1.1);
  }
  
  &:disabled {
    cursor: default;
    transform: none;
    opacity: 0.7;
  }
  
  .loading-spinner {
    width: 1rem;
    height: 1rem;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const RecipeDescription = styled.p`
  color: #718096;
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const RecipeMetrics = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #718096;
  flex-wrap: wrap;
`;

const MetricItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  white-space: nowrap;
`;

const RecipeBadges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const DifficultyBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
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

const CategoryBadge = styled.span`
  padding: 0.25rem 0.75rem;
  background: #e2e8f0;
  color: #4a5568;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
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

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
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
  }
`;

const RecipeBrowsing = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [favorites, setFavorites] = useState(new Set());
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState('');
  const [sortBy, setSortBy] = useState('title');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecipes, setTotalRecipes] = useState(0);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const recipesPerPage = 12;

  const fetchRecipes = useCallback(async (resetPage = false) => {
    setLoading(true);
    try {
      const params = {
        page: resetPage ? 1 : currentPage,
        limit: recipesPerPage,
        sort_by: sortBy,
        ...(searchQuery && { search: searchQuery }),
        ...(categoryFilter && { category: categoryFilter }),
        ...(difficultyFilter && { difficulty: difficultyFilter }),
        ...(timeFilter && { max_time: parseInt(timeFilter) }),
        ...(dietaryFilter && { dietary_restriction: dietaryFilter })
      };

      if (resetPage) {
        setCurrentPage(1);
      }

      const response = await recipeAPI.searchRecipes(params);
      
      console.log('API Response:', response); // Debug log
      
      // Handle different response formats from backend
      const recipes = response.recipes || response.data || [];
      const total = response.pagination?.total || response.total || recipes.length;
      
      console.log('Parsed recipes:', recipes.length, 'total:', total); // Debug log
      
      setRecipes(recipes);
      setTotalRecipes(total);
      
      if (resetPage && recipes.length === 0) {
        toast('No recipes found matching your criteria', { icon: '🔍' });
      }
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
      toast.error('Failed to load recipes');
      // Set empty state on error
      setRecipes([]);
      setTotalRecipes(0);
      // Clear favorites when recipes fail to load
      setFavorites(new Set());
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, categoryFilter, difficultyFilter, timeFilter, dietaryFilter, sortBy, recipesPerPage]);

  // Load favorite status for recipes
  const loadFavoriteStatuses = async (recipes) => {
    setFavoritesLoading(true);
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
      console.log(`Loaded favorite status for ${recipes.length} recipes. ${newFavorites.size} are favorited.`);
    } catch (error) {
      console.error('Error loading favorite statuses:', error);
      // Don't show error toast for favorites loading, as it's not critical
    } finally {
      setFavoritesLoading(false);
    }
  };

  // Load recipes when component mounts and when dependencies change
  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  // Load favorites status when recipes change
  useEffect(() => {
    if (recipes && recipes.length > 0) {
      loadFavoriteStatuses(recipes);
    }
  }, [recipes]);

  const handleSearch = () => {
    fetchRecipes(true);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setCategoryFilter('');
    setDifficultyFilter('');
    setTimeFilter('');
    setDietaryFilter('');
    setSortBy('title');
    setCurrentPage(1);
  }, []);

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

  const getTotalTime = (recipe) => {
    return (recipe.prep_time_mins || 0) + (recipe.cook_time_mins || 0);
  };

  const hasActiveFilters = searchQuery || categoryFilter || difficultyFilter || timeFilter || dietaryFilter;

  return (
    <BrowsingContainer>
      <Header>
        <Title>
          <FiBookOpen className="icon" />
          Recipe Collection
        </Title>
        <Subtitle>
          Discover delicious recipes for every occasion
        </Subtitle>
      </Header>

      <SearchAndFilters>
        <SearchSection>
          <SearchInputContainer>
            <SearchIcon />
            <SearchInput
              type="text"
              placeholder="Search recipes by name, ingredient, or cuisine..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </SearchInputContainer>
          <SearchButton onClick={handleSearch} disabled={loading}>
            <FiSearch />
            Search
          </SearchButton>
        </SearchSection>

        <FiltersSection>
          <FilterGroup>
            <FilterLabel>Category</FilterLabel>
            <FilterSelect
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="dessert">Dessert</option>
              <option value="snack">Snack</option>
              <option value="appetizer">Appetizer</option>
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Difficulty</FilterLabel>
            <FilterSelect
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
            >
              <option value="">Any Level</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Max Time</FilterLabel>
            <FilterSelect
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              <option value="">Any Duration</option>
              <option value="15">Under 15 min</option>
              <option value="30">Under 30 min</option>
              <option value="60">Under 1 hour</option>
              <option value="120">Under 2 hours</option>
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Dietary</FilterLabel>
            <FilterSelect
              value={dietaryFilter}
              onChange={(e) => setDietaryFilter(e.target.value)}
            >
              <option value="">All Diets</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="gluten-free">Gluten Free</option>
              <option value="dairy-free">Dairy Free</option>
            </FilterSelect>
          </FilterGroup>

          {hasActiveFilters && (
            <ClearFiltersButton onClick={clearFilters}>
              <FiX />
              Clear All
            </ClearFiltersButton>
          )}
        </FiltersSection>
      </SearchAndFilters>

      <ResultsHeader>
        <ResultsCount>
          {loading ? (
            'Loading recipes...'
          ) : totalRecipes > 0 ? (
            `Showing ${Math.min((currentPage - 1) * recipesPerPage + 1, totalRecipes)}-${Math.min(currentPage * recipesPerPage, totalRecipes)} of ${totalRecipes} recipes`
          ) : (
            'No recipes found'
          )}
        </ResultsCount>
        
        <FilterGroup>
          <SortSelect
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1); // Reset to page 1 when sorting changes
            }}
          >
            <option value="title">Sort by Name</option>
            <option value="prep_time_mins">Sort by Prep Time</option>
            <option value="difficulty">Sort by Difficulty</option>
            <option value="servings">Sort by Servings</option>
          </SortSelect>
        </FilterGroup>
      </ResultsHeader>

      {loading ? (
        <LoadingSpinner>
          <div className="spinner" />
        </LoadingSpinner>
      ) : recipes && recipes.length > 0 ? (
        <RecipesGrid>
          <AnimatePresence>
            {recipes.map((recipe, index) => (
              <RecipeCard
                key={recipe.recipe_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => {
                  toast.success(`Selected: ${recipe.title}`);
                  console.log('Selected recipe:', recipe);
                }}
              >
                <RecipeHeader>
                  <RecipeTitle>{recipe.title}</RecipeTitle>
                  <FavoriteButton
                    isFavorite={favorites.has(recipe.recipe_id)}
                    disabled={favoritesLoading}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(recipe.recipe_id);
                    }}
                    title={favoritesLoading ? "Loading favorites..." : (favorites.has(recipe.recipe_id) ? "Remove from favorites" : "Add to favorites")}
                  >
                    {favoritesLoading ? (
                      <div className="loading-spinner" />
                    ) : (
                      favorites.has(recipe.recipe_id) ? <FaHeart /> : <FiHeart />
                    )}
                  </FavoriteButton>
                </RecipeHeader>

                {recipe.description && (
                  <RecipeDescription>{recipe.description}</RecipeDescription>
                )}

                <RecipeMetrics>
                  <MetricItem>
                    <FiClock />
                    {formatTime(getTotalTime(recipe))}
                  </MetricItem>
                  <MetricItem>
                    <FiUsers />
                    {recipe.servings || 4} servings
                  </MetricItem>
                  {recipe.ingredients && (
                    <MetricItem>
                      <FiCoffee />
                      {recipe.ingredients.length} ingredients
                    </MetricItem>
                  )}
                </RecipeMetrics>

                <RecipeBadges>
                  <DifficultyBadge difficulty={recipe.difficulty}>
                    {recipe.difficulty || 'easy'}
                  </DifficultyBadge>
                  {recipe.category && (
                    <CategoryBadge>{recipe.category}</CategoryBadge>
                  )}
                </RecipeBadges>

                <ViewRecipeButton onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/recipe/${recipe.recipe_id}`);
                }}>
                  <FiEye />
                  View Recipe
                </ViewRecipeButton>
              </RecipeCard>
            ))}
          </AnimatePresence>
        </RecipesGrid>
      ) : (
        <EmptyState>
          <FiCoffee className="icon" />
          <h3>No Recipes Found</h3>
          <p>
            {hasActiveFilters 
              ? 'Try adjusting your search criteria or filters to find more recipes.'
              : 'Start by searching for recipes or browse by category.'
            }
          </p>
          {hasActiveFilters && (
            <ClearFiltersButton 
              onClick={clearFilters}
              style={{ marginTop: '1rem', display: 'inline-flex' }}
            >
              <FiRefreshCw />
              Clear Filters & Show All
            </ClearFiltersButton>
          )}
        </EmptyState>
      )}
    </BrowsingContainer>
  );
};

export default RecipeBrowsing;