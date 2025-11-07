import React, { useState, useEffect } from 'react';
import { recipeAPI } from '../services/api';

const RecipeTest = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);

  const testAPI = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Testing API call...');
      const response = await recipeAPI.searchRecipes({
        page: 1,
        limit: 5
      });
      
      console.log('Raw API response:', response);
      setApiResponse(JSON.stringify(response, null, 2));
      
      const recipes = response.recipes || response.data || [];
      const total = response.pagination?.total || response.total || recipes.length;
      
      setRecipes(recipes);
      console.log('Parsed recipes:', recipes);
      console.log('Total:', total);
      
    } catch (error) {
      console.error('API Error:', error);
      setError(error.message || 'Failed to fetch recipes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testAPI();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Recipe API Test Page</h1>
      
      <button onClick={testAPI} disabled={loading}>
        {loading ? 'Testing...' : 'Test API Call'}
      </button>
      
      {loading && <p>Loading...</p>}
      
      {error && (
        <div style={{ color: 'red', background: '#ffe6e6', padding: '10px', margin: '10px 0' }}>
          <h3>Error:</h3>
          <p>{error}</p>
        </div>
      )}
      
      {apiResponse && (
        <div>
          <h3>Raw API Response:</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
            {apiResponse}
          </pre>
        </div>
      )}
      
      <div>
        <h3>Parsed Recipes ({recipes.length}):</h3>
        {recipes.length > 0 ? (
          <ul>
            {recipes.map((recipe) => (
              <li key={recipe.recipe_id}>
                <strong>{recipe.title}</strong> - {recipe.difficulty} - {recipe.prep_time_mins}min prep
                {recipe.ingredients && (
                  <ul>
                    {recipe.ingredients.map((ing, idx) => (
                      <li key={idx}>{ing.name}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>No recipes found</p>
        )}
      </div>
      
      <div>
        <h3>Test Search with Filters:</h3>
        <button onClick={() => {
          setLoading(true);
          recipeAPI.searchRecipes({
            page: 1,
            limit: 3,
            search: 'apple'
          }).then(response => {
            console.log('Search with apple:', response);
            const recipes = response.recipes || response.data || [];
            setRecipes(recipes);
            setApiResponse(JSON.stringify(response, null, 2));
          }).catch(error => {
            setError(error.message);
          }).finally(() => {
            setLoading(false);
          });
        }}>
          Search for "apple"
        </button>
        
        <button onClick={() => {
          setLoading(true);
          recipeAPI.searchRecipes({
            page: 1,
            limit: 3,
            sort_by: 'prep_time_mins'
          }).then(response => {
            console.log('Sort by prep time:', response);
            const recipes = response.recipes || response.data || [];
            setRecipes(recipes);
            setApiResponse(JSON.stringify(response, null, 2));
          }).catch(error => {
            setError(error.message);
          }).finally(() => {
            setLoading(false);
          });
        }}>
          Sort by Prep Time
        </button>
      </div>
    </div>
  );
};

export default RecipeTest;