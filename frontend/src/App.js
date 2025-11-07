/**
 * Main App Component
 * Root application component with routing and providers
 */
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { RecipeRecommendationProvider } from './context/RecipeRecommendationContext';
import { GlobalStyle, theme } from './styles/GlobalStyle';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import PasswordResetConfirm from './pages/PasswordResetConfirm';
import Dashboard from './pages/Dashboard';
import ScanPage from './pages/ScanPage';
import Recipes from './pages/Recipes';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import RecipeDetailPage from './pages/RecipeDetailPage';
import SavedRecommendationsPage from './pages/SavedRecommendationsPage';
import RecipeTest from './components/RecipeTest';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AuthProvider>
        <RecipeRecommendationProvider>
          <Router>
          <div className="App">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<PasswordResetConfirm />} />
              <Route path="/test-recipes" element={<RecipeTest />} />
              
              {/* Protected routes with layout */}
              <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/scan" 
                  element={
                    <ProtectedRoute>
                      <ScanPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/recipes" 
                  element={
                    <ProtectedRoute>
                      <Recipes />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/favorites" 
                  element={
                    <ProtectedRoute>
                      <Favorites />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/recipe/:id" 
                  element={
                    <ProtectedRoute>
                      <RecipeDetailPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/saved-recommendations" 
                  element={
                    <ProtectedRoute>
                      <SavedRecommendationsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/test-recipes" 
                  element={<RecipeTest />} 
                />
              </Route>
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
            
            {/* Toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '14px',
                },
                success: {
                  style: {
                    background: '#22c55e',
                  },
                  iconTheme: {
                    primary: '#ffffff',
                    secondary: '#22c55e',
                  },
                },
                error: {
                  style: {
                    background: '#ef4444',
                  },
                  iconTheme: {
                    primary: '#ffffff',
                    secondary: '#ef4444',
                  },
                },
              }}
            />
          </div>
        </Router>
        </RecipeRecommendationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;