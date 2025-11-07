"""
Supabase Database Service
Handles all database operations using Supabase client
"""
import os
from typing import Dict, List, Optional, Any
from supabase import create_client, Client
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class SupabaseService:
    """Service class for Supabase database operations"""
    
    def __init__(self, supabase_url: str, supabase_key: str, service_key: str = None):
        """Initialize Supabase client"""
        self.supabase: Client = create_client(supabase_url, supabase_key)
        
        # Initialize admin client with service key if provided (for bypassing RLS)
        if service_key:
            self.admin_client: Client = create_client(supabase_url, service_key)
            logger.info("Supabase admin client initialized successfully")
        else:
            self.admin_client = None
            
        logger.info("Supabase client initialized successfully")
    
    # User Management
    def create_user_profile(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create user profile after authentication - uses admin client to bypass RLS"""
        try:
            # Use admin client if available to bypass RLS policies
            client = self.admin_client if self.admin_client else self.supabase
            response = client.table('users').insert(user_data).execute()
            return {'success': True, 'data': response.data}
        except Exception as e:
            logger.error(f"Error creating user profile: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def get_user_profile(self, user_id: str) -> Dict[str, Any]:
        """Get user profile by ID"""
        try:
            response = self.supabase.table('users').select('*').eq('user_id', user_id).execute()
            return {'success': True, 'data': response.data[0] if response.data else None}
        except Exception as e:
            logger.error(f"Error fetching user profile: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def update_user_profile(self, user_id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update user profile"""
        try:
            response = self.supabase.table('users').update(update_data).eq('user_id', user_id).execute()
            return {'success': True, 'data': response.data}
        except Exception as e:
            logger.error(f"Error updating user profile: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    # Ingredient Management
    def get_all_ingredients(self) -> Dict[str, Any]:
        """Get all available ingredients"""
        try:
            response = self.supabase.table('ingredients').select('*').order('name').execute()
            return {'success': True, 'data': response.data}
        except Exception as e:
            logger.error(f"Error fetching ingredients: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def get_ingredient_by_name(self, name: str) -> Dict[str, Any]:
        """Get ingredient by name"""
        try:
            response = self.supabase.table('ingredients').select('*').eq('name', name).execute()
            return {'success': True, 'data': response.data[0] if response.data else None}
        except Exception as e:
            logger.error(f"Error fetching ingredient by name: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    # Recipe Management
    def get_recipes(self, limit: int = 50, offset: int = 0) -> Dict[str, Any]:
        """Get recipes with pagination"""
        try:
            response = (self.supabase.table('recipes')
                       .select('*, recipe_ingredients(*, ingredients(*))')
                       .range(offset, offset + limit - 1)
                       .order('created_at', desc=True)
                       .execute())
            return {'success': True, 'data': response.data}
        except Exception as e:
            logger.error(f"Error fetching recipes: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def get_recipe_by_id(self, recipe_id: int) -> Dict[str, Any]:
        """Get recipe by ID with ingredients"""
        try:
            response = (self.supabase.table('recipes')
                       .select('*, recipe_ingredients(*, ingredients(*))')
                       .eq('recipe_id', recipe_id)
                       .execute())
            return {'success': True, 'data': response.data[0] if response.data else None}
        except Exception as e:
            logger.error(f"Error fetching recipe: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def create_recipe(self, recipe_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create new recipe"""
        try:
            # Insert recipe
            recipe_response = self.supabase.table('recipes').insert({
                'user_id': recipe_data.get('user_id'),
                'title': recipe_data.get('title'),
                'instructions': recipe_data.get('instructions'),
                'prep_time_mins': recipe_data.get('prep_time_mins'),
                'cook_time_mins': recipe_data.get('cook_time_mins'),
                'difficulty': recipe_data.get('difficulty', 'easy'),
                'servings': recipe_data.get('servings', 4)
            }).execute()
            
            recipe_id = recipe_response.data[0]['recipe_id']
            
            # Insert recipe ingredients
            if 'ingredients' in recipe_data:
                ingredient_inserts = []
                for ingredient in recipe_data['ingredients']:
                    ingredient_inserts.append({
                        'recipe_id': recipe_id,
                        'ingredient_id': ingredient['ingredient_id'],
                        'quantity': ingredient.get('quantity'),
                        'unit': ingredient.get('unit')
                    })
                
                if ingredient_inserts:
                    self.supabase.table('recipe_ingredients').insert(ingredient_inserts).execute()
            
            return {'success': True, 'data': {'recipe_id': recipe_id}}
        except Exception as e:
            logger.error(f"Error creating recipe: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def search_recipes_by_ingredients(self, ingredient_ids: List[int], user_id: str, 
                                          min_match_percentage: float = 0.5) -> Dict[str, Any]:
        """Find recipes based on available ingredients"""
        try:
            # Use the stored function for recipe matching
            response = self.supabase.rpc('find_recipes_by_ingredients', {
                'user_uuid': user_id,
                'min_match_percentage': min_match_percentage
            }).execute()
            return {'success': True, 'data': response.data}
        except Exception as e:
            logger.error(f"Error searching recipes by ingredients: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    # User Favorites
    def add_favorite(self, user_id: str, recipe_id: int) -> Dict[str, Any]:
        """Add recipe to user favorites"""
        try:
            response = self.supabase.table('user_favorites').insert({
                'user_id': user_id,
                'recipe_id': recipe_id
            }).execute()
            return {'success': True, 'data': response.data}
        except Exception as e:
            logger.error(f"Error adding favorite: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def remove_favorite(self, user_id: str, recipe_id: int) -> Dict[str, Any]:
        """Remove recipe from user favorites"""
        try:
            response = (self.supabase.table('user_favorites')
                       .delete()
                       .eq('user_id', user_id)
                       .eq('recipe_id', recipe_id)
                       .execute())
            return {'success': True, 'data': response.data}
        except Exception as e:
            logger.error(f"Error removing favorite: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def get_user_favorites(self, user_id: str) -> Dict[str, Any]:
        """Get user's favorite recipes with full recipe details"""
        try:
            response = (self.supabase.table('user_favorites')
                       .select('favorite_id, added_at, recipes(recipe_id, title, instructions, prep_time_mins, cook_time_mins, servings, difficulty, created_at, recipe_ingredients(quantity, unit, ingredients(ingredient_id, name, category)))')
                       .eq('user_id', user_id)
                       .order('added_at', desc=True)
                       .execute())
            return {'success': True, 'data': response.data}
        except Exception as e:
            logger.error(f"Error fetching user favorites: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def check_if_recipe_favorited(self, user_id: str, recipe_id: int) -> Dict[str, Any]:
        """Check if a recipe is favorited by the user"""
        try:
            response = (self.supabase.table('user_favorites')
                       .select('favorite_id')
                       .eq('user_id', user_id)
                       .eq('recipe_id', recipe_id)
                       .execute())
            is_favorited = len(response.data) > 0
            return {'success': True, 'is_favorited': is_favorited}
        except Exception as e:
            logger.error(f"Error checking favorite status: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    # User Allergies
    def add_user_allergy(self, user_id: str, allergy_data: Dict[str, Any]) -> Dict[str, Any]:
        """Add user allergy"""
        try:
            allergy_data['user_id'] = user_id
            response = self.supabase.table('user_allergies').insert(allergy_data).execute()
            return {'success': True, 'data': response.data}
        except Exception as e:
            logger.error(f"Error adding user allergy: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def get_user_allergies(self, user_id: str) -> Dict[str, Any]:
        """Get user's allergies"""
        try:
            response = (self.supabase.table('user_allergies')
                       .select('*, ingredients(*)')
                       .eq('user_id', user_id)
                       .execute())
            return {'success': True, 'data': response.data}
        except Exception as e:
            logger.error(f"Error fetching user allergies: {str(e)}")
            return {'success': False, 'error': str(e)}

    def remove_user_allergy(self, user_id: str, allergy_id: int) -> Dict[str, Any]:
        """Remove user allergy"""
        try:
            response = (self.supabase.table('user_allergies')
                       .delete()
                       .eq('user_id', user_id)
                       .eq('allergy_id', allergy_id)
                       .execute())
            return {'success': True, 'data': response.data}
        except Exception as e:
            logger.error(f"Error removing user allergy: {str(e)}")
            return {'success': False, 'error': str(e)}

    def delete_user_account(self, user_id: str) -> Dict[str, Any]:
        """Delete user account and all associated data"""
        try:
            # Delete user profile (cascade will handle related data due to foreign key constraints)
            response = (self.supabase.table('users')
                       .delete()
                       .eq('user_id', user_id)
                       .execute())
            return {'success': True, 'data': response.data}
        except Exception as e:
            logger.error(f"Error deleting user account: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    # Fridge Scan Management
    def create_fridge_scan(self, scan_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create new fridge scan record"""
        try:
            response = self.supabase.table('fridge_scans').insert(scan_data).execute()
            return {'success': True, 'data': response.data[0]}
        except Exception as e:
            logger.error(f"Error creating fridge scan: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def save_detected_ingredients(self, scan_id: int, 
                                      detected_ingredients: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Save detected ingredients for a scan"""
        try:
            # Prepare ingredient inserts
            ingredient_inserts = []
            for detection in detected_ingredients:
                ingredient_inserts.append({
                    'scan_id': scan_id,
                    'ingredient_id': detection['ingredient_id'],
                    'confidence': detection['confidence'],
                    'quantity': detection.get('quantity'),
                    'freshness': detection.get('freshness', 'good')
                })
            
            response = self.supabase.table('detected_ingredients').insert(ingredient_inserts).execute()
            return {'success': True, 'data': response.data}
        except Exception as e:
            logger.error(f"Error saving detected ingredients: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def get_user_fridge_contents(self, user_id: str) -> Dict[str, Any]:
        """Get user's current fridge contents"""
        try:
            response = self.supabase.rpc('get_user_fridge_contents', {
                'user_uuid': user_id
            }).execute()
            return {'success': True, 'data': response.data}
        except Exception as e:
            logger.error(f"Error fetching fridge contents: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def get_user_scan_history(self, user_id: str, limit: int = 20) -> Dict[str, Any]:
        """Get user's scan history"""
        try:
            response = (self.supabase.table('fridge_scans')
                       .select('*, detected_ingredients(*, ingredients(*))')
                       .eq('user_id', user_id)
                       .order('scanned_at', desc=True)
                       .limit(limit)
                       .execute())
            return {'success': True, 'data': response.data}
        except Exception as e:
            logger.error(f"Error fetching scan history: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def search_recipes_advanced(self, filters: Dict[str, Any] = None, 
                               sort_by: str = 'title', sort_order: str = 'asc',
                               page: int = 1, limit: int = 20) -> Dict[str, Any]:
        """Advanced recipe search with filtering and sorting"""
        try:
            if filters is None:
                filters = {}
            
            # Start building the query - only use columns that exist
            query = (self.supabase.table('recipes')
                    .select('recipe_id, title, prep_time_mins, cook_time_mins, servings, difficulty, created_at', count='exact'))
            
            # Apply text search filter
            if 'search' in filters and filters['search']:
                search_term = filters['search']
                # Search only in title since description column doesn't exist
                query = query.ilike('title', f'%{search_term}%')
            
            # Note: Category filtering disabled as column doesn't exist
            # if 'category' in filters and filters['category']:
            #     query = query.eq('category', filters['category'])
            
            # Apply difficulty filter
            if 'difficulty' in filters and filters['difficulty']:
                query = query.eq('difficulty', filters['difficulty'])
            
            # Note: Dietary restrictions filtering disabled as column doesn't exist
            # if 'dietary_restriction' in filters and filters['dietary_restriction']:
            #     restriction = filters['dietary_restriction']
            #     if restriction == 'vegetarian':
            #         query = query.or_('dietary_restrictions.cs.{vegetarian},dietary_restrictions.cs.{vegan}')
            #     elif restriction == 'vegan':
            #         query = query.cs('dietary_restrictions', f'{{{restriction}}}')
            #     else:
            #         query = query.cs('dietary_restrictions', f'{{{restriction}}}')
            
            # Apply max time filter (prep_time + cook_time)
            if 'max_total_time' in filters and filters['max_total_time']:
                max_time = filters['max_total_time']
                # Use an RPC call or handle this in a more complex way
                # For now, we'll filter on prep_time only as an approximation
                query = query.lte('prep_time_mins', max_time)
            
            # Apply sorting
            valid_sort_fields = ['title', 'prep_time_mins', 'cook_time_mins', 'difficulty', 'servings', 'created_at']
            if sort_by not in valid_sort_fields:
                sort_by = 'title'
            
            desc = sort_order.lower() == 'desc'
            query = query.order(sort_by, desc=desc)
            
            # Apply pagination
            offset = (page - 1) * limit
            query = query.range(offset, offset + limit - 1)
            
            # Execute query
            response = query.execute()
            
            # Process the results and fetch ingredients separately
            recipes = []
            if response.data:
                for recipe in response.data:
                    # Fetch ingredients for this recipe separately
                    ingredients = []
                    try:
                        ingredients_response = (self.supabase.table('recipe_ingredients')
                                             .select('ingredients(ingredient_id, name)')
                                             .eq('recipe_id', recipe['recipe_id'])
                                             .execute())
                        
                        if ingredients_response.data:
                            for ri in ingredients_response.data:
                                if ri.get('ingredients'):
                                    ingredients.append({
                                        'ingredient_id': ri['ingredients']['ingredient_id'],
                                        'name': ri['ingredients']['name']
                                    })
                    except Exception as ingredient_error:
                        logger.warning(f"Could not fetch ingredients for recipe {recipe['recipe_id']}: {ingredient_error}")
                    
                    # Calculate total time
                    prep_time = recipe.get('prep_time_mins', 0) or 0
                    cook_time = recipe.get('cook_time_mins', 0) or 0
                    total_time = prep_time + cook_time
                    
                    processed_recipe = {
                        'recipe_id': recipe['recipe_id'],
                        'title': recipe['title'],
                        'description': f"Delicious {recipe['title'].lower()} recipe",  # Generate description from title
                        'prep_time_mins': prep_time,
                        'cook_time_mins': cook_time,
                        'total_time_mins': total_time,
                        'servings': recipe.get('servings'),
                        'difficulty': recipe.get('difficulty', 'easy'),
                        'category': None,  # Column doesn't exist in current schema  
                        'dietary_restrictions': [],  # Column doesn't exist in current schema
                        'ingredients': ingredients,
                        'created_at': recipe.get('created_at')
                    }
                    recipes.append(processed_recipe)
            
            # Get total count from the response
            total_count = getattr(response, 'count', len(recipes))
            
            return {
                'success': True, 
                'data': recipes, 
                'total_count': total_count
            }
            
        except Exception as e:
            logger.error(f"Error in advanced recipe search: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def get_all_recipes_simple(self, page: int = 1, limit: int = 20) -> Dict[str, Any]:
        """Get all recipes with basic information for debugging"""
        try:
            offset = (page - 1) * limit
            
            response = (self.supabase.table('recipes')
                       .select('recipe_id, title, prep_time_mins, cook_time_mins, servings, difficulty, created_at', count='exact')
                       .order('created_at', desc=True)
                       .range(offset, offset + limit - 1)
                       .execute())
            
            recipes = []
            if response.data:
                for recipe in response.data:
                    prep_time = recipe.get('prep_time_mins', 0) or 0
                    cook_time = recipe.get('cook_time_mins', 0) or 0
                    total_time = prep_time + cook_time
                    
                    processed_recipe = {
                        'recipe_id': recipe['recipe_id'],
                        'title': recipe['title'],
                        'description': f"Delicious {recipe['title'].lower()} recipe",  # Generate description from title
                        'prep_time_mins': prep_time,
                        'cook_time_mins': cook_time,
                        'total_time_mins': total_time,
                        'servings': recipe.get('servings'),
                        'difficulty': recipe.get('difficulty', 'easy'),
                        'category': None,  # Column doesn't exist in current schema
                        'dietary_restrictions': [],  # Column doesn't exist in current schema
                        'ingredients': [],  # Will be populated separately if needed
                        'created_at': recipe.get('created_at')
                    }
                    recipes.append(processed_recipe)
            
            total_count = getattr(response, 'count', len(recipes))
            
            return {
                'success': True, 
                'data': recipes, 
                'total_count': total_count
            }
            
        except Exception as e:
            logger.error(f"Error getting simple recipes: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def get_recipes_with_ingredients(self, limit: int = 100) -> Dict[str, Any]:
        """Get recipes with their ingredients for recommendation filtering"""
        try:
            response = (self.supabase.table('recipes')
                       .select('recipe_id, title, prep_time_mins, cook_time_mins, servings, difficulty, created_at, recipe_ingredients(ingredient_id, quantity, unit, ingredients(ingredient_id, name, category))')
                       .order('created_at', desc=True)
                       .limit(limit)
                       .execute())
            
            recipes = []
            if response.data:
                for recipe in response.data:
                    prep_time = recipe.get('prep_time_mins', 0) or 0
                    cook_time = recipe.get('cook_time_mins', 0) or 0
                    total_time = prep_time + cook_time
                    
                    processed_recipe = {
                        'recipe_id': recipe['recipe_id'],
                        'title': recipe['title'],
                        'instructions': recipe.get('instructions', ''),
                        'prep_time_mins': prep_time,
                        'cook_time_mins': cook_time,
                        'total_time_mins': total_time,
                        'servings': recipe.get('servings'),
                        'difficulty': recipe.get('difficulty', 'easy'),
                        'recipe_ingredients': recipe.get('recipe_ingredients', []),
                        'created_at': recipe.get('created_at')
                    }
                    recipes.append(processed_recipe)
            
            return {
                'success': True, 
                'data': recipes
            }
            
        except Exception as e:
            logger.error(f"Error getting recipes with ingredients: {str(e)}")
            return {'success': False, 'error': str(e)}