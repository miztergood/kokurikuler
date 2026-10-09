CREATE OR REPLACE FUNCTION public.check_customer_email(p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  existing_user_id uuid;
BEGIN
  SELECT jsonb_build_object(
    'found', true,
    'is_claimed', ac.is_claimed,
    'name', ac.name
  ) INTO result
  FROM allowed_customers ac
  WHERE lower(ac.email) = lower(p_email)
  LIMIT 1;
  
  IF result IS NOT NULL THEN
    RETURN result;
  END IF;

  -- Fallback: check if user already exists in auth.users
  SELECT id INTO existing_user_id FROM auth.users WHERE lower(email) = lower(p_email) LIMIT 1;
  IF existing_user_id IS NOT NULL THEN
    RETURN jsonb_build_object('found', true, 'is_claimed', true, 'name', '');
  END IF;

  RETURN jsonb_build_object('found', false);
END;
$$;