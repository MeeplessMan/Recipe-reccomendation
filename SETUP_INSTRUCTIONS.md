# Recipe Recommenda - Complete Setup Guide

## Overview

Recipe Recommenda is an AI-powered recipe recommendation system that scans ingredients and suggests personalized recipes based on user preferences, dietary restrictions, and allergies.

## System Requirements

- Python 3.8 or higher
- Node.js 14.x or higher
- npm or yarn package manager
- Supabase account (for database and authentication)
- Modern web browser

## Project Structure

```
recipe_recommenda/
├── backend/                 # Flask API server
│   ├── api/                # API route handlers
│   ├── services/           # Business logic services
│   ├── utils/              # Utility functions
│   ├── app.py              # Main Flask application
│   ├── config.py           # Configuration settings
│   └── requirements.txt    # Python dependencies
├── frontend/               # React web application
│   ├── src/               # Source code
│   ├── public/            # Static assets
│   ├── package.json       # Node.js dependencies
│   └── config-overrides.js # Build configuration
├── model/                 # AI model files
│   └── best.pt           # Trained YOLO model
├── uploads/              # Image upload directory
├── results/              # Processing results
└── setup scripts        # Installation helpers
```

## Quick Start

### 1. Backend Setup

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

### 3. Environment Configuration

Copy the `.env.example` files and configure:

**Backend (.env):**

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
JWT_SECRET_KEY=your_jwt_secret_key
FLASK_ENV=development
UPLOAD_FOLDER=../uploads
```

**Frontend (.env):**

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENVIRONMENT=development
```

### 4. Database Setup

1. Create a Supabase project at https://supabase.com
2. Run the SQL schema file: `SUPABASE_SCHEMA_COMPLETE.sql`
3. Optionally load sample data: `SUPABASE_SAMPLE_DATA.sql`

### 5. Start the Application

```bash
# Terminal 1 - Backend
cd backend
python app.py

# Terminal 2 - Frontend
cd frontend
npm start
```

## Features

- 🔍 **Ingredient Scanning**: AI-powered ingredient detection from images
- 🍳 **Recipe Recommendations**: Personalized recipe suggestions
- 👤 **User Profiles**: Custom dietary preferences and allergies
- ❤️ **Favorites System**: Save and manage favorite recipes
- 🔐 **Authentication**: Secure user accounts with Supabase Auth
- 📱 **Responsive Design**: Works on desktop and mobile devices

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/scan/upload` - Upload ingredient images
- `GET /api/recipes` - Browse recipes
- `POST /api/recipes/recommend` - Get recommendations
- `GET /api/user/profile` - User profile management

## Troubleshooting

### Common Issues

1. **Port already in use**: Change ports in config files
2. **Database connection**: Verify Supabase credentials
3. **Model loading**: Ensure `best.pt` model file exists
4. **CORS errors**: Check API URL configuration

### Logs

- Backend logs: Check Flask console output
- Frontend logs: Check browser developer console

## Development

### Adding New Features

1. Backend: Add routes in `backend/api/`
2. Frontend: Add components in `frontend/src/`
3. Database: Update schema and migrations

### Testing

```bash
# Backend tests
cd backend
python -m pytest

# Frontend tests
cd frontend
npm test
```

## Production Deployment

1. Set `FLASK_ENV=production` in backend
2. Build frontend: `npm run build`
3. Configure production database
4. Set up reverse proxy (nginx/Apache)
5. Use process manager (PM2/systemd)

## Support

For issues and questions, please refer to the main project documentation or create an issue in the repository.

---

**Recipe Recommenda** - AI-Powered Recipe Discovery System
