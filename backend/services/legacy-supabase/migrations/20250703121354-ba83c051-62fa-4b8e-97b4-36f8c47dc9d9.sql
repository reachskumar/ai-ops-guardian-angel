-- Add INSERT and UPDATE permissions for cloud_resources table
CREATE POLICY "Users can insert cloud resources for their accounts" 
ON public.cloud_resources 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM users_cloud_accounts a 
    WHERE a.id = cloud_resources.cloud_account_id 
    AND a.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update cloud resources for their accounts" 
ON public.cloud_resources 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 
    FROM users_cloud_accounts a 
    WHERE a.id = cloud_resources.cloud_account_id 
    AND a.user_id = auth.uid()
  )
);