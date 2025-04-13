-- Migration: Allow public read access to all ideas
CREATE POLICY "Allow public read access to all ideas" ON public.saved_ideas FOR SELECT USING (true);