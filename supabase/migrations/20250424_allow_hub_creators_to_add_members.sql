-- Migration: Allow hub creators to add initial members (including themselves)
CREATE POLICY "Allow hub creators to add initial members" ON public.hub_members 
FOR INSERT TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.hubs
    WHERE hubs.id = hub_members.hub_id AND hubs.creator_id = auth.uid()
  )
);