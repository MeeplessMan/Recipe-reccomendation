# Recipe Recommenda 🍳# 🍽️ Ingredient Scanner App - Complete Full-Stack Web Application

## OverviewA professional full-stack web application that uses AI to detect ingredients from fridge photos and suggests personalized recipes. Built with Flask (Python) backend, React frontend, Supabase database, and YOLO AI model for real-time ingredient detection.

**Recipe Recommenda** is an intelligent, AI-powered recipe recommendation system that transforms how you discover and cook meals. Simply scan ingredients with your camera or upload photos, and get personalized recipe suggestions tailored to your dietary preferences, skill level, and allergies.

## ✨ Features

## 🌟 Key Features

### 🔍 Core Functionality

### Core Functionality

- 📸 **Smart Ingredient Scanning**: Advanced YOLO v5 AI detects ingredients from photos- **AI-Powered Detection**: YOLO classification model trained on 36+ ingredient classes

- 🤖 **AI Recipe Recommendations**: Intelligent suggestions based on available ingredients- **Recipe Recommendations**: Personalized recipe suggestions based on detected ingredients

- 👤 **Personalized Profiles**: Custom dietary preferences and cooking skill levels- **User Profiles**: Account management with dietary restrictions and cooking skill levels

- 🚫 **Allergy Management**: Safe recipe filtering based on allergies and restrictions- **Mobile-Responsive**: Works seamlessly on desktop, tablet, and mobile devices

- ❤️ **Favorites System**: Save and organize your favorite recipes- **Real-time Processing**: Fast ingredient detection with confidence scoring

- 📱 **Responsive Design**: Seamless experience on desktop and mobile- **Secure Authentication**: JWT-based login system with Supabase integration

### Advanced Features### 🎯 Advanced Features

- 🎥 **Real-time Camera Scanning**: Live ingredient detection through your camera

- 🍎 **Nutritional Information**: Detailed macro and micronutrient data- **Dietary Filtering**: Recipes filtered by vegetarian, vegan, gluten-free preferences

- ⏱️ **Smart Filtering**: Filter by cooking time, difficulty, and dietary needs- **Skill-Based Recipes**: Suggestions matched to user's cooking experience level

- 🔐 **Secure Authentication**: Robust user accounts with password reset- **Favorite Recipes**: Save and manage favorite recipe collections

- 🔄 **Recipe Browsing**: Explore recipes with advanced search capabilities- **Scan History**: Track previous ingredient scans and results

- **Professional API**: RESTful endpoints for all application features

## 🚀 Quick Start

## 🏗️ Architecture Overview

### Option 1: Automated Setup (Recommended)

1. **Run the setup script**:```

   - Windows: Double-click `setup_recipe_recommenda.bat`ingredient_scanner_app/

   - macOS/Linux: Run `bash setup_recipe_recommenda.sh`├── backend/ # Flask API server with AI integration

├── frontend/ # React web application

2. **Configure your database**:├── model/ # YOLO AI model files

   - Create a Supabase account at https://supabase.com├── database/ # Supabase schema and sample data

   - Create a new project├── uploads/ # Image uploads (auto-created)

   - Import `SUPABASE_SCHEMA_COMPLETE.sql`└── results/ # Scan results (auto-created)

   - Update `backend/.env` with your credentials```

3. **Start the application**:**Tech Stack:**

   - Windows: Double-click `start_recipe_recommenda.bat`

   - macOS/Linux: Run `bash start_recipe_recommenda.sh`- **Backend**: Flask + Python 3.8+ with Supabase integration

- **Frontend**: React 18+ with styled-components and responsive design

### Option 2: Manual Setup- **Database**: Supabase (PostgreSQL) with Row Level Security

See `SETUP_INSTRUCTIONS.md` for detailed manual installation steps.- **AI Model**: YOLO classification for 36+ ingredient classes

- **Authentication**: JWT tokens with Supabase Auth

## 💻 Technology Stack

## 🥗 Supported Ingredients (36 Classes)

### Backend

- **Flask**: Lightweight Python web frameworkThe AI model can detect these ingredients:

- **Supabase**: Modern PostgreSQL database with real-time features

- **YOLO v5**: State-of-the-art computer vision for ingredient detection**Fruits**: Apple, Banana, Grapes, Kiwi, Lemon, Mango, Orange, Pear, Pineapple, Pomegranate, Watermelon

- **JWT Authentication**: Secure token-based user authentication

