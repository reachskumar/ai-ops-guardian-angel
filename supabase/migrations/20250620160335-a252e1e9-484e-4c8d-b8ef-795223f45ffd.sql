
-- Update the store_credential function to handle potential conflicts better
CREATE OR REPLACE FUNCTION public.store_credential(account_id uuid, credential_key text, credential_value text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Insert or update the credential
  INSERT INTO public.cloud_account_credentials (account_id, key, value, created_at, updated_at)
  VALUES (account_id, credential_key, credential_value, now(), now())
  ON CONFLICT (account_id, key) 
  DO UPDATE SET 
    value = EXCLUDED.value,
    updated_at = now();
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error and re-raise with more context
    RAISE EXCEPTION 'Failed to store credential for account %: %', account_id, SQLERRM;
END;
$function$
