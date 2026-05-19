# Pristine Spaces Pro - Workspace Exploration Report
**Generated:** May 18, 2026

---

## 1. PAGES AND ROUTES

### Public Routes
| Route | File | Component | Purpose |
|-------|------|-----------|---------|
| `/` | `Index.tsx` | Home page | Hero section, quick estimate form, services list, benefits, testimonials, trust badges |
| `/house-cleaning` | `HouseCleaning.tsx` | Service detail page | Hardcoded service page template |
| `/deep-cleaning` | `DeepCleaning.tsx` | Service detail page | Hardcoded service page template |
| `/move-in-move-out` | `MoveInOut.tsx` | Service detail page | Hardcoded service page template |
| `/recurring-cleaning` | `RecurringCleaning.tsx` | Service detail page | Hardcoded service page template |
| `/office-cleaning` | `OfficeCleaning.tsx` | Service detail page | Hardcoded service page template |
| `/commercial-cleaning` | `CommercialCleaning.tsx` | Service detail page | Hardcoded service page template |
| `/services` | `Services.tsx` | Services grid | Lists all 6 services as static cards |
| `/about` | `About.tsx` | About page | Company information (not examined) |
| `/contact` | `Contact.tsx` | Contact form | Estimate form with pricing calculator, database submission |
| `/areas-we-serve` | `AreasWeServePage.tsx` | Service areas | Displays service zones (regular, extended, request) and cities |
| `/portfolio` | `Portfolio.tsx` | Portfolio | "Coming soon" placeholder (no images implemented) |

### Admin Routes (All behind `/admin` prefix)
| Route | File | Component | Purpose |
|-------|------|-----------|---------|
| `/admin/login` | `AdminLogin.tsx` | Auth redirect | Temporarily disabled - redirects to dashboard |
| `/admin` | `AdminDashboard.tsx` | Dashboard | Overview cards, recent estimates |
| `/admin/estimates` | `AdminEstimates.tsx` | Estimate management | CRUD for estimate requests |
| `/admin/customers` | `AdminCustomers.tsx` | Customer management | CRUD for customers table |
| `/admin/areas` | `AdminAreas.tsx` | Service areas | CRUD for areas_served table |
| `/admin/pricing` | `AdminPricing.tsx` | Pricing rules | Dynamic pricing configuration |
| `/admin/portfolio` | `AdminPortfolio.tsx` | Portfolio management | CRUD + image upload for portfolio_items |
| `/admin/services` | `AdminServices.tsx` | Services management | CRUD + image upload for services table |
| `/admin/media` | `AdminMedia.tsx` | Media manager | File upload/browser for media bucket |
| `/admin/settings` | `AdminSettings.tsx` | Website settings | CRUD for site_settings key-value store |
| `/admin/calendar` | `AdminPlaceholder.tsx` | Calendar | Placeholder component |
| `/admin/messages` | `AdminMessages.tsx` | Messages log | View and manage contact form submissions |
| `*` | `NotFound.tsx` | 404 page | Catch-all for undefined routes |

---

## 2. HOOKS AND DATA FETCHING

### Custom Hooks Summary

#### `useAreas()` ⚠️ INFINITE LOADING RISK
**File:** `src/hooks/useAreas.ts`
- **Returns:** `{ areas: Area[], loading: boolean }`
- **Data Fetched:** Service areas from `areas_served` table
- **Query:** `select("id,city,state,zone,display_order").eq("active", true).order("display_order")`
- **Issues:**
  - ❌ **NO ERROR HANDLING** - Silent failure if table missing
  - ❌ **NO RETRY LOGIC** - Fails once, stays loading forever
  - ❌ **NO DEPENDENCY ARRAY** - Runs on every render (minor issue with memoization)
- **Used In:** AreasWeServe component, Contact form, AreasWeServePage
- **Recommendation:** Add error handling and error state