**Vegetables**: Beetroot, Bell Pepper, Cabbage, Capsicum, Carrot, Cauliflower, Chilli Pepper, Corn, Cucumber, Eggplant, Garlic, Ginger, Lettuce, Onion, Paprika, Peas, Potato, Radish, Spinach, Sweet Corn, Sweet Potato, Tomato, Turnip

### Frontend

- **React 18**: Modern JavaScript library with hooks and context**Legumes**: Soy Beans

- **Styled Components**: Dynamic CSS-in-JS styling solution

- **Framer Motion**: Smooth animations and transitions**Peppers**: Jalapeño

- **React Router v6**: Declarative routing for single-page applications

## � Prerequisites

### AI/Machine Learning

- **PyTorch**: Deep learning framework for model inferenceBefore starting, ensure you have the following installed:

- **OpenCV**: Computer vision preprocessing and image manipulation

- **Ultralytics YOLO**: Real-time object detection implementation- **Python 3.8+** with pip

- **Node.js 16+** with npm

## 📁 Project Architecture- **Git** (for cloning repository)

- **Supabase Account** (free tier works fine)

```

recipe_recommenda/## 🗄️ Database Setup (Supabase)

├── 🖥️ backend/                    # Flask API Server

│   ├── api/                       # RESTful API endpoints### Step 1: Create Supabase Project

│   ├── services/                  # Business logic layer

│   ├── utils/                     # Helper utilities1. Go to [supabase.com](https://supabase.com) and sign up/login

│   ├── app.py                     # Main Flask application2. Create a new project and note your:

│   └── requirements.txt           # Python dependencies   - Project URL: `https://your-project-id.supabase.co`

│   - Public Anon Key: `eyJhb...` (from Settings → API)

├── 🌐 frontend/                   # React Web Application   - Service Role Key: `eyJhb...` (optional, for advanced features)

│   ├── src/

│   │   ├── components/            # Reusable UI components### Step 2: Run Database Scripts

│   │   ├── pages/                 # Page-level components

│   │   ├── context/               # State management1. **Create Schema**: Go to Supabase SQL Editor

│   │   ├── services/              # API client services

│   │   └── styles/                # Global styling   - Copy contents of `database/supabase_schema.sql`

│   ├── public/                    # Static assets   - Paste and run to create all tables and policies

│   └── package.json               # Node.js dependencies

│2. **Add Sample Data**:

├── 🧠 model/                      # AI Model Files   - Copy contents of `database/sample_recipes.sql`

│   └── best.pt                    # Trained YOLO model   - Paste and run to populate with 15 sample recipes

│

├── 📁 uploads/                    # Image upload directory## 🔧 Backend Setup

├── 📊 results/                    # Processing results

└── 📋 *.sql                       # Database schema files### Step 1: Environment Setup

```

````bash

## 🛠️ Development# Navigate to backend directory

cd backend

### System Requirements

- **Python**: 3.8 or higher# Create and activate virtual environment

- **Node.js**: 14.x or higherpython -m venv venv

- **RAM**: 4GB minimum (8GB recommended for AI processing)

- **Storage**: 2GB free space# On Windows:

- **OS**: Windows 10+, macOS 10.15+, or Linux Ubuntu 18.04+venv\Scripts\activate



### Environment Setup# On macOS/Linux:

1. Backend configuration in `backend/.env`:source venv/bin/activate

   ```env

   SUPABASE_URL=your_supabase_project_url# Install dependencies

   SUPABASE_KEY=your_supabase_anon_keypip install -r requirements.txt

   JWT_SECRET_KEY=your_secure_jwt_secret```

   FLASK_ENV=development

   ```### Step 2: Environment Configuration



2. Frontend configuration in `frontend/.env`:Create `.env` file in `backend/` directory:

   ```env

   REACT_APP_API_URL=http://localhost:5000```env

   REACT_APP_ENVIRONMENT=development# Supabase Configuration

   ```SUPABASE_URL=https://your-project-id.supabase.co

SUPABASE_KEY=your-anon-public-key-here

### Running in DevelopmentSUPABASE_SERVICE_KEY=your-service-role-key-here

```bash

# Start backend server (Terminal 1)# Flask Configuration

cd backendFLASK_SECRET_KEY=your-super-secret-key-change-in-production

python app.pyFLASK_ENV=development

FLASK_DEBUG=True

