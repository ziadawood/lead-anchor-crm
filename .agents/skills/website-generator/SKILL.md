---
name: website-generator
description: Dynamic website generation for tenant businesses using template themes, SEO optimization, and embedded chat/call widgets.
---

# Website Generator

## Overview
Every LeadAnchor tenant automatically gets a professional, SEO-optimized
website generated from their business profile. This replaces the need for
tenants to build their own website or use a separate website builder.

This competes with GoHighLevel's website/funnel builder, but LeadAnchor's
approach is **auto-generation** — the website is created instantly from the
onboarding wizard data, with optional customization afterwards.

## Template System

### Template Architecture
- Templates are React components that accept a `TenantProfile` prop
- Themes are CSS variable sets that control colors, fonts, and spacing
- Content is dynamically injected from the tenant's database record
- All templates are mobile-responsive by default

### Available Themes
| Theme | Style | Best For |
|---|---|---|
| `professional-dark` | Dark header, clean body, bold CTAs | Trades (plumbing, HVAC) |
| `clean-light` | White/light gray, minimal, modern | Cleaning, landscaping |
| `modern-gradient` | Gradient hero, card-based layout | Premium services |
| `bold-contrast` | High-contrast, large typography | Emergency services |

### Template Data Model
```typescript
interface TenantWebsiteData {
  // From tenant profile
  companyName: string;
  trackType: 'trades' | 'predictable_services';
  phone: string;
  address: string;
  hours: string;
  logoUrl: string | null;

  // Theme customization
  theme: {
    template: 'professional-dark' | 'clean-light' | 'modern-gradient' | 'bold-contrast';
    primaryColor: string;     // Hex color
    accentColor: string;      // Hex color
    fontFamily: string;       // Google Font name
  };

  // Computed from track
  services: string[];
  heroTitle: string;
  heroSubtitle: string;
  ctaText: string;

  // Social proof
  reviewCount: number;
  averageRating: number;
  testimonials: Testimonial[];
}
```

## Website Sections

### 1. Header / Navigation
- Company name + logo (or styled initial)
- Navigation links: Services, Testimonials, Contact
- Click-to-call button with tracking phone number
- Sticky on scroll

### 2. Hero Section
- Dynamic headline based on business track
- Subheadline describing core value prop
- Primary CTA button: "Get a Free Quote" or "Book Now"
- Service cards grid or hero image

### 3. Services Grid
- Auto-generated from business track:
  - **Trades**: Emergency Repair, Installation & Upgrades, Routine Maintenance, Diagnostic Inspection
  - **Predictable**: Weekly Cleaning, Deep Clean, Move-in/Move-out, Office Sanitization
- Each service has an icon, title, and brief description
- Customizable by tenant (add/remove services)

### 4. Info Bar
- Location with map embed
- Operating hours
- Star rating + review count
- Trust badges (Licensed, Insured, Bonded)

### 5. Testimonials
- Customer reviews carousel
- Star ratings
- Customer name and service type
- Pulled from Google Business Profile integration (future)

### 6. Contact Section
- Embedded contact form (creates deal via API)
- Phone number (click-to-call)
- Email address
- Business hours reminder

### 7. Footer
- Company info
- Quick links
- Social media links
- "Powered by LeadAnchor" (removable on higher plans)

### 8. Chat Widget (Embedded)
- Floating AI chat button (bottom-right)
- Opens AI Chat Assistant (see `ai-chat-assistant` skill)
- Customized with tenant branding

## SEO Optimization

### Auto-Generated Meta Tags
```html
<title>{companyName} | {trackType} Services in {city}</title>
<meta name="description" content="{companyName} provides professional
  {services} in {city}. {reviewCount}+ 5-star reviews. Call {phone} for
  a free quote today!" />
<meta property="og:title" content="{companyName} - {heroTitle}" />
<meta property="og:description" content="{heroSubtitle}" />
<meta property="og:image" content="{logoUrl or generated OG image}" />
<meta property="og:type" content="website" />
<link rel="canonical" href="https://{slug}.leadanchor.com" />
```

### Structured Data (JSON-LD)
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "{companyName}",
  "address": { "@type": "PostalAddress", ... },
  "telephone": "{phone}",
  "openingHours": "{hours}",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "{averageRating}",
    "reviewCount": "{reviewCount}"
  }
}
```

## Custom Domain Support

### Setup Flow
1. Tenant enters desired custom domain in settings
2. System generates CNAME instructions: `www.yourdomain.com → {slug}.leadanchor.com`
3. Tenant adds CNAME record at their DNS provider
4. Cloudflare automatically provisions SSL certificate
5. Domain verified and active

### Cloudflare Configuration
- Each tenant site served from Cloudflare Pages
- Custom domains via Cloudflare Custom Hostnames API
- Automatic SSL via Cloudflare Universal SSL
- CDN caching for static assets

## API Endpoints

### Get Website Data
`GET /api/v1/public/website/:slug`
- Public endpoint (no auth required)
- Returns tenant profile + theme for rendering
- Cached at CDN edge (5-minute TTL)

### Update Theme
`PATCH /api/v1/tenants/website/theme`
- Auth required (admin only)
- Updates theme configuration

### Preview Theme
`POST /api/v1/tenants/website/preview`
- Auth required (admin only)
- Returns rendered preview without saving

## File References
| File | Purpose |
|---|---|
| `apps/web/src/features/website-builder/` | Builder UI for admins |
| `apps/web/src/features/website-builder/templates/` | Theme components |
| `apps/web/src/features/website-builder/templates/ProfessionalDark.tsx` | Dark theme |
| `apps/web/src/features/website-builder/templates/CleanLight.tsx` | Light theme |
| `apps/web/src/features/website-builder/templates/ModernGradient.tsx` | Gradient theme |
| `apps/api/src/services/website.service.ts` | Website data API |
| `apps/api/src/routes/public.ts` | Public website endpoints |
| `packages/shared/src/types/website.ts` | Type definitions |
