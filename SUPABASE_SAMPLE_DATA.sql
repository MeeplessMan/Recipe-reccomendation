-- ======================================================
-- SAMPLE RECIPES DATA FOR INGREDIENT SCANNER APP
-- Run this AFTER the main schema has been applied successfully
-- ======================================================

-- Sample recipes with ingredients the AI model can recognize
INSERT INTO public.recipes (user_id, title, instructions, prep_time_mins, cook_time_mins, difficulty, servings) VALUES
-- Fruit-based recipes
(NULL, 'Classic Apple Pie', 
'1. Preheat oven to 425°F (220°C)
2. Peel and slice apples thinly
3. Mix apples with sugar, cinnamon, and flour
4. Roll out pie crust and place in pie dish
5. Add apple filling and top with second crust
6. Bake for 45-55 minutes until golden brown', 
30, 55, 'medium', 8),

(NULL, 'Banana Smoothie Bowl', 
'1. Blend frozen bananas with a splash of milk until smooth
2. Pour into bowl and top with sliced banana
3. Add granola, nuts, and seeds as desired
4. Drizzle with honey if needed
5. Serve immediately', 
5, 0, 'easy', 1),

(NULL, 'Mango Salsa', 
'1. Dice mango into small cubes
2. Finely chop onion and bell pepper
3. Mix with lime juice and cilantro
4. Season with salt and pepper
5. Let sit for 15 minutes before serving', 
15, 0, 'easy', 4),

-- Vegetable-focused recipes
(NULL, 'Roasted Carrot Soup', 
'1. Preheat oven to 400°F (200°C)
2. Cut carrots into chunks and roast for 25 minutes
3. Sauté onion and garlic until soft
4. Combine roasted carrots with onion mixture
5. Add vegetable broth and simmer 20 minutes
6. Blend until smooth and season to taste', 
15, 45, 'easy', 4),

(NULL, 'Stuffed Bell Peppers', 
'1. Cut tops off bell peppers and remove seeds
2. Sauté onion, garlic, and diced tomatoes
3. Mix with cooked rice and seasonings
4. Stuff peppers with mixture
5. Bake at 375°F (190°C) for 25-30 minutes', 
20, 30, 'medium', 4),

(NULL, 'Garlic Roasted Potatoes', 
'1. Wash and quarter potatoes
2. Toss with olive oil, minced garlic, and herbs
3. Season with salt and pepper
4. Roast at 425°F (220°C) for 35-40 minutes
5. Turn once halfway through cooking', 
10, 40, 'easy', 6),

(NULL, 'Fresh Garden Salad', 
'1. Wash and chop lettuce, tomatoes, and cucumber
2. Slice bell peppers and onions thinly
3. Combine all vegetables in large bowl
4. Drizzle with olive oil and lemon juice
5. Season with salt, pepper, and herbs', 
10, 0, 'easy', 4),

(NULL, 'Spicy Jalapeño Cornbread', 
'1. Preheat oven to 400°F (200°C)
2. Mix cornmeal, flour, sugar, and baking powder
3. Combine milk, eggs, and melted butter
4. Fold in diced jalapeños and corn kernels
5. Bake 20-25 minutes until golden', 
15, 25, 'medium', 8),

-- Mixed ingredient recipes
(NULL, 'Vegetable Stir Fry', 
'1. Heat oil in large wok or pan
2. Add garlic and ginger, stir for 30 seconds
3. Add harder vegetables first (carrots, bell peppers)
4. Add softer vegetables (spinach, tomatoes) last
5. Season with soy sauce and serve over rice', 
15, 10, 'easy', 4),

(NULL, 'Mediterranean Ratatouille', 
'1. Dice eggplant, tomatoes, bell peppers, and onion
2. Sauté onion and garlic until fragrant
3. Add eggplant and cook 5 minutes
4. Add peppers and tomatoes, simmer 30 minutes
5. Season with herbs and let flavors meld', 
20, 35, 'medium', 6),

(NULL, 'Fresh Fruit Salad', 
'1. Wash and prepare all fruits
2. Cut apple, pear, and orange into bite-sized pieces
3. Add grapes, banana slices, and mango chunks
4. Gently toss with lemon juice to prevent browning
5. Chill before serving', 
15, 0, 'easy', 6),

