-- ORNIBREED SVILUPPO - AI FOTO + VIDEO (bozza non applicata)
-- Non eseguire sul progetto di produzione.
-- Quote contabilizzate sul server: 5 valutazioni per account al giorno (Europe/Rome).
BEGIN;

CREATE TABLE IF NOT EXISTS public.ob_ai_daily_quota (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_day date NOT NULL,
  used smallint NOT NULL DEFAULT 0 CHECK (used BETWEEN 0 AND 5),
  PRIMARY KEY (user_id,usage_day)
);
ALTER TABLE public.ob_ai_daily_quota ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ob_ai_quota_read_own ON public.ob_ai_daily_quota;
CREATE POLICY ob_ai_quota_read_own ON public.ob_ai_daily_quota
  FOR SELECT TO authenticated USING ((SELECT auth.uid())=user_id);
REVOKE ALL ON TABLE public.ob_ai_daily_quota FROM anon,authenticated;
GRANT SELECT ON TABLE public.ob_ai_daily_quota TO authenticated;

CREATE TABLE IF NOT EXISTS public.ob_ai_evaluations_v2 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  soggetto_id uuid NOT NULL REFERENCES public.soggetti(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  punteggio numeric CHECK (punteggio IS NULL OR punteggio BETWEEN 0 AND 100),
  criteri jsonb NOT NULL DEFAULT '[]'::jsonb,
  risultato jsonb NOT NULL DEFAULT '{}'::jsonb,
  foto_path text,
  video_path text,
  standard_status text NOT NULL DEFAULT 'INDICATIVA_DA_VALIDARE',
  model_name text
);
CREATE INDEX IF NOT EXISTS ob_ai_evaluations_v2_user_subject_idx
  ON public.ob_ai_evaluations_v2(user_id,soggetto_id,created_at DESC);
ALTER TABLE public.ob_ai_evaluations_v2 ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ob_ai_v2_read_own ON public.ob_ai_evaluations_v2;
CREATE POLICY ob_ai_v2_read_own ON public.ob_ai_evaluations_v2
  FOR SELECT TO authenticated USING ((SELECT auth.uid())=user_id);
REVOKE ALL ON TABLE public.ob_ai_evaluations_v2 FROM anon,authenticated;
GRANT SELECT ON TABLE public.ob_ai_evaluations_v2 TO authenticated;

-- Entrambi gli RPC sono riservati al backend service_role.
-- Mai esporre al frontend funzioni con parametro p_user_id arbitrario.
CREATE OR REPLACE FUNCTION public.ob_ai_reserve_slot(p_user_id uuid)
RETURNS TABLE(allowed boolean,usage_day date,used smallint,remaining smallint)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE d date := (now() AT TIME ZONE 'Europe/Rome')::date;
DECLARE n smallint;
BEGIN
  IF p_user_id IS NULL THEN RAISE EXCEPTION 'Identità mancante'; END IF;
  INSERT INTO public.ob_ai_daily_quota(user_id,usage_day,used)
  VALUES (p_user_id,d,1)
  ON CONFLICT(user_id,usage_day) DO UPDATE
     SET used=(public.ob_ai_daily_quota.used+1)::smallint
   WHERE public.ob_ai_daily_quota.used<5
  RETURNING public.ob_ai_daily_quota.used INTO n;
  IF n IS NULL THEN
    SELECT q.used INTO n FROM public.ob_ai_daily_quota q
     WHERE q.user_id=p_user_id AND q.usage_day=d;
    RETURN QUERY SELECT false,d,COALESCE(n,0)::smallint,0::smallint;
  ELSE
    RETURN QUERY SELECT true,d,n,(5-n)::smallint;
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.ob_ai_reserve_slot(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.ob_ai_reserve_slot(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.ob_ai_refund_slot(p_user_id uuid,p_day date)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.ob_ai_daily_quota AS q SET used=(q.used-1)::smallint
   WHERE q.user_id=p_user_id AND q.usage_day=p_day AND q.used>0;
END;
$$;
REVOKE ALL ON FUNCTION public.ob_ai_refund_slot(uuid,date) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.ob_ai_refund_slot(uuid,date) TO service_role;

-- Bucket privato; percorso: auth.uid()/soggetto_id/uuid.mp4
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
VALUES ('ob-ai-media','ob-ai-media',false,62914560,
  ARRAY['video/mp4','video/quicktime','video/webm']::text[])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS ob_ai_video_upload_own ON storage.objects;
CREATE POLICY ob_ai_video_upload_own ON storage.objects
FOR INSERT TO authenticated WITH CHECK (
  bucket_id='ob-ai-media'
  AND (storage.foldername(name))[1]=(SELECT auth.uid())::text
);
DROP POLICY IF EXISTS ob_ai_video_read_own ON storage.objects;
CREATE POLICY ob_ai_video_read_own ON storage.objects
FOR SELECT TO authenticated USING (
  bucket_id='ob-ai-media'
  AND (storage.foldername(name))[1]=(SELECT auth.uid())::text
);
DROP POLICY IF EXISTS ob_ai_video_delete_own ON storage.objects;
CREATE POLICY ob_ai_video_delete_own ON storage.objects
FOR DELETE TO authenticated USING (
  bucket_id='ob-ai-media'
  AND (storage.foldername(name))[1]=(SELECT auth.uid())::text
);

COMMIT;
-- Dopo l'applicazione su ambiente DEV:
-- SELECT tablename,rowsecurity FROM pg_tables WHERE tablename LIKE 'ob_ai_%';
-- SELECT proname,proacl FROM pg_proc WHERE proname IN ('ob_ai_reserve_slot','ob_ai_refund_slot');
