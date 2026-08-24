CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email1 TEXT NOT NULL,
  email2 TEXT NOT NULL,
  address TEXT NOT NULL,
  attachment_path TEXT,
  attachment_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.applications
  ADD CONSTRAINT applications_name_check CHECK (char_length(name) BETWEEN 1 AND 100),
  ADD CONSTRAINT applications_phone_check CHECK (phone ~ '^[0-9]{10}$'),
  ADD CONSTRAINT applications_email1_check CHECK (char_length(email1) BETWEEN 3 AND 255 AND position('@' in email1) > 1),
  ADD CONSTRAINT applications_email2_check CHECK (char_length(email2) BETWEEN 3 AND 255 AND position('@' in email2) > 1),
  ADD CONSTRAINT applications_emails_differ CHECK (lower(email1) <> lower(email2)),
  ADD CONSTRAINT applications_address_check CHECK (char_length(address) BETWEEN 1 AND 2000);

GRANT INSERT ON public.applications TO anon;
GRANT SELECT, INSERT ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an application"
  ON public.applications FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can upload an application attachment"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'application-attachments');