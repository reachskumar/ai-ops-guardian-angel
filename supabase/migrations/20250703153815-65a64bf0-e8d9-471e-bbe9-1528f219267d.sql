-- Add service role INSERT permission for cloud_resources table
CREATE POLICY "Service role can insert cloud resources" 
ON public.cloud_resources 
FOR INSERT 
TO service_role
WITH CHECK (true);