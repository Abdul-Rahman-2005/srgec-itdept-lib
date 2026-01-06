-- Create a function to lookup profile for login (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_profile_for_login(
  p_identifier text,
  p_role text
)
RETURNS TABLE (
  id uuid,
  name text,
  status user_status
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, name, status
  FROM profiles
  WHERE roll_or_faculty_id = p_identifier
    AND role = p_role::user_role
  LIMIT 1;
$$;