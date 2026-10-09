
-- Drop all existing RESTRICTIVE policies and recreate as PERMISSIVE

-- ============ profiles ============
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING ((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING ((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

-- ============ user_roles ============
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

CREATE POLICY "Users can view own role" ON public.user_roles
  FOR SELECT TO authenticated
  USING ((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update roles" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete roles" ON public.user_roles
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============ allowed_customers ============
DROP POLICY IF EXISTS "Admins can select customers" ON public.allowed_customers;
DROP POLICY IF EXISTS "Admins can insert customers" ON public.allowed_customers;
DROP POLICY IF EXISTS "Admins can update customers" ON public.allowed_customers;
DROP POLICY IF EXISTS "Admins can delete customers" ON public.allowed_customers;

CREATE POLICY "Admins can select customers" ON public.allowed_customers
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert customers" ON public.allowed_customers
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update customers" ON public.allowed_customers
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete customers" ON public.allowed_customers
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============ generation_logs ============
DROP POLICY IF EXISTS "Users can view own logs" ON public.generation_logs;
DROP POLICY IF EXISTS "Users can insert own logs" ON public.generation_logs;

CREATE POLICY "Users can view own logs" ON public.generation_logs
  FOR SELECT TO authenticated
  USING ((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert own logs" ON public.generation_logs
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ============ demo_api_keys ============
DROP POLICY IF EXISTS "Admins can select demo keys" ON public.demo_api_keys;
DROP POLICY IF EXISTS "Admins can insert demo keys" ON public.demo_api_keys;
DROP POLICY IF EXISTS "Admins can update demo keys" ON public.demo_api_keys;
DROP POLICY IF EXISTS "Admins can delete demo keys" ON public.demo_api_keys;

CREATE POLICY "Admins can select demo keys" ON public.demo_api_keys
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert demo keys" ON public.demo_api_keys
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update demo keys" ON public.demo_api_keys
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete demo keys" ON public.demo_api_keys
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
