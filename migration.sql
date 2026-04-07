-- ============================================================
-- MIGRATION: College Selection + Admin College Stats
-- Run this SQL in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Create the colleges table
CREATE TABLE public.colleges (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS and allow authenticated users to SELECT
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read colleges"
  ON public.colleges
  FOR SELECT
  TO authenticated
  USING (true);

-- 3. Seed colleges
INSERT INTO public.colleges (name) VALUES
  ('COLLEGE OF BUSINESS AND FINANCIAL SCIENCE'),
  ('COLLEGE OF COMPUTING AND INFORMATION SCIENCES'),
  ('COLLEGE OF CONSTRUCTION SCIENCES AND ENGINEERING'),
  ('COLLEGE OF GOVERNANCE AND PUBLIC POLICY'),
  ('COLLEGE OF HUMAN KINETICS'),
  ('COLLEGE OF INNOVATIVE TEACHER EDUCATION'),
  ('COLLEGE OF ENGINEERING TECHNOLOGY'),
  ('COLLEGE OF TOURISM AND HOSPITALITY MANAGEMENT'),
  ('INSTITUTE OF SOCIAL WORK'),
  ('INSTITUTE OF DISASTER AND EMERGENCY MANAGEMENT'),
  ('INSTITUTE OF ARTS AND DESIGN'),
  ('INSTITUTE OF ACCOUNTANCY'),
  ('INSTITUTE OF IMAGING HEALTH SCIENCES'),
  ('INSTITUTE OF NURSING'),
  ('INSTITUTE OF PHARMACY'),
  ('INSTITUTE OF PSYCHOLOGY');

-- 4. Alter voters table to add college columns
ALTER TABLE public.voters
  ADD COLUMN college_id INTEGER REFERENCES public.colleges(id),
  ADD COLUMN college_edits INTEGER DEFAULT 0 NOT NULL;

-- 5. Create the college registration stats view
CREATE OR REPLACE VIEW public.college_registration_stats AS
SELECT
  c.name AS college,
  COUNT(v.id) AS registered_count
FROM public.colleges c
LEFT JOIN public.voters v ON v.college_id = c.id
GROUP BY c.name
ORDER BY registered_count DESC;

GRANT SELECT ON public.college_registration_stats TO authenticated;

-- 6. Create the SECURITY DEFINER function to update a user's college
CREATE OR REPLACE FUNCTION public.update_user_college(p_college_id INTEGER)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_edits INTEGER;
BEGIN
  -- Get current edit count
  SELECT college_edits INTO v_edits
  FROM public.voters
  WHERE id = auth.uid();

  -- If no voter row found, return error
  IF v_edits IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Voter record not found.');
  END IF;

  -- Check edit limit
  IF v_edits >= 2 THEN
    RETURN json_build_object('success', false, 'error', 'Edit limit reached.');
  END IF;

  -- Update college
  UPDATE public.voters
  SET college_id = p_college_id,
      college_edits = college_edits + 1
  WHERE id = auth.uid();

  RETURN json_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_user_college(INTEGER) TO authenticated;