# Start frontend development server (Terminal 2)

cd frontend# JWT Configuration

npm startJWT_SECRET_KEY=your-jwt-secret-key-change-in-production

```JWT_ACCESS_TOKEN_EXPIRES=3600



Access the application:# File Upload Settings

- **Frontend**: http://localhost:3000MAX_UPLOAD_SIZE=10485760

- **Backend API**: http://localhost:5000UPLOAD_FOLDER=../uploads

RESULTS_FOLDER=../results

## 🌐 API Reference

# Model Configuration

### AuthenticationMODEL_PATH=../model/best.pt

- `POST /api/auth/register` - Create new user accountCONFIDENCE_THRESHOLD=0.3

- `POST /api/auth/login` - User authenticationMAX_PREDICTIONS=5

- `GET /api/auth/me` - Get current user profile

- `POST /api/auth/reset-password` - Request password reset# CORS Configuration

- `PUT /api/auth/update-profile` - Update user informationALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

````

### Recipe Management

- `GET /api/recipes` - Browse recipes with filtering### Step 3: Run Backend Server

- `GET /api/recipes/{id}` - Get detailed recipe information

- `POST /api/recipes/recommend` - Get AI recommendations```bash

- `GET /api/user/favorites` - Retrieve user favorites# In backend/ directory with venv activated

- `POST /api/user/favorites` - Add recipe to favoritespython app.py

````

### Ingredient Scanning

- `POST /api/scan/upload` - Upload images for ingredient detectionBackend starts on `http://localhost:5000`

- `POST /api/scan/camera` - Real-time camera scanning

- `GET /api/scan/results/{id}` - Retrieve scan results## ⚛️ Frontend Setup



### User Management### Step 1: Install Dependencies

- `GET /api/user/allergies` - Get user allergy information

- `POST /api/user/allergies` - Add new allergy```bash

- `DELETE /api/user/allergies/{id}` - Remove allergy# Navigate to frontend directory

cd frontend

## 🎯 Usage Examples

# Install npm dependencies

### Basic Workflownpm install

1. **Register/Login**: Create an account or sign in```

2. **Set Preferences**: Configure dietary restrictions and allergies

3. **Scan Ingredients**: Take a photo of available ingredients### Step 2: Environment Configuration

4. **Get Recommendations**: Receive personalized recipe suggestions

5. **Cook & Enjoy**: Follow detailed cooking instructionsCreate `.env` file in `frontend/` directory:

6. **Save Favorites**: Keep track of recipes you love

```env

### Advanced Features# API Configuration

- **Real-time Scanning**: Use camera for live ingredient detectionREACT_APP_API_URL=http://localhost:5000

- **Recipe Filtering**: Search by cuisine, cooking time, or difficulty

- **Nutritional Tracking**: Monitor calories and nutritional content# Feature Flags

- **Profile Management**: Update dietary preferences and allergiesREACT_APP_ENABLE_CAMERA=true

````

## 🔧 Troubleshooting

### Step 3: Run Frontend Development Server

### Common Issues

1. **Port conflicts**: Change ports in configuration files```bash

2. **Database connection**: Verify Supabase credentials# In frontend/ directory

3. **Model loading errors**: Ensure `best.pt` file is presentnpm start

4. **CORS issues**: Check API URL configuration in frontend```

### Getting HelpFrontend starts on `http://localhost:3000`

- Check `SETUP_INSTRUCTIONS.md` for detailed setup guidance

- Review `PROJECT_INFO.md` for technical specifications## 🤖 AI Model Setup

- Examine browser developer console for frontend issues

- Check Flask console output for backend errorsPlace your trained YOLO model file at `model/best.pt`

## 📄 Documentation**Note:** The model file is not included due to size. Options:

- `SETUP_INSTRUCTIONS.md` - Complete installation guide

- `PROJECT_INFO.md` - Technical specifications and architecture1. Use your existing trained YOLO model

- `SUPABASE_SCHEMA_COMPLETE.sql` - Database schema2. Train new model with 36 ingredient classes

- `SUPABASE_SAMPLE_DATA.sql` - Sample data for testing3. Download compatible YOLO classification model

## 🚀 Deployment## 🚀 Running Complete Application

For production deployment, see the deployment section in `SETUP_INSTRUCTIONS.md`.

### Development Mode

## 🤝 Contributing

We welcome contributions! Please feel free to submit pull requests or create issues for bugs and feature requests.1. **Terminal 1 - Backend:**

