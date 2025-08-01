
-- Fix the store_credential function parameter references
CREATE OR REPLACE FUNCTION public.store_credential(p_account_id uuid, p_credential_key text, p_credential_value text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Insert or update the credential using unambiguous parameter names
  INSERT INTO public.cloud_account_credentials (account_id, key, value, created_at, updated_at)
  VALUES (p_account_id, p_credential_key, p_credential_value, now(), now())
  ON CONFLICT (account_id, key) 
  DO UPDATE SET 
    value = EXCLUDED.value,
    updated_at = now();
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error and re-raise with more context
    RAISE EXCEPTION 'Failed to store credential for account %: %', p_account_id, SQLERRM;
END;
$function$