#### `useSiteSettings()` 
**File:** `src/hooks/useSiteSettings.ts`
- **Returns:** `{ settings: SettingsMap, loading: boolean, refresh: () => Promise<void> }`
- **Data Fetched:** Site configuration from `site_settings` table
- **Query:** `select("setting_key,setting_value")`
- **Features:**
  - ✅ Caching mechanism with subscribers pattern
  - ✅ Default fallback values included
  - ✅ Error handling with `isMissingRelationError` check
- **Default Values Fallback:** 28 settings (company name, phone, email, address, social links, etc.)
- **Used In:** Header, Footer, Contact form, Admin pages

#### `usePricingRules()` ⚠️ POTENTIAL INFINITE LOADING
**File:** `src/hooks/usePricingRules.ts`
- **Returns:** `{ rules: PricingRule[], pricing: ResolvedPricing, loading: boolean, reload: () => Promise<void> }`
- **Data Fetched:** Dynamic pricing from `pricing_rules` table
- **Query:** `select("*").order("category").order("sort_order")`
- **Issues:**
  - ❌ **NO ERROR HANDLING** - Will fail silently if table missing
  - ⚠️ **MISSING TABLE POSSIBLE** - No migration file defines this table, may be in external migration
- **Used In:** Contact page (pricing calculator), AdminPricing page
- **Recommendation:** Add error handling, add isMissingRelationError check

#### `useAdminSession()`
**File:** `src/hooks/useAdminSession.ts`
- **Returns:** `{ session: Session | null, isAdmin: boolean | null, loading: boolean, signOut: () => Promise<void> }`
- **Purpose:** Admin authentication and role checking
- **Tables Queried:** `user_roles` (checks for admin role)
- **Status:** ⚠️ **AUTH CURRENTLY DISABLED** - See AdminGuard.tsx
- **Recommendation:** Re-enable before production (see AdminGuard comment)

#### `useScrollReveal()`
**File:** `src/hooks/useScrollReveal.ts`
- **Purpose:** Intersection Observer for scroll-triggered animations
- **Features:** Watches `.reveal`, `.reveal-left`, `.reveal-right` classes
- **Configuration:** threshold: 0.12, rootMargin: "0px 0px -40px 0px"

#### `use-mobile.tsx` & `use-toast.ts`
- **use-mobile.tsx:** Responsive breakpoint detection
- **use-toast.ts:** Toast notification hook (from shadcn/ui)

### Supabase Tables Being Queried

| Table | Used By | Fields |
|-------|---------|--------|
| `areas_served` | useAreas, AdminAreas | id, city, state, zone (enum), active, display_order |
| `site_settings` | useSiteSettings, AdminSettings | setting_key, setting_value, setting_type, category, label |
| `pricing_rules` | usePricingRules, AdminPricing | id, category, name, label, value, value_type, active, sort_order |
| `estimate_requests` | Contact form, AdminDashboard, AdminEstimates | full_name, phone, email, address, zip, city, service_type, property_type, bedrooms, bathrooms, frequency, preferred_date, preferred_time, notes, calculated_estimate, estimate_breakdown, service_zone, status, admin_notes |
| `user_roles` | useAdminSession | user_id, role (admin/staff/user) |
| `customers` | AdminCustomers | (full schema not examined) |
| `services` | AdminServices | id, name, slug, description, starting_price, image_url, active, display_order |
| `portfolio_items` | AdminPortfolio | id, title, description, category, location, image_url, featured, active, display_order |
| `media_assets` | AdminMedia | id, file_name, file_url, file_type, section, alt_text |
| `messages` | AdminMessages, AdminEstimates | id, estimate_request_id, client_name, email, subject, message, channel, status, sent_at |

---

## 3. POTENTIAL INFINITE LOADING ISSUES

### Critical Issues

#### 🔴 **useAreas Hook - No Error Boundary**
```typescript
// PROBLEM: If areas_served table doesn't exist or query fails:
// - loading stays true forever
// - areas becomes []
// - Components show "Loading service areas…" indefinitely
```
- **Affected Components:** AreasWeServe, Contact form
- **Fix Needed:** Add error state and error handling

