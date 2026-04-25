// Instant Estimate pricing engine for Paiva Cleaners Co.
// Supports DYNAMIC pricing rules from the `pricing_rules` table.
// Falls back to baked-in defaults so the calculator never breaks.

export type ServiceKey =
  | "standard"
  | "deep"
  | "move"
  | "recurring"
  | "office"
  | "clinic"
  | "retail"
  | "post_construction";

export type FrequencyKey = "one_time" | "weekly" | "biweekly" | "monthly";
export type ZoneKey = "regular" | "extended" | "request";

export type PricingRule = {
  id: string;
  category: string;
  name: string;
  label: string;
  value: number;
  value_type: string;
  active: boolean;
  sort_order: number;
};

// ---------- Default fallbacks (used until DB rules load) ----------
export const SERVICES: { key: ServiceKey; label: string; base: number }[] = [
  { key: "standard", label: "Standard Cleaning", base: 120 },
  { key: "deep", label: "Deep Cleaning", base: 220 },
  { key: "move", label: "Move In / Move Out", base: 260 },
  { key: "recurring", label: "Recurring Cleaning", base: 110 },
  { key: "office", label: "Office Cleaning", base: 180 },
  { key: "clinic", label: "Clinic Cleaning", base: 220 },
  { key: "retail", label: "Retail Cleaning", base: 160 },
  { key: "post_construction", label: "Post Construction Cleaning", base: 300 },
];

export const FREQUENCIES: { key: FrequencyKey; label: string; discount: number }[] = [
  { key: "one_time", label: "One-Time", discount: 0 },
  { key: "weekly", label: "Weekly", discount: 0.15 },
  { key: "biweekly", label: "Bi-Weekly", discount: 0.10 },
  { key: "monthly", label: "Monthly", discount: 0.05 },
];

export const BEDROOM_ADDONS: Record<string, number> = {
  "0": 0, "1": 0, "2": 25, "3": 50, "4": 80, "5+": 120,
};

export const BATHROOM_ADDONS: Record<string, number> = {
  "1": 0, "2": 35, "3": 70, "4+": 110,
};

export const EXTRAS: { key: string; label: string; price: number }[] = [
  { key: "oven", label: "Inside oven", price: 35 },
  { key: "fridge", label: "Inside fridge", price: 35 },
  { key: "windows", label: "Interior windows", price: 50 },
  { key: "laundry", label: "Laundry", price: 40 },
  { key: "cabinets", label: "Cabinets interior", price: 60 },
  { key: "pets", label: "Pet hair extra", price: 30 },
  { key: "basement", label: "Basement", price: 50 },
  { key: "garage", label: "Garage", price: 60 },
];

export const ZONE_FEES: Record<ZoneKey, number> = {
  regular: 0,
  extended: 25,
  request: 0,
};

export const DEFAULT_MINIMUM = 95;

// ---------- Resolved snapshot (defaults or DB-overridden) ----------
export interface ResolvedPricing {
  services: { key: string; label: string; base: number }[];
  bedrooms: { key: string; label: string; addon: number }[];
  bathrooms: { key: string; label: string; addon: number }[];
  frequencies: { key: string; label: string; discount: number }[]; // discount 0..1
  zones: { key: ZoneKey; label: string; fee: number; manualReview: boolean }[];
  extras: { key: string; label: string; price: number }[];
  minimum: number;
  emergencyFee: number;
}

const DEFAULT_RESOLVED: ResolvedPricing = {
  services: SERVICES.map((s) => ({ key: s.key, label: s.label, base: s.base })),
  bedrooms: Object.entries(BEDROOM_ADDONS).map(([key, addon]) => ({
    key,
    label: key === "0" ? "Studio" : `${key} Bedrooms`,
    addon,
  })),
  bathrooms: Object.entries(BATHROOM_ADDONS).map(([key, addon]) => ({
    key,
    label: `${key} Bathrooms`,
    addon,
  })),
  frequencies: FREQUENCIES.map((f) => ({ key: f.key, label: f.label, discount: f.discount })),
  zones: [
    { key: "regular", label: "Regular Service Area", fee: 0, manualReview: false },
    { key: "extended", label: "Extended Service Area", fee: 25, manualReview: false },
    { key: "request", label: "By Request", fee: 0, manualReview: true },
  ],
  extras: EXTRAS.map((e) => ({ key: e.key, label: e.label, price: e.price })),
  minimum: DEFAULT_MINIMUM,
  emergencyFee: 60,
};

