
-- Drop all versions of the store_credential function
DROP FUNCTION IF EXISTS public.store_credential(uuid, text, text);
DROP FUNCTION IF EXISTS public.store_credential(account_id uuid, credential_key text, credential_value text);

-- Create the function with completely new parameter names
CREATE OR REPLACE FUNCTION public.store_credential(
  account_uuid uuid, 
  cred_key text, 
  cred_value text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Insert or update the credential using completely different parameter names
  INSERT INTO public.cloud_account_credentials (account_id, key, value, created_at, updated_at)
  VALUES (account_uuid, cred_key, cred_value, now(), now())
  ON CONFLICT (account_id, key) 
  DO UPDATE SET 
    value = EXCLUDED.value,
    updated_at = now();
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error and re-raise with more context
    RAISE EXCEPTION 'Failed to store credential for account %: %', account_uuid, SQLERRM;
END;
$function$;