#### 🔴 **usePricingRules Hook - No Error Handling**
```typescript
// PROBLEM: If pricing_rules table missing:
// - loading stays true forever
// - Pricing calculator breaks silently
// - Contact form affected
```
- **Affected Components:** Contact page, pricing calculator
- **Fix Needed:** Add error handling with fallback to DEFAULT_PRICING_SEED

#### 🟡 **Missing Table Migrations**
- `pricing_rules` table is queried but no CREATE TABLE statement found in migrations
- `customers` table is queried but no CREATE TABLE statement found in migrations
- Only migration file examined: `20260425030000_admin_content_modules.sql`
- **Other migration files exist but not fully examined:**
  - `20260425003455_*.sql` (roles, estimate_requests, areas_served)
  - `20260425003511_*.sql` (update_updated_at)
  - `20260425004132_*.sql` (not examined)
  - `20260425010107_*.sql` (not examined)
  - `20260425011742_*.sql` (not examined)
  - `20260425023148_*.sql` (not examined)

#### 🟡 **Admin Authentication Disabled**
```typescript
// AdminGuard.tsx - Currently bypassed
export const AdminGuard = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;  // ← No actual auth check!
};
```
- **Issue:** Anyone can access /admin without authentication
- **Comment Says:** "Auth disabled. Anyone can access /admin. TODO: Re-enable proper auth check before going to production."

---

## 4. ENVIRONMENT VARIABLES & SECURITY

### Current Environment (`.env` file)
```
VITE_SUPABASE_PROJECT_ID="uieidrvxhwmscptclisa"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGc..."  [TRUNCATED]
VITE_SUPABASE_URL="https://uieidrvxhwmscptclisa.supabase.co"
```

### Security Considerations
- ⚠️ **Publishable key in repo is FINE** - it's meant to be public (anon role)
- ⚠️ **Project ID exposed** - Not a security issue, can't be used alone
- ⚠️ **RLS Policies are permissive** - Many tables have `TEMP public manage` policies allowing full access to anon/authenticated
- ✅ **No private API keys exposed** - Service role key not committed

### Expected Variables (from imports)
```typescript
VITE_SUPABASE_URL        // https://uieidrvxhwmscptclisa.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY  // Public anon key
VITE_SUPABASE_MEDIA_BUCKET     // Optional, defaults to "media"
VITE_SUPABASE_PROJECT_ID       // uieidrvxhwmscptclisa
```

---

## 5. DATABASE SCHEMA

### Verified Tables

#### `areas_served`
```sql
id (UUID), city (text), state (text), zone (text), 
active (boolean), display_order (int), created_at (timestamptz)
```
- **Zones:** 'regular', 'extended', 'request'
- **Seeded Data:** 30 areas (12 regular, 13 extended, 5 request)
- **RLS:** Public readable (active=true), admin-only manage

#### `estimate_requests`
```sql
id (UUID), full_name, phone, email, address, zip_code, city,
service_type, property_type, bedrooms, bathrooms, frequency,
preferred_date, preferred_time, notes, calculated_estimate,
estimate_breakdown (JSONB), service_zone, status, admin_notes,
created_at, updated_at
```
- **Status Enum:** 'new_request', 'contacted', 'estimate_sent', 'scheduled', 'completed', 'cancelled'
- **RLS:** Anyone can submit, admins can view/update/delete
- **Has Trigger:** auto-update `updated_at` column

#### `services`
```sql
id (UUID), name, slug (unique), description, starting_price,
image_url, active, display_order, created_at, updated_at
```
- **Seeded Data:** 6 services (House, Deep, Move, Recurring, Office, Commercial)
- **RLS:** Public readable (active=true), temp full access

#### `portfolio_items`
```sql
id (UUID), title, description, category, location, image_url,
featured, active, display_order, created_at, updated_at
```
- **RLS:** Public readable (active=true), temp full access
- **Status:** Currently empty, frontend shows "Coming soon"

#### `media_assets`
```sql
id (UUID), file_name, file_url, file_type, section,
alt_text, created_at
```
- **Storage Bucket:** 'media' (public read/write enabled)
- **Sections:** Used to organize assets

