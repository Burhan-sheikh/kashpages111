
-- Tighten review inserts: only on published shops
DROP POLICY "Anyone can insert reviews" ON public.reviews;
CREATE POLICY "Anyone can insert reviews on published shops"
  ON public.reviews FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.shops WHERE shops.id = reviews.shop_id AND shops.status = 'published')
  );

-- Tighten analytics inserts: only on published shops
DROP POLICY "Anyone can insert analytics events" ON public.analytics_events;
CREATE POLICY "Analytics events on published shops"
  ON public.analytics_events FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.shops WHERE shops.id = analytics_events.shop_id AND shops.status = 'published')
  );