export const resolvePricing = (rules: PricingRule[] | null | undefined): ResolvedPricing => {
  if (!rules || rules.length === 0) return DEFAULT_RESOLVED;

  const byCat = (cat: string) =>
    rules.filter((r) => r.category === cat && r.active).sort((a, b) => a.sort_order - b.sort_order);

  const services = byCat("service").map((r) => ({
    key: r.name,
    label: r.label,
    base: Number(r.value),
  }));
  const bedrooms = byCat("bedroom").map((r) => ({
    key: r.name,
    label: r.label,
    addon: Number(r.value),
  }));
  const bathrooms = byCat("bathroom").map((r) => ({
    key: r.name,
    label: r.label,
    addon: Number(r.value),
  }));
  const frequencies = byCat("frequency").map((r) => ({
    key: r.name,
    label: r.label,
    // value stored as 0-100 percentage in DB; convert to 0-1
    discount: Number(r.value) / 100,
  }));
  const zones = byCat("zone").map((r) => ({
    key: r.name as ZoneKey,
    label: r.label,
    fee: Number(r.value),
    manualReview: r.value_type === "manual_review",
  }));
  const extras = byCat("extra").map((r) => ({
    key: r.name,
    label: r.label,
    price: Number(r.value),
  }));
  const settings = byCat("setting");
  const minimum = Number(settings.find((s) => s.name === "minimum_price")?.value ?? DEFAULT_MINIMUM);
  const emergencyFee = Number(settings.find((s) => s.name === "emergency_fee")?.value ?? 60);

  return {
    services: services.length ? services : DEFAULT_RESOLVED.services,
    bedrooms: bedrooms.length ? bedrooms : DEFAULT_RESOLVED.bedrooms,
    bathrooms: bathrooms.length ? bathrooms : DEFAULT_RESOLVED.bathrooms,
    frequencies: frequencies.length ? frequencies : DEFAULT_RESOLVED.frequencies,
    zones: zones.length ? zones : DEFAULT_RESOLVED.zones,
    extras: extras.length ? extras : DEFAULT_RESOLVED.extras,
    minimum,
    emergencyFee,
  };
};

// ---------- Estimate calculation ----------
export interface EstimateInput {
  service: string;
  bedrooms: string;
  bathrooms: string;
  frequency: string;
  extras: string[];
  zone: ZoneKey | null;
}

export interface EstimateBreakdown {
  base: number;
  serviceLabel: string;
  bedroomAddon: number;
  bathroomAddon: number;
  extrasTotal: number;
  extras: { label: string; price: number }[];
  subtotal: number;
  discountPct: number;
  discountAmount: number;
  distanceFee: number;
  zone: ZoneKey | null;
  total: number;
  manualReview: boolean;
  minimum: number;
}

export const calcEstimateWith = (
  pricing: ResolvedPricing,
  input: EstimateInput
): EstimateBreakdown | null => {
  if (!input.service) return null;
  const svc = pricing.services.find((s) => s.key === input.service);
  if (!svc) return null;

  const base = svc.base;
  const bedroomAddon = pricing.bedrooms.find((b) => b.key === input.bedrooms)?.addon ?? 0;
  const bathroomAddon = pricing.bathrooms.find((b) => b.key === input.bathrooms)?.addon ?? 0;

  const extras = pricing.extras
    .filter((e) => input.extras.includes(e.key))
    .map((e) => ({ label: e.label, price: e.price }));
  const extrasTotal = extras.reduce((s, e) => s + e.price, 0);

  const subtotal = base + bedroomAddon + bathroomAddon + extrasTotal;

  const freq = pricing.frequencies.find((f) => f.key === input.frequency);
  const discountPct = freq?.discount ?? 0;
  const discountAmount = Math.round(subtotal * discountPct);

  const zoneCfg = input.zone ? pricing.zones.find((z) => z.key === input.zone) : null;
  const distanceFee = zoneCfg?.fee ?? 0;
  const manualReview = zoneCfg?.manualReview ?? false;

  let total = subtotal - discountAmount + distanceFee;
  if (total < pricing.minimum) total = pricing.minimum;

  return {
    base,
    serviceLabel: svc.label,
    bedroomAddon,
    bathroomAddon,
    extrasTotal,
    extras,
    subtotal,
    discountPct,
    discountAmount,
    distanceFee,
    zone: input.zone,
    total,
    manualReview,
    minimum: pricing.minimum,
  };
};

// Backwards-compatible default (used as fallback before DB loads)
export const calcEstimate = (input: EstimateInput): EstimateBreakdown | null =>
  calcEstimateWith(DEFAULT_RESOLVED, input);

export const formatUSD = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