(NULL, 'Spicy Potato Curry', 
'1. Cut potatoes into cubes and boil until tender
2. Sauté onion, garlic, ginger, and chili peppers
3. Add tomatoes and cook until soft
4. Add cooked potatoes and simmer 15 minutes
5. Garnish with fresh cilantro', 
20, 25, 'medium', 4),

-- Simple single-ingredient focused recipes
(NULL, 'Caramelized Onions', 
'1. Slice onions thinly
2. Cook slowly in butter over low heat
3. Stir occasionally for 30-40 minutes
4. Season with salt when golden brown
5. Use as side dish or condiment', 
10, 40, 'easy', 4),

(NULL, 'Roasted Beets with Herbs', 
'1. Wrap whole beetroots in foil
2. Roast at 400°F (200°C) for 45-60 minutes
3. Let cool, then peel and slice
4. Drizzle with olive oil and herbs
5. Season with salt and pepper', 
10, 60, 'easy', 4),

(NULL, 'Grilled Corn on the Cob', 
'1. Remove silk but keep husks on corn
2. Soak in water for 30 minutes
3. Grill over medium heat for 15-20 minutes
4. Turn occasionally until kernels are tender
5. Serve with butter and seasonings', 
35, 20, 'easy', 4)

ON CONFLICT DO NOTHING;

-- Now add the recipe ingredients relationships
-- Get ingredient IDs and create relationships with error handling

-- Apple Pie ingredients
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 1, ingredient_id, 6, 'large' FROM public.ingredients WHERE name = 'apple'
ON CONFLICT DO NOTHING;

-- Banana Smoothie Bowl ingredients  
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 2, ingredient_id, 2, 'large' FROM public.ingredients WHERE name = 'banana'
ON CONFLICT DO NOTHING;

-- Mango Salsa ingredients
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 3, ingredient_id, 2, 'medium' FROM public.ingredients WHERE name = 'mango'
UNION ALL
SELECT 3, ingredient_id, 0.25, 'cup' FROM public.ingredients WHERE name = 'onion'
UNION ALL
SELECT 3, ingredient_id, 0.5, 'medium' FROM public.ingredients WHERE name = 'bell pepper'
ON CONFLICT DO NOTHING;

-- Roasted Carrot Soup ingredients
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 4, ingredient_id, 2, 'lbs' FROM public.ingredients WHERE name = 'carrot'
UNION ALL
SELECT 4, ingredient_id, 1, 'large' FROM public.ingredients WHERE name = 'onion'
UNION ALL
SELECT 4, ingredient_id, 3, 'cloves' FROM public.ingredients WHERE name = 'garlic'
ON CONFLICT DO NOTHING;

-- Stuffed Bell Peppers ingredients
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 5, ingredient_id, 4, 'large' FROM public.ingredients WHERE name = 'bell pepper'
UNION ALL
SELECT 5, ingredient_id, 1, 'medium' FROM public.ingredients WHERE name = 'onion'
UNION ALL
SELECT 5, ingredient_id, 2, 'cloves' FROM public.ingredients WHERE name = 'garlic'
UNION ALL
SELECT 5, ingredient_id, 2, 'medium' FROM public.ingredients WHERE name = 'tomato'
ON CONFLICT DO NOTHING;

-- Garlic Roasted Potatoes ingredients
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 6, ingredient_id, 3, 'lbs' FROM public.ingredients WHERE name = 'potato'
UNION ALL
SELECT 6, ingredient_id, 6, 'cloves' FROM public.ingredients WHERE name = 'garlic'
ON CONFLICT DO NOTHING;

-- Fresh Garden Salad ingredients
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 7, ingredient_id, 1, 'head' FROM public.ingredients WHERE name = 'lettuce'
UNION ALL
SELECT 7, ingredient_id, 2, 'large' FROM public.ingredients WHERE name = 'tomato'
UNION ALL
SELECT 7, ingredient_id, 1, 'large' FROM public.ingredients WHERE name = 'cucumber'
UNION ALL
SELECT 7, ingredient_id, 1, 'medium' FROM public.ingredients WHERE name = 'bell pepper'
UNION ALL
SELECT 7, ingredient_id, 0.25, 'medium' FROM public.ingredients WHERE name = 'onion'
ON CONFLICT DO NOTHING;

