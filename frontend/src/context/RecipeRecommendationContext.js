import React, { createContext, useContext, useState, useCallback } from 'react';

const RecipeRecommendationContext = createContext();

export const useRecipeRecommendations = () => {
  const context = useContext(RecipeRecommendationContext);
  if (!context) {
    throw new Error('useRecipeRecommendations must be used within a RecipeRecommendationProvider');
  }
  return context;
};

export const RecipeRecommendationProvider = ({ children }) => {
  const [currentRecommendations, setCurrentRecommendations] = useState([]);
  const [recommendationHistory, setRecommendationHistory] = useState([]);
  const [lastScanIngredients, setLastScanIngredients] = useState([]);
  const [isRecommendationsAvailable, setIsRecommendationsAvailable] = useState(false);

  const updateRecommendations = useCallback((recommendations, ingredients) => {
    if (recommendations && recommendations.length > 0) {
      const recommendationSession = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ingredients: ingredients || [],
        recipes: recommendations,
        scanComplete: false
      };

      setCurrentRecommendations(recommendations);
      setLastScanIngredients(ingredients || []);
      setIsRecommendationsAvailable(true);
      
      // Add to history
      setRecommendationHistory(prev => [recommendationSession, ...prev.slice(0, 9)]); // Keep last 10
    }
  }, []);

  const markScanComplete = useCallback(() => {
    setRecommendationHistory(prev => 
      prev.map((session, index) => 
        index === 0 ? { ...session, scanComplete: true } : session
      )
    );
  }, []);

  const clearCurrentRecommendations = useCallback(() => {
    setCurrentRecommendations([]);
    setLastScanIngredients([]);
    setIsRecommendationsAvailable(false);
  }, []);

  const getRecommendationsBySession = useCallback((sessionId) => {
    return recommendationHistory.find(session => session.id === sessionId);
  }, [recommendationHistory]);

  const value = {
    currentRecommendations,
    recommendationHistory,
    lastScanIngredients,
    isRecommendationsAvailable,
    updateRecommendations,
    markScanComplete,
    clearCurrentRecommendations,
    getRecommendationsBySession
  };

  return (
    <RecipeRecommendationContext.Provider value={value}>
      {children}
    </RecipeRecommendationContext.Provider>
  );
};

export default RecipeRecommendationContext;