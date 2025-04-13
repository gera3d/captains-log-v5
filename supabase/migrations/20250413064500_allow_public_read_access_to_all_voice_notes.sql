-- Migration: Allow public read access to all voice_notes
ALTER TABLE public.voice_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to all voice notes" ON public.voice_notes FOR SELECT USING (true);