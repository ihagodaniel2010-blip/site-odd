-- TEMPORARY: open read access to estimates while auth is disabled.
-- TODO: drop this policy when re-enabling admin auth.
CREATE POLICY "TEMP public read estimates"
ON public.estimate_requests
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "TEMP public update estimates"
ON public.estimate_requests
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "TEMP public delete estimates"
ON public.estimate_requests
FOR DELETE
TO anon, authenticated
USING (true);