#### `site_settings`
```sql
Stores key-value pairs:
- company_name, phone, phone_href, email
- address_line_1, address_line_2
- business_hours
- footer_description, footer_copyright
- header_cta_text, header_cta_link
- contact_title, contact_subtitle
- social_instagram, social_facebook, social_tiktok, social_linkedin, social_youtube, social_twitter, social_whatsapp
```

#### `user_roles`
```sql
id (UUID), user_id (UUID), role (app_role enum), created_at
- role enum: 'admin', 'staff', 'user'
```

#### `messages`
```sql
id (UUID), estimate_request_id (UUID FK), client_name, email,
subject, message, channel, status, sent_at, created_at
- channel: 'email'
- status: 'sent'
```

### Storage Buckets
- **media** - Public bucket for portfolio images, service images, media assets

---

## 6. COMPONENTS STRUCTURE

### Layout Components
- **Layout.tsx** - Main wrapper with Header, Footer
- **Header.tsx** - Navigation, mobile drawer, dropdowns, CTA button
- **Footer.tsx** - Footer content
- **Logo.tsx** - Branding logo component (Sparkles icon + "Paiva." text)

### Section Components
- **SectionHeader.tsx** - Title/subtitle/eyebrow section header
- **AreasWeServe.tsx** - Service areas display with map and city list
- **CtaBanner.tsx** - Call-to-action banner section
- **FaqSection.tsx** - FAQ accordion component
- **NavLink.tsx** - Custom navigation link component
- **ServicePageTemplate.tsx** - Reusable template for service detail pages

### Admin Components
- **AdminLayout.tsx** - Sidebar + main content layout for admin pages
- **AdminGuard.tsx** - Auth wrapper (currently disabled)
- **11 Admin Pages** - Estimate, Customer, Area, Pricing, Portfolio, Services, Media, Settings, Messages, Calendar, Dashboard

### UI Component Library (shadcn/ui based)
- **28+ UI components** in `src/components/ui/`
- accordion, alert, avatar, badge, button, card, carousel, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input, label, menubar, navigation-menu, pagination, popover, progress, radio-group, select, separator, sheet, sidebar, skeleton, slider, sonner (toast), switch, table, tabs, textarea, toggle, toggle-group, tooltip

---

## 7. BRANDING & LOGO

### Company Identity
- **Company Name:** Paiva Cleaners Co.
- **Phone:** (978) 319-8939
- **Email:** paivacleaners@gmail.com
- **Address:** 30 3rd Street, Lowell, MA
- **Service Area:** Lowell, MA + Merrimack Valley + Southern NH

### Logo Implementation
- **Component:** `Logo.tsx`
- **Icon:** Lucide React `<Sparkles />` icon (no image file)
- **Colors:** Primary gradient for light mode, white background for dark/inverted mode
- **Display:** "Paiva." (with dot) over "Cleaners Co."
- **Assets:** No PNG/SVG logo files - purely component-based

### Brand Assets in `/src/assets/`
```
hero-kitchen.jpg                    # Hero section image
premium-spaces.jpg                  # Feature image
service-house.jpg                   # Service card
service-deep.jpg                    # Service card
service-move.jpg                    # Service card
service-commercial.jpg              # Service card
service-office.jpg                  # Service card
service-recurring.jpg               # Service card
```

### Tailwind Branding Colors
```typescript
- Primary: HSL variable-based
- Primary-strong: Darker primary for gradients
- Primary-glow: Lighter primary for glows
- Secondary: Light background accent
- Accent colors: success, warning, info, destructive
- Fonts: Fraunces (display), Inter (sans)
```

---

## 8. CONFIGURATION FILES

### `tailwind.config.ts`
- **Colors:** CSS HSL variable system for theming
- **Animations:** fade-in, fade-up, fade-left, slide-down, float, scale-in, accordion
- **Container:** max-width 1320px, centered, 1.5rem padding
- **Plugins:** tailwindcss-animate

