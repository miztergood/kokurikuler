CREATE OR REPLACE FUNCTION public.check_customer_email(p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'found', true,
    'is_claimed', ac.is_claimed,
    'name', ac.name
  ) INTO result
  FROM allowed_customers ac
  WHERE lower(ac.email) = lower(p_email)
  LIMIT 1;
  
  IF result IS NULL THEN
    RETURN jsonb_build_object('found', false);
  END IF;
  
  RETURN result;
END;
$$;