## 📞 Support ```bash

For technical support or questions about Recipe Recommenda, please create an issue in the repository or refer to the documentation files. cd backend

venv\Scripts\activate # Windows

--- python app.py

````

**Recipe Recommenda** - *Discover your next favorite meal with AI* 🍽️✨
2. **Terminal 2 - Frontend:**

```bash
cd frontend
npm start
````

3. **Access Application:**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000`
   - Health Check: `http://localhost:5000/api/health`

## 📱 Application Features & Usage

### 🔐 User Registration/Login

1. **Create Account**: Register with email and password
2. **Profile Setup**: Set cooking skill level (Beginner/Intermediate/Advanced)
3. **Dietary Preferences**: Choose vegetarian, vegan, or gluten-free options
4. **Secure Login**: JWT-based authentication with session management

### 📸 Ingredient Scanning

1. **Upload Photo**: Take photo of fridge contents or upload existing image
2. **AI Detection**: YOLO model identifies ingredients with confidence scores
3. **Review Results**: Confirm or edit detected ingredients
4. **Save Scan**: Results saved to your scan history

### 🍳 Recipe Recommendations

1. **Smart Suggestions**: Recipes based on your detected ingredients
2. **Dietary Filtering**: Automatically filtered by your preferences
3. **Skill Matching**: Recipes matched to your cooking level
4. **Detailed View**: Full recipes with ingredients, instructions, and nutrition
5. **Save Favorites**: Bookmark recipes for easy access

### 👤 Profile Management

1. **Update Information**: Change personal details and preferences
2. **Scan History**: View previous ingredient scans and results
3. **Favorite Recipes**: Manage saved recipe collection
4. **Settings**: Adjust app preferences and account settings

## 🛠️ API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Ingredient Scanning

- `POST /api/scan` - Upload and scan ingredient image
- `GET /api/scan/history` - Get user's scan history
- `GET /api/scan/{scan_id}` - Get specific scan results

### Recipe Management

- `GET /api/recipes` - Get personalized recipe recommendations
- `GET /api/recipes/{recipe_id}` - Get specific recipe details
- `POST /api/recipes/{recipe_id}/favorite` - Add recipe to favorites
- `DELETE /api/recipes/{recipe_id}/favorite` - Remove from favorites
- `GET /api/recipes/favorites` - Get user's favorite recipes

### System

- `GET /api/health` - System health check
- `GET /api/ingredients` - Get supported ingredient classes

## ⚙️ Configuration Options

### Backend Configuration (`.env`)

**AI Model Settings:**

- `CONFIDENCE_THRESHOLD=0.3` - Minimum confidence for detection (0.1-0.9)
- `MAX_PREDICTIONS=5` - Maximum ingredients to return per scan
- `MODEL_PATH=../model/best.pt` - Path to YOLO model file

**Database Settings:**

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_KEY` - Public anon key from Supabase
- `SUPABASE_SERVICE_KEY` - Service role key (optional)

**Security Settings:**

- `JWT_SECRET_KEY` - Secret for JWT token signing
- `JWT_ACCESS_TOKEN_EXPIRES=3600` - Token expiry in seconds
- `FLASK_SECRET_KEY` - Flask session secret

### Frontend Configuration (`.env`)

**API Settings:**

- `REACT_APP_API_URL=http://localhost:5000` - Backend API URL
- `REACT_APP_ENABLE_CAMERA=true` - Enable camera features

## 🔧 Troubleshooting

### Backend Issues

**Port 5000 already in use:**

```bash
# Windows - Kill process using port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
sudo lsof -ti:5000 | xargs kill -9
```

**Module import errors:**