// Default seed values (used by Reset button in admin)
export const DEFAULT_PRICING_SEED: Omit<PricingRule, "id">[] = [
  // services
  { category: "service", name: "standard", label: "Standard Cleaning", value: 120, value_type: "fixed_amount", active: true, sort_order: 1 },
  { category: "service", name: "deep", label: "Deep Cleaning", value: 220, value_type: "fixed_amount", active: true, sort_order: 2 },
  { category: "service", name: "move", label: "Move In / Move Out", value: 260, value_type: "fixed_amount", active: true, sort_order: 3 },
  { category: "service", name: "recurring", label: "Recurring Cleaning", value: 110, value_type: "fixed_amount", active: true, sort_order: 4 },
  { category: "service", name: "office", label: "Office Cleaning", value: 180, value_type: "fixed_amount", active: true, sort_order: 5 },
  { category: "service", name: "clinic", label: "Clinic Cleaning", value: 220, value_type: "fixed_amount", active: true, sort_order: 6 },
  { category: "service", name: "retail", label: "Retail Cleaning", value: 160, value_type: "fixed_amount", active: true, sort_order: 7 },
  { category: "service", name: "post_construction", label: "Post Construction Cleaning", value: 300, value_type: "fixed_amount", active: true, sort_order: 8 },
  // bedrooms
  { category: "bedroom", name: "0", label: "Studio", value: 0, value_type: "fixed_amount", active: true, sort_order: 1 },
  { category: "bedroom", name: "1", label: "1 Bedroom", value: 0, value_type: "fixed_amount", active: true, sort_order: 2 },
  { category: "bedroom", name: "2", label: "2 Bedrooms", value: 25, value_type: "fixed_amount", active: true, sort_order: 3 },
  { category: "bedroom", name: "3", label: "3 Bedrooms", value: 50, value_type: "fixed_amount", active: true, sort_order: 4 },
  { category: "bedroom", name: "4", label: "4 Bedrooms", value: 80, value_type: "fixed_amount", active: true, sort_order: 5 },
  { category: "bedroom", name: "5+", label: "5+ Bedrooms", value: 120, value_type: "fixed_amount", active: true, sort_order: 6 },
  // bathrooms
  { category: "bathroom", name: "1", label: "1 Bathroom", value: 0, value_type: "fixed_amount", active: true, sort_order: 1 },
  { category: "bathroom", name: "2", label: "2 Bathrooms", value: 35, value_type: "fixed_amount", active: true, sort_order: 2 },
  { category: "bathroom", name: "3", label: "3 Bathrooms", value: 70, value_type: "fixed_amount", active: true, sort_order: 3 },
  { category: "bathroom", name: "4+", label: "4+ Bathrooms", value: 110, value_type: "fixed_amount", active: true, sort_order: 4 },
  // frequency
  { category: "frequency", name: "one_time", label: "One-Time", value: 0, value_type: "percentage", active: true, sort_order: 1 },
  { category: "frequency", name: "weekly", label: "Weekly", value: 15, value_type: "percentage", active: true, sort_order: 2 },
  { category: "frequency", name: "biweekly", label: "Bi-Weekly", value: 10, value_type: "percentage", active: true, sort_order: 3 },
  { category: "frequency", name: "monthly", label: "Monthly", value: 5, value_type: "percentage", active: true, sort_order: 4 },
  // zones
  { category: "zone", name: "regular", label: "Regular Service Area", value: 0, value_type: "fixed_amount", active: true, sort_order: 1 },
  { category: "zone", name: "extended", label: "Extended Service Area", value: 25, value_type: "fixed_amount", active: true, sort_order: 2 },
  { category: "zone", name: "request", label: "By Request", value: 0, value_type: "manual_review", active: true, sort_order: 3 },
  // extras
  { category: "extra", name: "oven", label: "Inside oven", value: 35, value_type: "fixed_amount", active: true, sort_order: 1 },
  { category: "extra", name: "fridge", label: "Inside fridge", value: 35, value_type: "fixed_amount", active: true, sort_order: 2 },
  { category: "extra", name: "windows", label: "Interior windows", value: 50, value_type: "fixed_amount", active: true, sort_order: 3 },
  { category: "extra", name: "laundry", label: "Laundry", value: 40, value_type: "fixed_amount", active: true, sort_order: 4 },
  { category: "extra", name: "cabinets", label: "Cabinets interior", value: 60, value_type: "fixed_amount", active: true, sort_order: 5 },
  { category: "extra", name: "pets", label: "Pet hair extra", value: 30, value_type: "fixed_amount", active: true, sort_order: 6 },
  { category: "extra", name: "basement", label: "Basement", value: 50, value_type: "fixed_amount", active: true, sort_order: 7 },
  { category: "extra", name: "garage", label: "Garage", value: 60, value_type: "fixed_amount", active: true, sort_order: 8 },
  // settings
  { category: "setting", name: "minimum_price", label: "Minimum price", value: 95, value_type: "fixed_amount", active: true, sort_order: 1 },
  { category: "setting", name: "emergency_fee", label: "Emergency / same-day fee", value: 60, value_type: "fixed_amount", active: true, sort_order: 2 },
];
