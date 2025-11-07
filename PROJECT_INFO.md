# Recipe Recommenda - Project Information

## Application Details

- **Name**: Recipe Recommenda
- **Version**: 1.0.0
- **Type**: AI-Powered Recipe Recommendation System
- **Architecture**: Full-Stack Web Application

## Technology Stack

### Backend

- **Framework**: Flask (Python)
- **Authentication**: Supabase Auth + JWT
- **Database**: Supabase (PostgreSQL)
- **AI/ML**: YOLO v5 for ingredient detection
- **Image Processing**: OpenCV, PIL
- **API**: RESTful API with JSON responses

### Frontend

- **Framework**: React 18.x
- **Styling**: Styled Components
- **Routing**: React Router v6
- **State Management**: Context API + Reducers
- **Animations**: Framer Motion
- **Icons**: React Icons (Feather Icons)
- **Notifications**: React Hot Toast

### Database Schema

- **Users**: Authentication and profiles
- **Recipes**: Recipe data with nutritional info
- **Ingredients**: Ingredient database
- **Allergies**: User allergy tracking
- **Favorites**: User favorite recipes
- **Recommendations**: AI-generated suggestions

## Key Features

### Core Functionality

1. **Ingredient Scanning**: Upload photos to detect ingredients
2. **Recipe Recommendations**: AI-powered recipe suggestions
3. **User Profiles**: Manage dietary preferences and restrictions
4. **Allergy Management**: Track and filter by allergies
5. **Favorites System**: Save and organize favorite recipes
6. **Recipe Browsing**: Search and filter recipe database

### Advanced Features

1. **Real-time Camera Scanning**: Live ingredient detection
2. **Nutritional Information**: Detailed macro/micro nutrients
3. **Difficulty Filtering**: Recipes by skill level
4. **Cooking Time Filters**: Find quick or elaborate recipes
5. **Dietary Restrictions**: Vegetarian, vegan, gluten-free options
6. **Social Features**: Share and rate recipes

## File Structure Breakdown

### Backend (`/backend`)

- `app.py` - Main Flask application entry point
- `config.py` - Configuration management
- `api/` - API route handlers by feature
- `services/` - Business logic and external integrations
- `utils/` - Helper functions and utilities

### Frontend (`/frontend`)

- `src/components/` - Reusable UI components
- `src/pages/` - Page-level components
- `src/context/` - React Context for state management
- `src/services/` - API client and external services
- `src/styles/` - Global styles and theme

### Model (`/model`)

- `best.pt` - Trained YOLO model for ingredient detection

## Environment Variables

### Backend Required

- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_KEY` - Supabase anonymous key
- `JWT_SECRET_KEY` - JWT token signing secret
- `FLASK_ENV` - Flask environment (development/production)
- `UPLOAD_FOLDER` - Image upload directory path

### Frontend Required

- `REACT_APP_API_URL` - Backend API base URL
- `REACT_APP_ENVIRONMENT` - Application environment

## API Endpoints Summary

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Current user info
- `POST /api/auth/reset-password` - Password reset
- `POST /api/auth/confirm-password-reset` - Confirm reset

### User Management

- `PUT /api/auth/update-profile` - Update user profile
- `GET /api/user/allergies` - Get user allergies
- `POST /api/user/allergies` - Add allergy
- `DELETE /api/user/allergies/{id}` - Remove allergy

### Recipe System

- `GET /api/recipes` - Browse recipes with filters
- `GET /api/recipes/{id}` - Get recipe details
- `POST /api/recipes/recommend` - Get recommendations
- `GET /api/user/favorites` - Get user favorites
- `POST /api/user/favorites` - Add to favorites
- `DELETE /api/user/favorites/{id}` - Remove favorite

### Scanning

- `POST /api/scan/upload` - Upload images for scanning
- `POST /api/scan/camera` - Real-time camera scanning
- `GET /api/scan/results/{id}` - Get scan results

## Performance Considerations

- Image compression for faster uploads
- Lazy loading for recipe lists
- Optimized database queries with indexing
- Caching for frequently accessed data
- Responsive images for mobile devices

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Rate limiting on API endpoints
- Secure file upload handling

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Development Tools

- Hot reload for development
- Error boundary components
- Comprehensive logging
- Environment-based configuration
- Development vs production builds

---

**Recipe Recommenda** - Built with ❤️ for food enthusiasts
