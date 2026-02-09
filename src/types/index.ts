// Kashpages Data Models

export type UserRole = 'guest' | 'user' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'pending';
export type PageStatus = 'draft' | 'published' | 'pending';

export interface User {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  createdAt: string;
}

export interface PageSeo {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
}

export interface Page {
  id: string;
  ownerId: string;
  title: string;
  slug: string;
  status: PageStatus;
  seo: PageSeo;
  contentSchema: ContentBlock[];
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  preview: string;
  schema: ContentBlock[];
  category: string;
}

export interface Revision {
  id: string;
  pageId: string;
  snapshot: ContentBlock[];
  timestamp: string;
  label?: string;
}

// Builder Schema Types
export type BlockType = 
  | 'hero' | 'features' | 'testimonials' | 'pricing' 
  | 'faq' | 'gallery' | 'contact' | 'footer'
  | 'heading' | 'paragraph' | 'button' | 'image' 
  | 'video' | 'form' | 'divider' | 'spacer' 
  | 'social-links' | 'map';

export interface ContentBlock {
  id: string;
  type: BlockType;
  props: Record<string, unknown>;
  children?: ContentBlock[];
  order: number;
}

export interface BuilderState {
  blocks: ContentBlock[];
  selectedBlockId: string | null;
  previewMode: 'desktop' | 'tablet' | 'mobile';
  isDirty: boolean;
}