### `vite.config.ts`
- **Server:** Port 8080, HMR overlay disabled
- **Plugins:** React SWC compiler, Lovable component tagger (dev only)
- **Alias:** `@` → `./src`
- **Deduped:** react, react-dom, @tanstack/react-query

### `tsconfig.json`
- **Target:** ES2020
- **Module:** ESNext
- **JSX:** react-jsx
- **Strict mode:** Enabled
- **Skip lib check:** true

### `vitest.config.ts` & `test/setup.ts`
- **Test framework:** Vitest
- **Example test:** `test/example.test.ts`
- **Setup file:** `test/setup.ts`

### `eslint.config.js`
- Using new flat config format

### `postcss.config.js`
- Using Tailwind and Autoprefixer

---

## 9. DEPENDENCIES & TECH STACK

### Core Framework
- **React** 18.3.1 + React DOM
- **React Router** 6.30.1 (routing)
- **Vite** (build tool)
- **TypeScript** (language)

### UI & Styling
- **shadcn/ui** (30+ components)
- **Radix UI** (headless component primitives)
- **Tailwind CSS** 3.x
- **lucide-react** (icon library)
- **Fraunces + Inter fonts**

### Data & State
- **@tanstack/react-query** 5.83.0 (data fetching)
- **@supabase/supabase-js** 2.104.1 (backend)
- **react-hook-form** 7.61.1 (form handling)
- **@hookform/resolvers** 3.10.0 (form validation)

### Charting & Analytics
- **recharts** 2.15.4 (charts)

### Dev Tools
- **vitest** (testing)
- **eslint** (linting)
- **lovable-tagger** (component tagging in dev)

### Post-Install Scripts
```
npm run dev           # Start dev server
npm run build         # Build for production
npm run preview       # Preview production build
npm run test          # Run tests
npm run test:watch   # Watch mode tests
npm run lint          # Lint code
```

---

## 10. SERVICES OFFERED

### Static Service List
1. **House Cleaning** - $120/base
2. **Deep Cleaning** - $220/base
3. **Move In/Move Out** - $260/base
4. **Recurring Cleaning** - $110/base
5. **Office Cleaning** - $180/base
6. **Commercial Cleaning** - $180/base

### Service Types (Extended)
- clinic, retail, post-construction variants

### Pricing Model
- **Base price** + **room add-ons** + **frequency discount** + **zone fee** + **extras**
- **Bedroom Add-ons:** 0($0), 1($0), 2($25), 3($50), 4($80), 5+($120)
- **Bathroom Add-ons:** 1($0), 2($35), 3($70), 4+($110)
- **Frequency Discounts:** Weekly(15%), Bi-weekly(10%), Monthly(5%)
- **Zone Fees:** Regular($0), Extended($25), Request(manual)
- **Extras:** Oven, fridge, windows, laundry, cabinets, pet hair, basement, garage
- **Minimum:** $95

---

## 11. MOBILE RESPONSIVENESS

### Tailwind Breakpoints Used
- **Mobile-first approach** with `md:` and `lg:` prefixes
- **Key breakpoints:** sm (640px), md (768px), lg (1024px), xl (1280px)
- **2xl container:** max 1320px

### Responsive Components
- **Header:** Logo visible on all sizes, nav hidden on mobile (drawer menu)
- **Layout:** Grid changes from 1 → 2 → 3 columns across breakpoints
- **Forms:** Flex-direction changes from column → row on larger screens
- **Images:** Aspect ratio maintained across sizes

### Mobile Menu
- Drawer-based navigation
- Body scroll locked when open
- Escape key to close
- Nested groups for submenu categories

---

## 12. ADMIN INTERFACE STRUCTURE

### Admin Sidebar Navigation
```
Dashboard              (Overview cards)
Estimate Requests      (CRUD form submissions)
Customers              (CRUD customer table)
Calendar               (Placeholder)
Areas We Serve         (CRUD service zones)
Pricing Rules          (Dynamic pricing configuration)
Portfolio              (CRUD + image upload)
Services               (CRUD + image upload)
Media Manager          (File browser/upload)
Website Settings       (Key-value settings)
Messages               (Message log viewer)
```

