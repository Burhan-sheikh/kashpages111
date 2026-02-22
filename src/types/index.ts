// Kashpages Data Models

export type UserRole = 'guest' | 'user' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'pending';
export type ShopStatus = 'draft' | 'published' | 'unpublished';

export interface ShopData {
  id: string;
  owner_id: string;
  title: string;
  slug: string;
  cover_image: string | null;
  gallery: string[];
  about_text: string | null;
  h2_title: string | null;
  services: { title: string; description: string }[];
  faq: { question: string; answer: string }[];
  contact_phone: string | null;
  whatsapp_number: string | null;
  use_phone_for_whatsapp: boolean;
  address_line1: string | null;
  address_line2: string | null;
  state: string | null;
  city: string | null;
  pin_code: string | null;
  map_link: string | null;
  map_embed_code: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_image: string | null;
  seo_favicon: string | null;
  seo_tags: string[] | null;
  remove_branding: boolean;
  password_enabled: boolean;
  ratings_enabled: boolean;
  status: ShopStatus;
  created_at: string;
  updated_at: string;
}
