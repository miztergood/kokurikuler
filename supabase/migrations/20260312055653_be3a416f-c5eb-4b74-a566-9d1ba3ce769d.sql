CREATE OR REPLACE FUNCTION public.check_customer_email(p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  existing_user_id uuid;
  customer_name text;
  customer_claimed boolean;
BEGIN
  SELECT ac.is_claimed, ac.name
  INTO customer_claimed, customer_name
  FROM allowed_customers ac
  WHERE lower(ac.email) = lower(p_email)
  LIMIT 1;

  IF customer_name IS NOT NULL THEN
    IF NOT customer_claimed THEN
      SELECT id INTO existing_user_id FROM auth.users WHERE lower(email) = lower(p_email) LIMIT 1;
      IF existing_user_id IS NOT NULL THEN
        UPDATE allowed_customers SET is_claimed = true, claimed_at = now(), user_id = existing_user_id
        WHERE lower(email) = lower(p_email);
        RETURN jsonb_build_object('found', true, 'is_claimed', true, 'name', customer_name);
      END IF;
    END IF;
    RETURN jsonb_build_object('found', true, 'is_claimed', customer_claimed, 'name', customer_name);
  END IF;

  SELECT id INTO existing_user_id FROM auth.users WHERE lower(email) = lower(p_email) LIMIT 1;
  IF existing_user_id IS NOT NULL THEN
    RETURN jsonb_build_object('found', true, 'is_claimed', true, 'name', '');
  END IF;

  RETURN jsonb_build_object('found', false);
END;
$$;