```bash
# Ensure virtual environment is activated
cd backend
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

**Database connection errors:**

- ✅ Check Supabase URL and keys in `.env`
- ✅ Verify database schema was created successfully
- ✅ Check Supabase project status in dashboard
- ✅ Ensure RLS policies are properly configured

**AI Model issues:**

- ✅ Verify `model/best.pt` exists in project root
- ✅ Check MODEL_PATH in backend `.env` file
- ✅ Ensure model file is not corrupted (~6MB expected)
- ✅ Install ultralytics package: `pip install ultralytics`

### Frontend Issues

**npm start fails:**

```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
npm start
```

**CORS errors:**

- ✅ Ensure backend is running on port 5000
- ✅ Check ALLOWED_ORIGINS in backend `.env`
- ✅ Verify frontend URL matches backend CORS settings

**Page not loading:**

- ✅ Check React dev server is running on port 3000
- ✅ Verify REACT_APP_API_URL in frontend `.env`
- ✅ Check browser console for JavaScript errors

### Database Issues

**Authentication errors:**

- ✅ Verify Supabase keys are correct
- ✅ Check RLS policies allow proper access
- ✅ Ensure user registration is working

**Recipe data missing:**

- ✅ Run `database/sample_recipes.sql` in Supabase SQL Editor
- ✅ Check if tables were created properly
- ✅ Verify foreign key relationships

### Performance Issues

**Slow AI detection:**

- ✅ Ensure adequate RAM (minimum 4GB recommended)
- ✅ Use smaller images for faster processing
- ✅ Consider GPU acceleration if available
- ✅ Adjust CONFIDENCE_THRESHOLD for faster results

**High memory usage:**

- ✅ Reduce MAX_PREDICTIONS in backend config
- ✅ Clear browser cache and temporary files
- ✅ Close unnecessary applications

## 📁 Project Structure

```
ingredient_scanner_app/
├── backend/                    # Flask API Server
│   ├── app.py                 # Main application entry point
│   ├── config.py              # Configuration management
│   ├── requirements.txt       # Python dependencies
│   ├── .env                   # Environment variables (create this)
│   ├── services/              # Business logic layer
│   │   ├── __init__.py
│   │   ├── database.py        # Supabase database operations
│   │   ├── auth.py           # Authentication service
│   │   ├── scanner.py        # AI model integration
│   │   └── recipe.py         # Recipe recommendation logic
│   ├── api/                   # API route handlers
│   │   ├── __init__.py
│   │   ├── auth.py           # Authentication routes
│   │   ├── scan.py           # Scanning endpoints
│   │   └── recipe.py         # Recipe endpoints
│   └── utils/                 # Utility functions
│       ├── __init__.py
│       ├── validators.py      # Input validation
│       └── helpers.py         # Helper functions
│
├── frontend/                   # React Web Application
│   ├── public/                # Static assets
│   ├── src/                   # React source code
│   │   ├── components/        # Reusable UI components
│   │   │   ├── Auth/         # Authentication components
│   │   │   ├── Common/       # Shared components
│   │   │   ├── Recipe/       # Recipe-related components
│   │   │   └── Scanner/      # Scanning components
│   │   ├── pages/            # Main page components
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Profile.js
│   │   │   └── Scanner.js
│   │   ├── context/          # React context providers
│   │   │   └── AuthContext.js
│   │   ├── services/         # API communication
│   │   │   └── api.js
│   │   ├── styles/           # Global styles
│   │   │   └── GlobalStyle.js
│   │   ├── App.js            # Main App component
│   │   └── index.js          # React entry point
│   ├── package.json          # Node.js dependencies
│   └── .env                  # Environment variables (create this)
│
├── database/                   # Database Schema & Data
│   ├── supabase_schema.sql    # Complete database schema
│   └── sample_recipes.sql     # Sample recipe data
│
├── model/                      # AI Model Files
│   └── best.pt               # YOLO classification model
│
├── uploads/                    # Image uploads (auto-created)
├── results/                    # Scan results (auto-created)
└── README.md                  # This documentation
```

## 🛠️ Technical Architecture

### Backend Stack

- **Framework**: Flask with Blueprint architecture
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **AI Integration**: YOLO classification via Ultralytics
- **Authentication**: JWT tokens with Supabase Auth
- **File Handling**: Secure image upload and processing
- **API Design**: RESTful endpoints with proper error handling

### Frontend Stack

- **Framework**: React 18+ with functional components and hooks
- **Styling**: Styled-components with responsive design system
- **Routing**: React Router with protected route guards
- **State Management**: Context API for authentication state
- **HTTP Client**: Axios with interceptors for API communication
- **UI/UX**: Mobile-first responsive design with professional styling

### Database Schema

- **Users**: Profile, preferences, authentication data
- **Ingredients**: Comprehensive ingredient catalog
- **Recipes**: Recipe details with nutrition and instructions
- **Recipe_Ingredients**: Many-to-many relationship mapping
- **Scans**: User scan history and results
- **User_Recipes**: Favorite recipe tracking
- **Dietary_Restrictions**: User dietary preferences
- **Cooking_Skills**: User skill level management

### AI Model Details

- **Type**: YOLOv8 Classification Model
- **Classes**: 36 ingredient categories
- **Input**: 224x224 RGB images
- **Output**: Ingredient predictions with confidence scores
- **Performance**: ~0.5-1.0 seconds per detection

## 🚢 Production Deployment

### Backend Deployment

1. **Environment Configuration:**

```bash
# Set production environment variables
FLASK_ENV=production
FLASK_DEBUG=False
SUPABASE_URL=https://your-prod-project.supabase.co
```

2. **Production WSGI Server:**

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Frontend Deployment

```bash
# Build production bundle
cd frontend
npm run build

