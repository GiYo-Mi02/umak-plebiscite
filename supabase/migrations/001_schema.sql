-- ============================================================
-- UMAK PLEBISCITE — DATABASE SCHEMA
-- Constitutional Reform Student Voting Platform
-- University of Makati · Academic Year 2024–2025
-- ============================================================

-- ============================================================
-- TABLE: voters
-- Auto-populated via on_auth_user_created trigger.
-- Tracks whether a student has cast their ballot.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.voters (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT UNIQUE NOT NULL,
  has_voted  BOOLEAN DEFAULT FALSE NOT NULL,
  voted_at   TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.voters ENABLE ROW LEVEL SECURITY;

-- Students can read their own voter record
CREATE POLICY "voters_select_own"
  ON public.voters FOR SELECT
  USING (auth.uid() = id);

-- Students can insert their own voter record (backup for trigger)
CREATE POLICY "voters_insert_own"
  ON public.voters FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Students can update their own voter record
CREATE POLICY "voters_update_own"
  ON public.voters FOR UPDATE
  USING (auth.uid() = id);

-- Admins can read all voter records
CREATE POLICY "voters_select_admin"
  ON public.voters FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );


-- ============================================================
-- TABLE: votes
-- Stores actual ballot choices.
-- UNIQUE on voter_id = final DB-level guarantee against double votes.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.votes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voter_id   UUID UNIQUE NOT NULL REFERENCES public.voters(id) ON DELETE CASCADE,
  choice     TEXT NOT NULL CHECK (choice IN ('old', 'new')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Students can insert a vote only for themselves and only if they haven't voted
CREATE POLICY "votes_insert_own"
  ON public.votes FOR INSERT
  WITH CHECK (
    auth.uid() = voter_id
    AND NOT EXISTS (
      SELECT 1 FROM public.votes v WHERE v.voter_id = auth.uid()
    )
  );

-- Students can read their own vote
CREATE POLICY "votes_select_own"
  ON public.votes FOR SELECT
  USING (auth.uid() = voter_id);

-- Admins can read all votes (aggregate only, enforced at app level)
CREATE POLICY "votes_select_admin"
  ON public.votes FOR SELECT
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );


-- ============================================================
-- VIEW: vote_stats
-- Aggregated results for the admin dashboard.
-- Admins query this view — never the raw votes table directly.
-- ============================================================
CREATE OR REPLACE VIEW public.vote_stats AS
SELECT
  COUNT(*) FILTER (WHERE v.choice = 'old')  AS votes_old,
  COUNT(*) FILTER (WHERE v.choice = 'new')  AS votes_new,
  COUNT(*)                                   AS total_votes,
  (SELECT COUNT(*) FROM public.voters)       AS total_voters,
  CASE
    WHEN (SELECT COUNT(*) FROM public.voters) > 0
    THEN ROUND(
      COUNT(*)::NUMERIC / (SELECT COUNT(*) FROM public.voters)::NUMERIC * 100,
      2
    )
    ELSE 0
  END                                        AS participation_rate
FROM public.votes v;


-- ============================================================
-- FUNCTION: cast_vote(p_choice TEXT)
-- Atomic vote casting — SECURITY DEFINER runs as the DB owner.
-- Checks has_voted, inserts vote, updates voter in one transaction.
-- ============================================================
CREATE OR REPLACE FUNCTION public.cast_vote(p_choice TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_has_voted BOOLEAN;
BEGIN
  -- Get the authenticated user's ID
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'not_authenticated');
  END IF;

  -- Validate the choice
  IF p_choice NOT IN ('old', 'new') THEN
    RETURN json_build_object('success', false, 'error', 'invalid_choice');
  END IF;

  -- Lock the voter row and check if already voted
  SELECT has_voted INTO v_has_voted
  FROM public.voters
  WHERE id = v_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'voter_not_found');
  END IF;

  IF v_has_voted THEN
    RETURN json_build_object('success', false, 'error', 'already_voted');
  END IF;

  -- Insert the vote
  INSERT INTO public.votes (voter_id, choice)
  VALUES (v_user_id, p_choice);

  -- Mark the voter as having voted
  UPDATE public.voters
  SET has_voted = TRUE,
      voted_at  = NOW()
  WHERE id = v_user_id;

  RETURN json_build_object('success', true);
END;
$$;


-- ============================================================
-- TRIGGER: on_auth_user_created
-- Automatically inserts a row into voters when a new user signs up.
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.voters (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- GRANT: Allow the vote_stats view to be read by authenticated users
-- (RLS on underlying tables still enforces per-user access)
-- ============================================================
GRANT SELECT ON public.vote_stats TO authenticated;
GRANT SELECT ON public.voters TO authenticated;
GRANT SELECT, INSERT ON public.votes TO authenticated;
GRANT UPDATE ON public.voters TO authenticated;
GRANT EXECUTE ON FUNCTION public.cast_vote(TEXT) TO authenticated;
