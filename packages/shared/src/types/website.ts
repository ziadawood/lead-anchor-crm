// Website types

export interface IWebsiteData {
  companyName: string;
  trackType: import('./tenant').TenantTrack;
  phone: string;
  address: string;
  city: string;
  state: string;
  hours: string;
  logoUrl: string | null;
  theme: import('./tenant').IWebsiteTheme;
  services: string[];
  heroTitle: string;
  heroSubtitle: string;
  ctaText: string;
  reviewCount: number;
  averageRating: number;
  testimonials: ITestimonial[];
}

export interface ITestimonial {
  name: string;
  rating: number;
  text: string;
  service_type: string;
  date: string;
}

export type WebsiteTemplate = 'professional-dark' | 'clean-light' | 'modern-gradient' | 'bold-contrast';

// Services based on track type
export const TRADES_SERVICES = [
  'Emergency Repair',
  'Installation & Upgrades',
  'Routine Maintenance',
  'Diagnostic Inspection',
  'Water Heater Service',
  'Drain Cleaning',
] as const;

export const PREDICTABLE_SERVICES = [
  'Weekly Cleaning',
  'Deep Clean Service',
  'Move-in/Move-out Cleaning',
  'Office Sanitization',
  'Window Cleaning',
  'Carpet Cleaning',
] as const;