# Deploy to static hosting (Netlify, Vercel, etc.)
# or serve locally:
npm install -g serve
serve -s build -l 3000
```

### Database Production Setup

- Use Supabase production instance
- Enable proper RLS policies for security
- Set up automated backups
- Configure connection pooling for scale

## 🧪 Testing

### Running Tests

```bash
# Backend tests
cd backend
python -m pytest tests/ -v

# Frontend tests
cd frontend
npm test

# Integration tests
python test_system.py
```

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Image upload and ingredient detection
- [ ] Recipe recommendations based on ingredients
- [ ] Favorite recipe management
- [ ] Profile updates and dietary preferences
- [ ] Mobile responsiveness across devices

## 🔮 Future Enhancements

- [ ] **Real-time Camera Scanning**: Live video feed integration
- [ ] **Nutrition Analysis**: Detailed nutritional information for recipes
- [ ] **Meal Planning**: Weekly meal planning based on available ingredients
- [ ] **Shopping Lists**: Generate shopping lists from recipe requirements
- [ ] **Social Features**: Share recipes and cooking tips with friends
- [ ] **Mobile App**: React Native app for iOS and Android
- [ ] **Advanced AI**: Freshness detection, quantity estimation
- [ ] **Voice Integration**: Voice commands for hands-free operation
- [ ] **Recipe Creation**: AI-powered recipe generation
- [ ] **Inventory Tracking**: Smart pantry management system

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork Repository**: Create your own fork of the project
2. **Create Branch**: `git checkout -b feature/amazing-feature`
3. **Make Changes**: Implement your feature or bug fix
4. **Run Tests**: Ensure all tests pass
5. **Commit Changes**: `git commit -m 'Add amazing feature'`
6. **Push Branch**: `git push origin feature/amazing-feature`
7. **Create PR**: Open a Pull Request with description

### Development Guidelines

- Follow existing code style and conventions
- Add tests for new functionality
- Update documentation as needed
- Use semantic commit messages
- Ensure mobile responsiveness for frontend changes

## 📊 System Requirements

### Minimum Requirements

- **Python**: 3.8+ with pip
- **Node.js**: 16+ with npm
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **Internet**: Stable connection for API calls

### Recommended Setup

- **OS**: Windows 10+, macOS 10.15+, Ubuntu 18.04+
- **RAM**: 8GB+ for optimal performance
- **CPU**: Multi-core processor recommended
- **Camera**: HD webcam or smartphone camera for best results

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support & Contact

For support and questions:

1. **Documentation**: Check this comprehensive README
2. **Issues**: Use GitHub Issues for bug reports
3. **Discussions**: Join GitHub Discussions for general questions
4. **Console Logs**: Check browser and terminal output for errors

### Quick Debugging Steps

1. Check all environment variables are set correctly
2. Verify Supabase database connection and schema
3. Ensure AI model file exists and is accessible
4. Test API endpoints individually using tools like Postman
5. Check browser console for frontend JavaScript errors

## 🎯 Key Success Metrics

The application successfully demonstrates:

- ✅ **Full-Stack Architecture**: Complete separation between frontend/backend
- ✅ **AI Integration**: Working YOLO model with ingredient detection
- ✅ **Database Design**: Comprehensive schema with proper relationships
- ✅ **Authentication**: Secure JWT-based user management
- ✅ **Mobile Responsiveness**: Works seamlessly on all device sizes
- ✅ **Recipe Matching**: Intelligent recipe suggestions based on ingredients
- ✅ **Production Ready**: Proper error handling, validation, and security

---

**🍽️ Happy Cooking with Smart Ingredient Detection! 🤖👨‍🍳👩‍🍳**

_Transform your cooking experience with AI-powered ingredient recognition and personalized recipe recommendations!_
