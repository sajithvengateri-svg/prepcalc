-- Anime avatar generation jobs table
CREATE TABLE IF NOT EXISTS public.anime_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'pending',
  style TEXT,
  mode TEXT DEFAULT 'standard',
  image_url TEXT,
  error TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.anime_jobs ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert jobs (no auth required for free feature)
CREATE POLICY "Anyone can insert anime_jobs"
  ON public.anime_jobs FOR INSERT
  WITH CHECK (true);

-- Allow anyone to read jobs (poll by job_id)
CREATE POLICY "Anyone can read anime_jobs"
  ON public.anime_jobs FOR SELECT
  USING (true);

-- Allow service role to update jobs (edge function uses service role key)
CREATE POLICY "Service can update anime_jobs"
  ON public.anime_jobs FOR UPDATE
  USING (true);