-- Spicy Jalapeño Cornbread ingredients
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 8, ingredient_id, 2, 'medium' FROM public.ingredients WHERE name = 'jalepeno'
UNION ALL
SELECT 8, ingredient_id, 1, 'cup' FROM public.ingredients WHERE name = 'corn'
ON CONFLICT DO NOTHING;

-- Vegetable Stir Fry ingredients
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 9, ingredient_id, 2, 'cloves' FROM public.ingredients WHERE name = 'garlic'
UNION ALL
SELECT 9, ingredient_id, 1, 'inch' FROM public.ingredients WHERE name = 'ginger'
UNION ALL
SELECT 9, ingredient_id, 2, 'large' FROM public.ingredients WHERE name = 'carrot'
UNION ALL
SELECT 9, ingredient_id, 1, 'large' FROM public.ingredients WHERE name = 'bell pepper'
UNION ALL
SELECT 9, ingredient_id, 2, 'cups' FROM public.ingredients WHERE name = 'spinach'
UNION ALL
SELECT 9, ingredient_id, 1, 'large' FROM public.ingredients WHERE name = 'tomato'
ON CONFLICT DO NOTHING;

-- Mediterranean Ratatouille ingredients
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 10, ingredient_id, 1, 'large' FROM public.ingredients WHERE name = 'eggplant'
UNION ALL
SELECT 10, ingredient_id, 3, 'large' FROM public.ingredients WHERE name = 'tomato'
UNION ALL
SELECT 10, ingredient_id, 2, 'large' FROM public.ingredients WHERE name = 'bell pepper'
UNION ALL
SELECT 10, ingredient_id, 1, 'large' FROM public.ingredients WHERE name = 'onion'
UNION ALL
SELECT 10, ingredient_id, 4, 'cloves' FROM public.ingredients WHERE name = 'garlic'
ON CONFLICT DO NOTHING;

-- Fresh Fruit Salad ingredients
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 11, ingredient_id, 2, 'large' FROM public.ingredients WHERE name = 'apple'
UNION ALL
SELECT 11, ingredient_id, 2, 'large' FROM public.ingredients WHERE name = 'pear'
UNION ALL
SELECT 11, ingredient_id, 2, 'large' FROM public.ingredients WHERE name = 'orange'
UNION ALL
SELECT 11, ingredient_id, 1, 'cup' FROM public.ingredients WHERE name = 'grapes'
UNION ALL
SELECT 11, ingredient_id, 2, 'large' FROM public.ingredients WHERE name = 'banana'
UNION ALL
SELECT 11, ingredient_id, 1, 'large' FROM public.ingredients WHERE name = 'mango'
ON CONFLICT DO NOTHING;

-- Spicy Potato Curry ingredients
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 12, ingredient_id, 4, 'large' FROM public.ingredients WHERE name = 'potato'
UNION ALL
SELECT 12, ingredient_id, 1, 'large' FROM public.ingredients WHERE name = 'onion'
UNION ALL
SELECT 12, ingredient_id, 3, 'cloves' FROM public.ingredients WHERE name = 'garlic'
UNION ALL
SELECT 12, ingredient_id, 1, 'inch' FROM public.ingredients WHERE name = 'ginger'
UNION ALL
SELECT 12, ingredient_id, 2, 'medium' FROM public.ingredients WHERE name = 'chilli pepper'
UNION ALL
SELECT 12, ingredient_id, 2, 'large' FROM public.ingredients WHERE name = 'tomato'
ON CONFLICT DO NOTHING;

-- Caramelized Onions ingredients
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 13, ingredient_id, 4, 'large' FROM public.ingredients WHERE name = 'onion'
ON CONFLICT DO NOTHING;

-- Roasted Beets with Herbs ingredients
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 14, ingredient_id, 4, 'medium' FROM public.ingredients WHERE name = 'beetroot'
ON CONFLICT DO NOTHING;

-- Grilled Corn on the Cob ingredients
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
SELECT 15, ingredient_id, 6, 'ears' FROM public.ingredients WHERE name = 'corn'
ON CONFLICT DO NOTHING;

-- ======================================================
-- SAMPLE RECIPES INSERTION COMPLETE!
-- Your database is now fully populated and ready to use
-- ======================================================