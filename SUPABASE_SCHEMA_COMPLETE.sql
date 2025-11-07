-- ======================================================
-- INGREDIENT SCANNER APP - DATABASE SCHEMA
-- Copy and paste this ENTIRE script into Supabase SQL Editor
-- ======================================================

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.settings.jwt_secret" TO 'your-jwt-secret';

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- For additional password storage if needed
    skill_level VARCHAR(20) DEFAULT 'beginner' CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')),
    dietary_restrictions TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ingredients table (master list of all possible ingredients)
CREATE TABLE IF NOT EXISTS public.ingredients (
    ingredient_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    common_allergen BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipes table
CREATE TABLE IF NOT EXISTS public.recipes (
    recipe_id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(user_id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    instructions TEXT NOT NULL,
    prep_time_mins INTEGER,
    cook_time_mins INTEGER,
    difficulty VARCHAR(20) DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    servings INTEGER DEFAULT 4,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipe ingredients junction table
CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
    recipe_id INTEGER REFERENCES public.recipes(recipe_id) ON DELETE CASCADE,
    ingredient_id INTEGER REFERENCES public.ingredients(ingredient_id) ON DELETE CASCADE,
    quantity DECIMAL(10,2),
    unit VARCHAR(50),
    PRIMARY KEY (recipe_id, ingredient_id)
);

-- User favorites table
CREATE TABLE IF NOT EXISTS public.user_favorites (
    favorite_id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(user_id) ON DELETE CASCADE,
    recipe_id INTEGER REFERENCES public.recipes(recipe_id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, recipe_id)
);

-- User allergies table
CREATE TABLE IF NOT EXISTS public.user_allergies (
    allergy_id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(user_id) ON DELETE CASCADE,
    ingredient_id INTEGER REFERENCES public.ingredients(ingredient_id) ON DELETE CASCADE,
    severity VARCHAR(20) DEFAULT 'mild' CHECK (severity IN ('mild', 'moderate', 'severe')),
    symptoms TEXT,
    UNIQUE(user_id, ingredient_id)
);

-- Fridge scan sessions
CREATE TABLE IF NOT EXISTS public.fridge_scans (
    scan_id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(user_id) ON DELETE CASCADE,
    image_url TEXT,
    ai_confidence DECIMAL(3,2),
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Detected ingredients from fridge scans
CREATE TABLE IF NOT EXISTS public.detected_ingredients (
    detection_id SERIAL PRIMARY KEY,
    scan_id INTEGER REFERENCES public.fridge_scans(scan_id) ON DELETE CASCADE,
    ingredient_id INTEGER REFERENCES public.ingredients(ingredient_id) ON DELETE CASCADE,
    confidence DECIMAL(3,2) NOT NULL,
    quantity VARCHAR(50),
    freshness VARCHAR(20) DEFAULT 'good' CHECK (freshness IN ('excellent', 'good', 'fair', 'poor'))
);

-- Insert the 36 ingredients that the AI model can detect (with conflict handling)
INSERT INTO public.ingredients (name, category, common_allergen) VALUES
-- Fruits
('apple', 'fruit', false),
('banana', 'fruit', false),
('grapes', 'fruit', false),
('kiwi', 'fruit', false),
('lemon', 'fruit', false),
('mango', 'fruit', false),
('orange', 'fruit', false),
('pear', 'fruit', false),
('pineapple', 'fruit', false),
('pomegranate', 'fruit', false),
('watermelon', 'fruit', false),

-- Vegetables
('beetroot', 'vegetable', false),
('bell pepper', 'vegetable', false),
('cabbage', 'vegetable', false),
('capsicum', 'vegetable', false),
('carrot', 'vegetable', false),
('cauliflower', 'vegetable', false),
('chilli pepper', 'vegetable', false),
('corn', 'vegetable', false),
('cucumber', 'vegetable', false),
('eggplant', 'vegetable', false),
('garlic', 'vegetable', false),
('ginger', 'vegetable', false),
('jalepeno', 'vegetable', false),
('lettuce', 'vegetable', false),
('onion', 'vegetable', false),
('paprika', 'vegetable', false),
('peas', 'vegetable', false),
('potato', 'vegetable', false),
('raddish', 'vegetable', false),
('spinach', 'vegetable', false),
('sweetcorn', 'vegetable', false),
('sweetpotato', 'vegetable', false),
('tomato', 'vegetable', false),
('turnip', 'vegetable', false),

-- Legumes
('soy beans', 'legume', true)

ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON public.recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id ON public.recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_ingredient_id ON public.recipe_ingredients(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_allergies_user_id ON public.user_allergies(user_id);
CREATE INDEX IF NOT EXISTS idx_fridge_scans_user_id ON public.fridge_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_detected_ingredients_scan_id ON public.detected_ingredients(scan_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fridge_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detected_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Anyone can view recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can create recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can update own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can delete own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can view own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can manage own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can view own allergies" ON public.user_allergies;
DROP POLICY IF EXISTS "Users can manage own allergies" ON public.user_allergies;
DROP POLICY IF EXISTS "Users can view own scans" ON public.fridge_scans;
DROP POLICY IF EXISTS "Users can manage own scans" ON public.fridge_scans;
DROP POLICY IF EXISTS "Users can view own detected ingredients" ON public.detected_ingredients;
DROP POLICY IF EXISTS "Users can manage own detected ingredients" ON public.detected_ingredients;
DROP POLICY IF EXISTS "Anyone can view ingredients" ON public.ingredients;
DROP POLICY IF EXISTS "Anyone can view recipe ingredients" ON public.recipe_ingredients;

-- RLS Policies
-- Users can only see and modify their own data
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = user_id);

-- Recipes policies
CREATE POLICY "Anyone can view recipes" ON public.recipes
    FOR SELECT USING (true);

CREATE POLICY "Users can create recipes" ON public.recipes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipes" ON public.recipes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes" ON public.recipes
    FOR DELETE USING (auth.uid() = user_id);

-- User favorites policies
CREATE POLICY "Users can view own favorites" ON public.user_favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own favorites" ON public.user_favorites
    FOR ALL USING (auth.uid() = user_id);

-- User allergies policies
CREATE POLICY "Users can view own allergies" ON public.user_allergies
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own allergies" ON public.user_allergies
    FOR ALL USING (auth.uid() = user_id);

-- Fridge scans policies
CREATE POLICY "Users can view own scans" ON public.fridge_scans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own scans" ON public.fridge_scans
    FOR ALL USING (auth.uid() = user_id);

-- Detected ingredients policies (inherit from fridge_scans)
CREATE POLICY "Users can view own detected ingredients" ON public.detected_ingredients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.fridge_scans 
            WHERE fridge_scans.scan_id = detected_ingredients.scan_id 
            AND fridge_scans.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own detected ingredients" ON public.detected_ingredients
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.fridge_scans 
            WHERE fridge_scans.scan_id = detected_ingredients.scan_id 
            AND fridge_scans.user_id = auth.uid()
        )
    );

-- Public read access for ingredients and recipe_ingredients (these are reference data)
CREATE POLICY "Anyone can view ingredients" ON public.ingredients
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view recipe ingredients" ON public.recipe_ingredients
    FOR SELECT USING (true);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;

-- Create trigger for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get user's current fridge contents
CREATE OR REPLACE FUNCTION get_user_fridge_contents(user_uuid UUID)
RETURNS TABLE (
    ingredient_name TEXT,
    quantity TEXT,
    freshness TEXT,
    confidence DECIMAL,
    last_scanned TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.name::TEXT,
        di.quantity::TEXT,
        di.freshness::TEXT,
        di.confidence,
        fs.scanned_at
    FROM public.detected_ingredients di
    JOIN public.fridge_scans fs ON di.scan_id = fs.scan_id
    JOIN public.ingredients i ON di.ingredient_id = i.ingredient_id
    WHERE fs.user_id = user_uuid 
    AND fs.is_active = true
    ORDER BY fs.scanned_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to find recipes based on available ingredients
CREATE OR REPLACE FUNCTION find_recipes_by_ingredients(
    user_uuid UUID,
    min_match_percentage DECIMAL DEFAULT 0.5
)
RETURNS TABLE (
    recipe_id INTEGER,
    title TEXT,
    match_percentage DECIMAL,
    missing_ingredients TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    WITH user_ingredients AS (
        SELECT DISTINCT di.ingredient_id
        FROM public.detected_ingredients di
        JOIN public.fridge_scans fs ON di.scan_id = fs.scan_id
        WHERE fs.user_id = user_uuid AND fs.is_active = true
    ),
    recipe_matches AS (
        SELECT 
            r.recipe_id,
            r.title::TEXT,
            COUNT(ri.ingredient_id) as total_ingredients,
            COUNT(ui.ingredient_id) as matched_ingredients,
            ROUND(
                COUNT(ui.ingredient_id)::DECIMAL / COUNT(ri.ingredient_id)::DECIMAL, 
                2
            ) as match_percentage
        FROM public.recipes r
        JOIN public.recipe_ingredients ri ON r.recipe_id = ri.recipe_id
        LEFT JOIN user_ingredients ui ON ri.ingredient_id = ui.ingredient_id
        GROUP BY r.recipe_id, r.title
        HAVING COUNT(ui.ingredient_id)::DECIMAL / COUNT(ri.ingredient_id)::DECIMAL >= min_match_percentage
    )
    SELECT 
        rm.recipe_id,
        rm.title,
        rm.match_percentage,
        ARRAY(
            SELECT i.name
            FROM public.recipe_ingredients ri2
            JOIN public.ingredients i ON ri2.ingredient_id = i.ingredient_id
            WHERE ri2.recipe_id = rm.recipe_id
            AND ri2.ingredient_id NOT IN (SELECT ingredient_id FROM user_ingredients)
        )::TEXT[] as missing_ingredients
    FROM recipe_matches rm
    ORDER BY rm.match_percentage DESC, rm.title;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ======================================================
-- SCHEMA CREATION COMPLETE!
-- Next, run the sample recipes script in a separate query
-- ======================================================