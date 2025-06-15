
-- Create shopping_plans table to store user shopping plans
CREATE TABLE public.shopping_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  frequency TEXT NOT NULL CHECK (frequency IN ('none', 'monthly', 'weekly', 'bi-weekly', 'custom')),
  custom_frequency_days INTEGER NULL,
  store_name TEXT NOT NULL,
  store_address TEXT,
  shopping_type TEXT NOT NULL CHECK (shopping_type IN ('pickup', 'delivery', 'instore')),
  delivery_address TEXT,
  pickup_time TEXT,
  estimated_total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  item_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure users can only see their own shopping plans
ALTER TABLE public.shopping_plans ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to SELECT their own shopping plans
CREATE POLICY "Users can view their own shopping plans" 
  ON public.shopping_plans 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to INSERT their own shopping plans
CREATE POLICY "Users can create their own shopping plans" 
  ON public.shopping_plans 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to UPDATE their own shopping plans
CREATE POLICY "Users can update their own shopping plans" 
  ON public.shopping_plans 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy that allows users to DELETE their own shopping plans
CREATE POLICY "Users can delete their own shopping plans" 
  ON public.shopping_plans 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_shopping_plans_updated_at
  BEFORE UPDATE ON public.shopping_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