### Admin Authentication
- ⚠️ **Currently Disabled** - AdminGuard bypassed
- Role check would query `user_roles` table for 'admin' role
- Needs re-enabling before production

### Admin Dashboard
- Recent estimates (50 limit)
- 5 metric cards: New Requests, Scheduled, Completed, Pending, Revenue
- Status tracking: new_request → contacted → estimate_sent → scheduled → completed/cancelled

---

## 13. KEY FINDINGS & RECOMMENDATIONS

### Issues Found
1. ❌ **Two hooks missing error handling** - useAreas, usePricingRules
2. ❌ **Admin auth disabled** - Comment says "TODO: re-enable before production"
3. ❌ **Permissive RLS policies** - "TEMP public manage" policies should be restricted
4. ❌ **Missing table migrations** - pricing_rules, customers tables queried but CREATE statements not found
5. ⚠️ **Portfolio empty** - Shows "Coming soon" placeholder
6. ⚠️ **No image optimization** - Large assets imported in Index.tsx
7. ⚠️ **Limited error states** - Many components don't show loading/error states

### Architecture Strengths
- ✅ Clean component structure with shadcn/ui
- ✅ Type-safe with TypeScript throughout
- ✅ Responsive design with Tailwind
- ✅ Supabase integration with RLS
- ✅ Dynamic pricing engine with fallbacks
- ✅ Settings management system

### Recommended Next Steps
1. Add error handling to useAreas and usePricingRules hooks
2. Re-enable admin authentication with proper role checking
3. Fix permissive RLS policies for production
4. Verify all table migrations are complete
5. Implement portfolio image gallery
6. Add loading/error states to all async operations
7. Optimize image loading and sizes

---

## 14. FILE STRUCTURE SUMMARY

```
src/
├── pages/                          (Public + Admin pages)
│   ├── Index.tsx                   (Home)
│   ├── Services.tsx                (Services listing)
│   ├── Portfolio.tsx               (Portfolio - placeholder)
│   ├── Contact.tsx                 (Estimate form + calculator)
│   ├── AreasWeServePage.tsx        (Service areas)
│   ├── [HouseCleaning, etc].tsx   (Service detail pages)
│   ├── About.tsx                   (Company info)
│   ├── NotFound.tsx                (404)
│   └── admin/                      (12 admin pages)
├── components/
│   ├── Layout.tsx                  (Main wrapper)
│   ├── Header.tsx                  (Navigation)
│   ├── Footer.tsx                  (Footer)
│   ├── Logo.tsx                    (Branding)
│   ├── AreasWeServe.tsx            (Service zones)
│   ├── CtaBanner.tsx               (CTA section)
│   ├── FaqSection.tsx              (FAQ)
│   ├── ServicePageTemplate.tsx     (Reusable template)
│   ├── admin/                      (AdminLayout, AdminGuard)
│   └── ui/                         (30+ shadcn components)
├── hooks/
│   ├── useAreas.ts                 (⚠️ No error handling)
│   ├── useSiteSettings.ts          (✅ With fallbacks)
│   ├── usePricingRules.ts          (⚠️ No error handling)
│   ├── useAdminSession.ts          (Auth disabled)
│   ├── useScrollReveal.ts          (Animations)
│   ├── use-mobile.tsx              (Responsive)
│   └── use-toast.ts                (Notifications)
├── integrations/
│   └── supabase/
│       ├── client.ts               (Supabase client)
│       └── types.ts                (Type-safe schema)
├── lib/
│   ├── pricing.ts                  (Pricing engine)
│   ├── supabaseErrors.ts           (Error detection)
│   └── utils.ts                    (Utilities)
├── data/
│   └── nav.ts                      (Navigation config)
├── assets/                         (8 images)
└── App.tsx                         (Routes + providers)

supabase/
├── config.toml
└── migrations/                     (6 SQL migrations)
```

---

**Report Complete** ✓
