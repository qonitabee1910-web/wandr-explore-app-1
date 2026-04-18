
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vehicle-layouts',
  'vehicle-layouts',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public can view vehicle layouts"
ON storage.objects FOR SELECT
USING (bucket_id = 'vehicle-layouts');

CREATE POLICY "Admins can upload vehicle layouts"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'vehicle-layouts' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update vehicle layouts"
ON storage.objects FOR UPDATE
USING (bucket_id = 'vehicle-layouts' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete vehicle layouts"
ON storage.objects FOR DELETE
USING (bucket_id = 'vehicle-layouts' AND public.has_role(auth.uid(), 'admin'));
