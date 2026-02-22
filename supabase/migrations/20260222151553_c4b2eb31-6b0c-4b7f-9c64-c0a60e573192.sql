
-- Phase 1: Drop old page-builder tables and create shop-directory schema

-- Drop old tables (order matters due to foreign keys)
DROP TABLE IF EXISTS public.revisions CASCADE;
DROP TABLE IF EXISTS public.pages CASCADE;
DROP TABLE IF EXISTS public.templates CASCADE;

-- Create plans table
CREATE TABLE public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  price_monthly integer NOT NULL DEFAULT 0,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Plans viewable by everyone"
  ON public.plans FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage plans"
  ON public.plans FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.plans(id),
  status text NOT NULL DEFAULT 'active',
  cashfree_subscription_id text,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage subscriptions"
  ON public.subscriptions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create shops table
CREATE TABLE public.shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  slug text NOT NULL,
  cover_image text,
  gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  about_text text,
  h2_title text,
  services jsonb NOT NULL DEFAULT '[]'::jsonb,
  faq jsonb NOT NULL DEFAULT '[]'::jsonb,
  contact_phone text,
  whatsapp_number text,
  use_phone_for_whatsapp boolean NOT NULL DEFAULT true,
  address_line1 text,
  address_line2 text,
  state text,
  city text,
  pin_code text,
  map_link text,
  map_embed_code text,
  seo_title text,
  seo_description text,
  seo_image text,
  seo_favicon text,
  seo_tags text[],
  remove_branding boolean NOT NULL DEFAULT false,
  password_enabled boolean NOT NULL DEFAULT false,
  password_hash text,
  ratings_enabled boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(owner_id, slug)
);

ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published shops viewable by everyone"
  ON public.shops FOR SELECT
  USING (status = 'published' OR auth.uid() = owner_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert own shops"
  ON public.shops FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own shops"
  ON public.shops FOR UPDATE
  USING (auth.uid() = owner_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can delete own shops"
  ON public.shops FOR DELETE
  USING (auth.uid() = owner_id);

CREATE TRIGGER update_shops_updated_at
  BEFORE UPDATE ON public.shops
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create reviews table
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  reviewer_name text NOT NULL,
  reviewer_email text,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Visible reviews viewable by everyone"
  ON public.reviews FOR SELECT
  USING (
    is_visible = true 
    OR EXISTS (SELECT 1 FROM public.shops WHERE shops.id = reviews.shop_id AND shops.owner_id = auth.uid())
    OR has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Anyone can insert reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Shop owners can update reviews"
  ON public.reviews FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.shops WHERE shops.id = reviews.shop_id AND shops.owner_id = auth.uid()));

CREATE POLICY "Shop owners can delete reviews"
  ON public.reviews FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.shops WHERE shops.id = reviews.shop_id AND shops.owner_id = auth.uid()));

-- Create analytics events table
CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shop owners can view own analytics"
  ON public.analytics_events FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.shops WHERE shops.id = analytics_events.shop_id AND shops.owner_id = auth.uid())
    OR has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Anyone can insert analytics events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (true);

-- Add plan field to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'free';

-- Seed default plans
INSERT INTO public.plans (name, slug, price_monthly, features) VALUES
  ('Free', 'free', 0, '["1 Shop", "3 Gallery Images", "Basic SEO", "Kashpages Branding"]'::jsonb),
  ('Pro', 'pro', 50, '["1 Shop", "30 Gallery Images", "Advanced SEO (Tags + Favicon)", "Analytics Dashboard", "Shop Reviews", "Branding Removal"]'::jsonb);

-- Create storage bucket for shop images
INSERT INTO storage.buckets (id, name, public) VALUES ('shop-assets', 'shop-assets', true);

CREATE POLICY "Anyone can view shop assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'shop-assets');

CREATE POLICY "Authenticated users can upload shop assets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'shop-assets' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own shop assets"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'shop-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own shop assets"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'shop-assets' AND auth.uid()::text = (storage.foldername(name))[1]);
