-- Community Hub upgrade: categories, media references, threaded replies and weekly XP leaderboard.
-- Reuses the existing xp_ledger and gift_team_xp_v2 architecture; no XP table is created.

ALTER TABLE public.community_posts
  ADD COLUMN IF NOT EXISTS image_urls text[] NOT NULL DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS post_type text NOT NULL DEFAULT 'GENERAL';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'community_posts_post_type_check'
      AND conrelid = 'public.community_posts'::regclass
  ) THEN
    ALTER TABLE public.community_posts
      ADD CONSTRAINT community_posts_post_type_check
      CHECK (post_type IN ('WIN', 'SOS', 'TIP', 'GENERAL'));
  END IF;
END
$$;

ALTER TABLE public.community_comments
  ADD COLUMN IF NOT EXISTS parent_comment_id uuid
  REFERENCES public.community_comments(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS community_posts_team_type_created_idx
  ON public.community_posts (team_id, post_type, created_at DESC);

CREATE INDEX IF NOT EXISTS community_comments_post_parent_created_idx
  ON public.community_comments (post_id, parent_comment_id, created_at ASC);

CREATE OR REPLACE FUNCTION public.get_weekly_leaderboard_v1(p_team_id uuid)
RETURNS TABLE(user_id uuid, display_name text, weekly_xp bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT
    ledger.user_id,
    profile.display_name,
    SUM(ledger.xp_amount)::bigint AS weekly_xp
  FROM public.xp_ledger AS ledger
  JOIN public.profiles AS profile ON profile.id = ledger.user_id
  WHERE profile.primary_team_id = p_team_id
    AND p_team_id = private.current_team_id()
    AND profile.is_active = true
    AND ledger.xp_amount > 0
    AND ledger.created_at >= date_trunc('week', now())
  GROUP BY ledger.user_id, profile.display_name
  ORDER BY weekly_xp DESC, profile.display_name ASC
  LIMIT 5;
$$;

REVOKE ALL ON FUNCTION public.get_weekly_leaderboard_v1(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_weekly_leaderboard_v1(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_weekly_leaderboard_v1(uuid) TO authenticated;
