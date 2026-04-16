-- Migration: RLS Security & Performance Fixes
-- Date: 2026-04-16
--
-- Fixes three classes of issues identified by Supabase advisors:
--
-- [SECURITY] subscription_events had an INSERT policy with WITH CHECK (true)
--   applied to the public role — any authenticated user could self-insert fake
--   subscription events. service_role bypasses RLS automatically; no policy
--   was needed. Policy dropped.
--
-- [PERFORMANCE] All RLS policies called auth.uid() directly, causing
--   re-evaluation on every row. Replaced with (select auth.uid()) which
--   evaluates once per query.
--
-- [INTEGRITY] UPDATE policies on projects, templates, usage_tracking, and
--   user_profiles were missing WITH CHECK clauses. Without WITH CHECK, a
--   user could move a row outside their own ownership (e.g., change user_id
--   to someone else's). Added WITH CHECK = USING on all UPDATE policies.

-- ── user_profiles ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own profile"   ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;

CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- ── projects ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own projects"   ON public.projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;

CREATE POLICY "Users can view own projects"
  ON public.projects FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own projects"
  ON public.projects FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own projects"
  ON public.projects FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own projects"
  ON public.projects FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ── templates ─────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own templates"   ON public.templates;
DROP POLICY IF EXISTS "Users can insert own templates" ON public.templates;
DROP POLICY IF EXISTS "Users can update own templates" ON public.templates;
DROP POLICY IF EXISTS "Users can delete own templates" ON public.templates;

CREATE POLICY "Users can view own templates"
  ON public.templates FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own templates"
  ON public.templates FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own templates"
  ON public.templates FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own templates"
  ON public.templates FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ── usage_tracking ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own usage"   ON public.usage_tracking;
DROP POLICY IF EXISTS "Users can insert own usage" ON public.usage_tracking;
DROP POLICY IF EXISTS "Users can update own usage" ON public.usage_tracking;

CREATE POLICY "Users can view own usage"
  ON public.usage_tracking FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own usage"
  ON public.usage_tracking FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own usage"
  ON public.usage_tracking FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ── subscription_events ───────────────────────────────────────────────────────
-- Drop the insecure INSERT policy (public role, WITH CHECK true).
-- service_role bypasses RLS automatically — no INSERT policy needed.
DROP POLICY IF EXISTS "Service role can insert subscription events" ON public.subscription_events;

DROP POLICY IF EXISTS "Users can view own subscription events" ON public.subscription_events;

CREATE POLICY "Users can view own subscription events"
  ON public.subscription_events FOR SELECT
  USING ((select auth.uid()) = user_id);
