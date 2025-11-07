"""
Recipe API Routes
Handles recipe management and search
"""
from flask import Blueprint, request, jsonify
from services.database import SupabaseService
from services.auth import AuthService
from utils.helpers import format_ingredient_name
import logging

logger = logging.getLogger(__name__)

def create_recipe_routes(db_service: SupabaseService, auth_service: AuthService) -> Blueprint:
    """Create recipe routes blueprint"""
    
    recipe_bp = Blueprint('recipes', __name__, url_prefix='/api/recipes')
    
    def verify_token_middleware():
        """Middleware to verify JWT token"""
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None
        
        token = auth_header.split(' ')[1]
        payload = auth_service.verify_jwt_token(token)
        return payload
    
    @recipe_bp.route('/test', methods=['GET'])
    def test_recipes():
        """Test route to check if recipes can be fetched - no auth required"""
        try:
            logger.info("Testing recipe database connection")
            result = db_service.get_all_recipes_simple(1, 5)
            
            if result['success']:
                return jsonify({
                    'success': True,
                    'message': f'Found {len(result["data"])} recipes',
                    'sample_recipes': result['data'][:3],  # Return first 3 as sample
                    'total_count': result.get('total_count', len(result['data']))
                }), 200
            else:
                return jsonify({
                    'success': False,
                    'error': result['error']
                }), 400
                
        except Exception as e:
            logger.error(f"Test recipes error: {str(e)}")
            return jsonify({'success': False, 'error': str(e)}), 500
    
    @recipe_bp.route('/', methods=['GET'])
    def get_recipes():
        """Get recipes with pagination"""
        try:
            # Get query parameters
            page = request.args.get('page', 1, type=int)
            per_page = request.args.get('per_page', 20, type=int)
            per_page = min(per_page, 50)  # Max 50 per page
            
            # Try simple method first for better reliability
            result = db_service.get_all_recipes_simple(page, per_page)
            
            if not result['success']:
                # Fallback to original method
                offset = (page - 1) * per_page
                result = db_service.get_recipes(per_page, offset)
            
            if result['success']:
                # Format recipes
                recipes = []
                for recipe in result['data']:
                    ingredients = []
                    for ri in recipe.get('recipe_ingredients', []):
                        if ri.get('ingredients'):
                            ingredients.append({
                                'name': ri['ingredients']['name'],
                                'quantity': ri.get('quantity'),
                                'unit': ri.get('unit'),
                                'category': ri['ingredients'].get('category')
                            })
                    
                    recipes.append({
                        'recipe_id': recipe['recipe_id'],
                        'title': recipe['title'],
                        'instructions': recipe['instructions'],
                        'prep_time_mins': recipe.get('prep_time_mins'),
                        'cook_time_mins': recipe.get('cook_time_mins'),
                        'difficulty': recipe.get('difficulty'),
                        'servings': recipe.get('servings'),
                        'ingredients': ingredients,
                        'created_at': recipe.get('created_at')
                    })
                
                return jsonify({
                    'recipes': recipes,
                    'page': page,
                    'per_page': per_page,
                    'total': len(recipes)
                }), 200
            else:
                return jsonify({'error': result['error']}), 400
                
        except Exception as e:
            logger.error(f"Get recipes error: {str(e)}")
            return jsonify({'error': 'Internal server error'}), 500
    
    @recipe_bp.route('/<int:recipe_id>', methods=['GET'])
    def get_recipe_by_id(recipe_id):
        """Get specific recipe by ID"""
        try:
            result = db_service.get_recipe_by_id(recipe_id)
            
            if result['success'] and result['data']:
                recipe = result['data']
                
                # Format ingredients
                ingredients = []
                for ri in recipe.get('recipe_ingredients', []):
                    if ri.get('ingredients'):
                        ingredients.append({
                            'name': ri['ingredients']['name'],
                            'quantity': ri.get('quantity'),
                            'unit': ri.get('unit'),
                            'category': ri['ingredients'].get('category')
                        })
                
                formatted_recipe = {
                    'recipe_id': recipe['recipe_id'],
                    'title': recipe['title'],
                    'instructions': recipe['instructions'],
                    'prep_time_mins': recipe.get('prep_time_mins'),
                    'cook_time_mins': recipe.get('cook_time_mins'),
                    'difficulty': recipe.get('difficulty'),
                    'servings': recipe.get('servings'),
                    'ingredients': ingredients,
                    'created_at': recipe.get('created_at')
                }
                
                return jsonify(formatted_recipe), 200
            else:
                return jsonify({'error': 'Recipe not found'}), 404
                
        except Exception as e:
            logger.error(f"Get recipe error: {str(e)}")
            return jsonify({'error': 'Internal server error'}), 500
    
    @recipe_bp.route('/create', methods=['POST'])
    def create_recipe():
        """Create new recipe"""
        try:
            # Verify authentication
            payload = verify_token_middleware()
            if not payload:
                return jsonify({'error': 'Authentication required'}), 401
            
            user_id = payload['user_id']
            data = request.get_json()
            
            # Validate required fields
            required_fields = ['title', 'instructions', 'ingredients']
            for field in required_fields:
                if field not in data:
                    return jsonify({'error': f'Missing field: {field}'}), 400
            
            # Prepare recipe data
            recipe_data = {
                'user_id': user_id,
                'title': data['title'],
                'instructions': data['instructions'],
                'prep_time_mins': data.get('prep_time_mins'),
                'cook_time_mins': data.get('cook_time_mins'),
                'difficulty': data.get('difficulty', 'easy'),
                'servings': data.get('servings', 4),
                'ingredients': []
            }
            
            # Process ingredients
            for ingredient_data in data['ingredients']:
                if 'name' in ingredient_data:
                    # Get or create ingredient
                    ingredient_name = format_ingredient_name(ingredient_data['name'])
                    ingredient_result = db_service.get_ingredient_by_name(ingredient_name)
                    
                    if ingredient_result['success'] and ingredient_result['data']:
                        ingredient_id = ingredient_result['data']['ingredient_id']
                        recipe_data['ingredients'].append({
                            'ingredient_id': ingredient_id,
                            'quantity': ingredient_data.get('quantity'),
                            'unit': ingredient_data.get('unit')
                        })
            
            # Create recipe
            result = db_service.create_recipe(recipe_data)
            
            if result['success']:
                return jsonify({
                    'message': 'Recipe created successfully',
                    'recipe_id': result['data']['recipe_id']
                }), 201
            else:
                return jsonify({'error': result['error']}), 400
                
        except Exception as e:
            logger.error(f"Create recipe error: {str(e)}")
            return jsonify({'error': 'Internal server error'}), 500
    
    @recipe_bp.route('/search', methods=['POST'])
    def search_recipes():
        """Search recipes based on available ingredients"""
        try:
            # Verify authentication
            payload = verify_token_middleware()
            if not payload:
                return jsonify({'error': 'Authentication required'}), 401
            
            user_id = payload['user_id']
            data = request.get_json()
            
            # Get search parameters
            ingredient_names = data.get('ingredients', [])
            min_match_percentage = data.get('min_match_percentage', 0.5)
            
            # Get ingredient IDs
            ingredient_ids = []
            if ingredient_names:
                for name in ingredient_names:
                    formatted_name = format_ingredient_name(name)
                    ingredient_result = db_service.get_ingredient_by_name(formatted_name)
                    
                    if ingredient_result['success'] and ingredient_result['data']:
                        ingredient_ids.append(ingredient_result['data']['ingredient_id'])
            
            # Search recipes
            if ingredient_ids:
                result = db_service.search_recipes_by_ingredients(
                    ingredient_ids, user_id, min_match_percentage
                )
            else:
                # If no specific ingredients, use fridge contents
                result = db_service.search_recipes_by_ingredients(
                    [], user_id, min_match_percentage
                )
            
            if result['success']:
                return jsonify({
                    'recipes': result['data'],
                    'search_criteria': {
                        'ingredients': ingredient_names,
                        'min_match_percentage': min_match_percentage
                    }
                }), 200
            else:
                return jsonify({'error': result['error']}), 400
                
        except Exception as e:
            logger.error(f"Search recipes error: {str(e)}")
            return jsonify({'error': 'Internal server error'}), 500
    
    @recipe_bp.route('/search', methods=['GET'])
    def search_recipes_advanced():
        """Advanced recipe search with filtering and sorting - no auth required for testing"""
        try:
            logger.info("Advanced recipe search requested")
            # Get query parameters
            page = int(request.args.get('page', 1))
            limit = int(request.args.get('limit', 20))
            search_query = request.args.get('search', '').strip()
            category = request.args.get('category', '').strip()
            difficulty = request.args.get('difficulty', '').strip()
            max_time = request.args.get('max_time')
            dietary_restriction = request.args.get('dietary_restriction', '').strip()
            sort_by = request.args.get('sort_by', 'title')
            sort_order = request.args.get('sort_order', 'asc')
            
            # Validate pagination
            if page < 1:
                page = 1
            if limit < 1 or limit > 100:
                limit = 20
                
            # Validate max_time
            if max_time:
                try:
                    max_time = int(max_time)
                    if max_time < 0:
                        max_time = None
                except ValueError:
                    max_time = None
            
            # Build search filters
            filters = {}
            
            if search_query:
                filters['search'] = search_query
            if category:
                filters['category'] = category
            if difficulty:
                filters['difficulty'] = difficulty
            if max_time:
                filters['max_total_time'] = max_time
            if dietary_restriction:
                filters['dietary_restriction'] = dietary_restriction
            
            # Execute search
            result = db_service.search_recipes_advanced(
                filters=filters,
                sort_by=sort_by,
                sort_order=sort_order,
                page=page,
                limit=limit
            )
            
            if result['success']:
                recipes = result['data']
                total_count = result.get('total_count', len(recipes))
                
                # Calculate pagination info
                total_pages = (total_count + limit - 1) // limit
                has_next = page < total_pages
                has_prev = page > 1
                
                return jsonify({
                    'recipes': recipes,
                    'pagination': {
                        'page': page,
                        'limit': limit,
                        'total': total_count,
                        'total_pages': total_pages,
                        'has_next': has_next,
                        'has_prev': has_prev
                    },
                    'filters_applied': filters
                }), 200
            else:
                return jsonify({'error': result['error']}), 400
                
        except Exception as e:
            logger.error(f"Advanced search error: {str(e)}")
            return jsonify({'error': 'Internal server error'}), 500
    
    @recipe_bp.route('/favorites', methods=['GET'])
    def get_favorites():
        """Get user's favorite recipes"""
        try:
            # Verify authentication
            payload = verify_token_middleware()
            if not payload:
                return jsonify({'error': 'Authentication required'}), 401
            
            user_id = payload['user_id']
            
            result = db_service.get_user_favorites(user_id)
            
            if result['success']:
                # Format favorites
                favorites = []
                for favorite in result['data']:
                    if favorite.get('recipes'):
                        recipe = favorite['recipes']
                        
                        # Format ingredients
                        ingredients = []
                        for ri in recipe.get('recipe_ingredients', []):
                            if ri.get('ingredients'):
                                ingredients.append({
                                    'name': ri['ingredients']['name'],
                                    'quantity': ri.get('quantity'),
                                    'unit': ri.get('unit'),
                                    'category': ri['ingredients'].get('category')
                                })
                        
                        favorites.append({
                            'favorite_id': favorite['favorite_id'],
                            'added_at': favorite['added_at'],
                            'recipe': {
                                'recipe_id': recipe['recipe_id'],
                                'title': recipe['title'],
                                'instructions': recipe['instructions'],
                                'prep_time_mins': recipe.get('prep_time_mins'),
                                'cook_time_mins': recipe.get('cook_time_mins'),
                                'difficulty': recipe.get('difficulty'),
                                'servings': recipe.get('servings'),
                                'ingredients': ingredients
                            }
                        })
                
                return jsonify({
                    'favorites': favorites,
                    'total': len(favorites)
                }), 200
            else:
                return jsonify({'error': result['error']}), 400
                
        except Exception as e:
            logger.error(f"Get favorites error: {str(e)}")
            return jsonify({'error': 'Internal server error'}), 500
    
    @recipe_bp.route('/favorites/<int:recipe_id>', methods=['POST'])
    def add_favorite(recipe_id):
        """Add recipe to favorites"""
        try:
            # Verify authentication
            payload = verify_token_middleware()
            if not payload:
                return jsonify({'error': 'Authentication required'}), 401
            
            user_id = payload['user_id']
            
            result = db_service.add_favorite(user_id, recipe_id)
            
            if result['success']:
                return jsonify({'message': 'Recipe added to favorites'}), 201
            else:
                return jsonify({'error': result['error']}), 400
                
        except Exception as e:
            logger.error(f"Add favorite error: {str(e)}")
            return jsonify({'error': 'Internal server error'}), 500
    
    @recipe_bp.route('/favorites/<int:recipe_id>', methods=['DELETE'])
    def remove_favorite(recipe_id):
        """Remove recipe from favorites"""
        try:
            # Verify authentication
            payload = verify_token_middleware()
            if not payload:
                return jsonify({'error': 'Authentication required'}), 401
            
            user_id = payload['user_id']
            
            result = db_service.remove_favorite(user_id, recipe_id)
            
            if result['success']:
                return jsonify({'message': 'Recipe removed from favorites'}), 200
            else:
                return jsonify({'error': result['error']}), 400
                
        except Exception as e:
            logger.error(f"Remove favorite error: {str(e)}")
            return jsonify({'error': 'Internal server error'}), 500
    
    @recipe_bp.route('/favorites/check/<int:recipe_id>', methods=['GET'])
    def check_favorite_status(recipe_id):
        """Check if recipe is favorited by user"""
        try:
            # Verify authentication
            payload = verify_token_middleware()
            if not payload:
                return jsonify({'error': 'Authentication required'}), 401
            
            user_id = payload['user_id']
            
            result = db_service.check_if_recipe_favorited(user_id, recipe_id)
            
            if result['success']:
                return jsonify({
                    'is_favorited': result['is_favorited'],
                    'recipe_id': recipe_id
                }), 200
            else:
                return jsonify({'error': result['error']}), 400
                
        except Exception as e:
            logger.error(f"Check favorite status error: {str(e)}")
            return jsonify({'error': 'Internal server error'}), 500
    
    @recipe_bp.route('/ingredients', methods=['GET'])
    def get_all_ingredients():
        """Get all available ingredients"""
        try:
            result = db_service.get_all_ingredients()
            
            if result['success']:
                return jsonify({
                    'ingredients': result['data'],
                    'total': len(result['data'])
                }), 200
            else:
                return jsonify({'error': result['error']}), 400
                
        except Exception as e:
            logger.error(f"Get ingredients error: {str(e)}")
            return jsonify({'error': 'Internal server error'}), 500
    
    @recipe_bp.route('/recommend', methods=['POST'])
    def recommend_recipes():
        """Recommend recipes based on scanned ingredients with confidence filtering"""
        try:
            # Verify authentication
            payload = verify_token_middleware()
            if not payload:
                return jsonify({'error': 'Authentication required'}), 401
            
            user_id = payload['user_id']
            data = request.get_json()
            
            # Get detected ingredients with confidence filtering
            detected_ingredients = data.get('detected_ingredients', [])
            confidence_threshold = data.get('confidence_threshold', 0.5)
            
            # Filter ingredients by confidence level
            high_confidence_ingredients = [
                ingredient for ingredient in detected_ingredients 
                if ingredient.get('confidence', 0) >= confidence_threshold
            ]
            
            if not high_confidence_ingredients:
                return jsonify({
                    'recommendations': [],
                    'message': f'No ingredients detected with confidence >= {confidence_threshold}',
                    'confidence_threshold': confidence_threshold
                }), 200
            
            # Get user profile for dietary restrictions and preferences (with fallback)
            dietary_restrictions = []
            skill_level = 'beginner'
            
            try:
                profile_result = db_service.get_user_profile(user_id)
                if profile_result and profile_result.get('success') and profile_result.get('data'):
                    dietary_restrictions = profile_result['data'].get('dietary_restrictions', []) or []
                    skill_level = profile_result['data'].get('skill_level', 'beginner') or 'beginner'
            except Exception as e:
                logger.warning(f"Could not fetch user profile, using defaults: {str(e)}")
                # Continue with default values
            
            # Get ingredient names for logging and response
            ingredient_names = []
            for ingredient in high_confidence_ingredients:
                name = ingredient.get('name', '')
                if name:
                    ingredient_names.append(name)
            
            logger.info(f"Processing recommendations for ingredients: {ingredient_names}")
            
            # Get all recipes with their ingredients for filtering
            logger.info("Getting recipes with ingredients for recommendation filtering")
            
            # Get recipes with their ingredients included
            recipes_with_ingredients_result = db_service.get_recipes_with_ingredients(limit=100)
            
            if recipes_with_ingredients_result['success'] and recipes_with_ingredients_result['data']:
                all_recipes = recipes_with_ingredients_result['data'] or []
                logger.info(f"Found {len(all_recipes)} recipes with ingredients for filtering")
            else:
                # Fallback to simple recipes
                logger.warning("Could not get recipes with ingredients, using simple method")
                all_recipes_result = db_service.get_all_recipes_simple(1, 50)
                if all_recipes_result['success']:
                    all_recipes = all_recipes_result['data'] or []
                else:
                    logger.error(f"Failed to get recipes: {all_recipes_result.get('error', 'Unknown error')}")
                    return jsonify({
                        'recommendations': [],
                        'message': 'Unable to fetch recipes at the moment. Please try again later.',
                        'high_confidence_ingredients': ingredient_names,
                        'error': 'Database connection issue'
                    }), 200
            
            # Filter recipes that contain the detected ingredients
            matching_recipes = []
            detected_ingredient_names_lower = [name.lower().strip() for name in ingredient_names]
            
            for recipe in all_recipes:
                try:
                    # Get recipe ingredients
                    recipe_ingredients = []
                    
                    # Check if recipe has ingredients data
                    if 'recipe_ingredients' in recipe and recipe['recipe_ingredients']:
                        for ri in recipe['recipe_ingredients']:
                            if ri.get('ingredients') and ri['ingredients'].get('name'):
                                ingredient_name = ri['ingredients']['name'].lower().strip()
                                recipe_ingredients.append(ingredient_name)
                    
                    # Check if any detected ingredient matches recipe ingredients
                    matches = []
                    for detected_ingredient in detected_ingredient_names_lower:
                        for recipe_ingredient in recipe_ingredients:
                            if (detected_ingredient in recipe_ingredient or 
                                recipe_ingredient in detected_ingredient or
                                detected_ingredient == recipe_ingredient):
                                matches.append(detected_ingredient)
                                break
                    
                    if matches:
                        # Calculate match percentage
                        match_percentage = len(matches) / max(len(detected_ingredient_names_lower), 1)
                        recipe['ingredient_matches'] = matches
                        recipe['match_percentage'] = match_percentage
                        matching_recipes.append(recipe)
                        logger.info(f"Recipe '{recipe.get('title', '')}' matches ingredients: {matches}")
                
                except Exception as e:
                    logger.warning(f"Error processing recipe {recipe.get('recipe_id', 'unknown')}: {str(e)}")
                    continue
            
            recipes = matching_recipes
            logger.info(f"Found {len(recipes)} recipes that contain detected ingredients")
                
            if recipes:
                # Score recipes based on ingredient matches
                scored_recipes = []
                
                for recipe in recipes:
                    try:
                        # Basic recipe info with safety checks
                        recipe_title = recipe.get('title', '') or ''
                        recipe_difficulty = recipe.get('difficulty', 'easy') or 'easy'
                        match_percentage = recipe.get('match_percentage', 0)
                        
                        # Scoring based on ingredient match percentage and difficulty
                        ingredient_score = match_percentage * 100  # Convert to percentage points
                        
                        difficulty_multiplier = 1.0
                        if skill_level == 'beginner' and recipe_difficulty.lower() == 'easy':
                            difficulty_multiplier = 1.2
                        elif skill_level == 'intermediate' and recipe_difficulty.lower() in ['easy', 'medium']:
                            difficulty_multiplier = 1.1
                        elif skill_level == 'beginner' and recipe_difficulty.lower() == 'hard':
                            difficulty_multiplier = 0.8
                        
                        final_score = ingredient_score * difficulty_multiplier
                        
                        # Prepare the recipe response
                        recipe_response = {
                            'recipe_id': recipe.get('recipe_id'),
                            'title': recipe_title,
                            'instructions': recipe.get('instructions', ''),
                            'prep_time_mins': recipe.get('prep_time_mins'),
                            'cook_time_mins': recipe.get('cook_time_mins'),
                            'total_time_mins': recipe.get('total_time_mins'),
                            'servings': recipe.get('servings'),
                            'difficulty': recipe_difficulty,
                            'recommendation_score': final_score,
                            'ingredient_match_percentage': match_percentage,
                            'matched_ingredients': recipe.get('ingredient_matches', []),
                            'created_at': recipe.get('created_at')
                        }
                        
                        scored_recipes.append(recipe_response)
                        
                    except Exception as e:
                        logger.warning(f"Error scoring recipe {recipe.get('recipe_id', 'unknown')}: {str(e)}")
                        continue
                
                # Sort by recommendation score (highest first)
                scored_recipes.sort(key=lambda x: x.get('recommendation_score', 0), reverse=True)
                
                # Limit to top recommendations
                top_recommendations = scored_recipes[:8]
                
                logger.info(f"Returning {len(top_recommendations)} filtered recipe recommendations")
                
                return jsonify({
                    'recommendations': top_recommendations,
                    'high_confidence_ingredients': [
                        {
                            'name': ing['name'],
                            'confidence': ing['confidence']
                        } for ing in high_confidence_ingredients
                    ],
                    'confidence_threshold': confidence_threshold,
                    'dietary_restrictions': dietary_restrictions,
                    'skill_level': skill_level,
                    'total_found': len(top_recommendations),
                    'total_recipes_checked': len(all_recipes),
                    'matching_recipes_found': len(recipes)
                }), 200
            else:
                return jsonify({
                    'recommendations': [],
                    'message': 'No matching recipes found',
                    'high_confidence_ingredients': ingredient_names
                }), 200
                
        except Exception as e:
            logger.error(f"Recipe recommendation error: {str(e)}")
            return jsonify({'error': 'Internal server error'}), 500
    
    return recipe_bp