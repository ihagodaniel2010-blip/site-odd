import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, Mail, MapPin, Phone, Send, Sparkles } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  ServiceKey,
  FrequencyKey,
  calcEstimateWith,
  formatUSD,
} from "@/lib/pricing";
import { usePricingRules } from "@/hooks/usePricingRules";
import { useAreas, findZoneForCity } from "@/hooks/useAreas";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { supabase } from "@/integrations/supabase/client";
import type { Database, Json } from "@/integrations/supabase/types";
import { toast } from "sonner";

const Field = ({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) => (
  <div className={`space-y-2 ${full ? "md:col-span-2" : ""}`}>
    <Label className="text-sm font-medium text-foreground">{label}</Label>
    {children}
  </div>
);

const Contact = () => {
  const [params] = useSearchParams();
  const { areas } = useAreas();
  const { pricing } = usePricingRules();
  const { settings } = useSiteSettings();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const companyName = settings.company_name || "Paiva Cleaners Co.";
  const contactTitle = settings.contact_title || "Get Your Free Cleaning Estimate";
  const contactSubtitle =
    settings.contact_subtitle || "Tell us about your space and see your estimated price instantly.";
  const phone = settings.phone;
  const phoneHref = settings.phone_href || `tel:${settings.phone}`;
  const email = settings.email;
  const addressLine1 = settings.address_line_1;
  const addressLine2 = settings.address_line_2;

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    zip_code: params.get("zip") ?? "",
    city: params.get("city") ?? "",
    service_type: "" as ServiceKey | "",
    home_size: params.get("size") ?? "",
    bedrooms: "",
    bathrooms: "",
    frequency: "one_time" as FrequencyKey | "",
    property_type: "",
    move_details: "",
    other_notes: "",
    preferred_date: "",
    preferred_time: "",
    notes: "",
    extras: [] as string[],
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    const queryService = params.get("service") as ServiceKey | null;
    const queryFrequency = params.get("frequency") as FrequencyKey | null;
    const querySize = params.get("size");

    setForm((previous) => {
      const next = { ...previous };
      if (queryService && pricing.services.some((service) => service.key === queryService)) {
        next.service_type = queryService;
      }
      if (queryFrequency && pricing.frequencies.some((frequency) => frequency.key === queryFrequency)) {
        next.frequency = queryFrequency;
      }
      if (querySize && pricing.bedrooms.some((size) => size.key === querySize)) {
        next.home_size = querySize;
      }
      if (!next.home_size && pricing.bedrooms[0]) {
        next.home_size = pricing.bedrooms[0].key;
      }
      if (!next.frequency && pricing.frequencies[0]) {
        next.frequency = pricing.frequencies[0].key as FrequencyKey;
      }
      return next;
    });
  }, [params, pricing.bedrooms, pricing.frequencies, pricing.services]);

  const zone = useMemo(() => findZoneForCity(areas, form.city), [areas, form.city]);

  const effectiveBedrooms = form.bedrooms || form.home_size;
  const effectiveBathrooms = form.bathrooms || "1";

  const breakdown = useMemo(
    () =>
      calcEstimateWith(pricing, {
        service: form.service_type,
        bedrooms: effectiveBedrooms,
        bathrooms: effectiveBathrooms,
        frequency: form.frequency,
        extras: form.extras,
        zone,
      }),
    [pricing, form.service_type, effectiveBedrooms, effectiveBathrooms, form.frequency, form.extras, zone]
  );

  const estimateRange = useMemo(() => {
    if (!breakdown || breakdown.manualReview) return null;

    const min = Math.max(
      breakdown.minimum,
      Math.round((breakdown.total * 0.9) / 5) * 5
    );
    const max = Math.max(min + 5, Math.round((breakdown.total * 1.15) / 5) * 5);

    return { min, max };
  }, [breakdown]);

  const toggleExtra = (key: string) =>
    set(
      "extras",
      form.extras.includes(key)
        ? form.extras.filter((k) => k !== key)
        : [...form.extras, key]
    );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.phone || !form.zip_code || !form.city || !form.service_type || !form.home_size || !form.frequency) {
      toast.error("Please complete all required quote fields.");
      return;
    }
    setSubmitting(true);

    const cleanedNotes = [form.notes.trim(), form.other_notes.trim(), form.move_details.trim()]
      .filter(Boolean)
      .join("\n\n");

    const estimatePayload = {
      ...(breakdown ?? {}),
      home_size: form.home_size,
      bedrooms_selected: effectiveBedrooms,
      bathrooms_selected: effectiveBathrooms,
      extras_selected: form.extras,
      estimated_price_min: estimateRange?.min ?? null,
      estimated_price_max: estimateRange?.max ?? null,
    };

    const fallbackEmail = `${form.phone.replace(/\D/g, "") || "no-phone"}@no-email.local`;

    const payload = {
      full_name: form.full_name,
      phone: form.phone,
      email: form.email.trim() || fallbackEmail,
      address: "Not provided",
      zip_code: form.zip_code,
      city: form.city || null,
      service_type: form.service_type,
      property_type: form.property_type || null,
      bedrooms: effectiveBedrooms,
      bathrooms: effectiveBathrooms,
      frequency: form.frequency || null,
      preferred_date: form.preferred_date || null,
      preferred_time: form.preferred_time || null,
      notes: cleanedNotes || null,
      calculated_estimate:
        estimateRange && !breakdown?.manualReview
          ? Math.round((estimateRange.min + estimateRange.max) / 2)
          : null,
      estimate_breakdown: estimatePayload as Json,
      service_zone: zone,
    } satisfies Database["public"]["Tables"]["estimate_requests"]["Insert"];

    const { error } = await supabase.from("estimate_requests").insert(payload);
    setSubmitting(false);

    if (error) {
      console.error(error);
      toast.error("Could not submit your request. Please try again or call us.");
      return;
    }

    toast.success("Request sent. We will confirm your estimate shortly.");
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (submitted) document.title = `Thank you — ${companyName}`;
  }, [submitted, companyName]);

  return (
    <Layout>
      <Seo
        title="Get a Cleaning Quote in 60 Seconds | Paiva Cleaners Co."
        description="Request your instant cleaning quote for Lowell, Chelmsford, Dracut, Tewksbury, Billerica, and Westford. Call, SMS, or book online today."
        canonicalPath="/contact"
        keywords={[
          "cleaning quote lowell ma",
          "book house cleaning lowell",
          "cleaning estimate chelmsford ma",
          "maid service quote dracut ma",
        ]}
      />
      <section className="relative bg-gradient-to-b from-secondary/60 to-background">
        <div className="container py-14 md:py-20 text-center max-w-3xl mx-auto space-y-5 reveal">
          <span className="inline-block text-xs uppercase tracking-[0.22em] font-semibold text-primary px-3 py-1 rounded-full bg-surface shadow-soft">
            Instant Estimate
          </span>
          <h1 className="font-display text-4xl md:text-6xl font-semibold text-foreground text-balance leading-[1.05]">
            {contactTitle}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {contactSubtitle} {companyName} will follow up to confirm details.
          </p>
        </div>
      </section>

      <section className="container py-8 md:py-12 grid gap-6 lg:grid-cols-[1fr_1.55fr] lg:gap-8">
        {/* Sidebar: contact info + live estimate */}
        <aside className="space-y-4 lg:sticky lg:top-28 self-start">
          {/* Live estimate card */}
          {!submitted && (
            <div className="bg-gradient-to-br from-primary to-primary-strong text-primary-foreground rounded-2xl p-5 md:p-6 shadow-strong">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4" />
                <p className="text-xs uppercase tracking-wider font-semibold opacity-90">Estimated Price</p>
              </div>
              {breakdown ? (
                breakdown.manualReview ? (
                  <>
                    <p className="font-display text-2xl font-semibold leading-tight mb-2">Starting estimate</p>
                    <p className="text-sm opacity-90 leading-relaxed">
                      This area may require manual review. Submit your request and our team will confirm pricing.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-display text-3xl md:text-4xl font-semibold leading-tight mb-1">
                      {estimateRange ? `${formatUSD(estimateRange.min)} - ${formatUSD(estimateRange.max)}` : formatUSD(breakdown.total)}
                    </p>
                    <p className="text-sm opacity-90">{breakdown.serviceLabel}</p>
                    <p className="text-xs opacity-90 mt-1">Final price may vary after confirmation.</p>
                    <div className="mt-5 pt-5 border-t border-white/20 space-y-1.5 text-sm">
                      <Row label="Base price" value={formatUSD(breakdown.base)} />
                      {breakdown.bedroomAddon > 0 && <Row label="Home size" value={`+${formatUSD(breakdown.bedroomAddon)}`} />}
                      {breakdown.bathroomAddon > 0 && <Row label="Bathrooms" value={`+${formatUSD(breakdown.bathroomAddon)}`} />}
                      {breakdown.extras.map((e) => (
                        <Row key={e.label} label={e.label} value={`+${formatUSD(e.price)}`} />
                      ))}
                      {breakdown.discountAmount > 0 && (
                        <Row label={`Frequency discount (${Math.round(breakdown.discountPct * 100)}%)`} value={`−${formatUSD(breakdown.discountAmount)}`} />
                      )}
                      {breakdown.distanceFee > 0 && <Row label="Distance fee" value={`+${formatUSD(breakdown.distanceFee)}`} />}
                    </div>
                  </>
                )
              ) : (
                <>
                  <p className="font-display text-2xl font-semibold mb-1">Choose a service</p>
                  <p className="text-sm opacity-90">Complete the first section to see your live range.</p>
                </>
              )}
            </div>
          )}

          <div className="bg-surface rounded-2xl p-6 border border-border shadow-card space-y-5">
            <h2 className="font-display text-xl font-semibold text-foreground">Talk to us directly</h2>
            <div className="space-y-4 text-sm">
              <a href={phoneHref} className="flex items-start gap-3 group">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-primary shrink-0">
                  <Phone className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Call</p>
                  <p className="font-semibold text-foreground group-hover:text-primary transition-smooth">{phone}</p>
                </div>
              </a>
              <a href={`mailto:${email}`} className="flex items-start gap-3 group">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-primary shrink-0">
                  <Mail className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Email</p>
                  <p className="font-semibold text-foreground group-hover:text-primary transition-smooth">{email}</p>
                </div>
              </a>
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-primary shrink-0">
                  <MapPin className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Office</p>
                  <p className="font-semibold text-foreground">{addressLine1}<br />{addressLine2}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Form */}
        <div className="bg-surface rounded-2xl p-4 sm:p-6 md:p-8 border border-border shadow-strong">
          {submitted ? (
            <div className="py-12 text-center space-y-4 animate-scale-in">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success/15 text-success">
                <CheckCircle2 className="h-8 w-8" />
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground">
                Estimate Request Received
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                Thank you! Your estimate request was received. {companyName} will contact you shortly to confirm the details.
              </p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Submit another request
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <Section title="Step 1 — Quote essentials">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Field label="Zip Code">
                    <Input required value={form.zip_code} onChange={(e) => set("zip_code", e.target.value)} placeholder="01852" className="h-12 rounded-xl" />
                  </Field>
                  <Field label="City">
                    <Input required value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Type your city" className="h-12 rounded-xl" />
                  </Field>
                  <Field label="Service Type">
                    <Select value={form.service_type} onValueChange={(v) => set("service_type", v as ServiceKey)}>
                      <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select service" /></SelectTrigger>
                      <SelectContent>
                        {pricing.services.map((s) => (
                          <SelectItem key={s.key} value={s.key}>
                            {s.label} - from {formatUSD(s.base)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Home Size">
                    <Select value={form.home_size} onValueChange={(v) => set("home_size", v)}>
                      <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select home size" /></SelectTrigger>
                      <SelectContent>
                        {pricing.bedrooms.map((size) => (
                          <SelectItem key={size.key} value={size.key}>
                            {size.label} {size.addon > 0 && `(+${formatUSD(size.addon)})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Frequency" full>
                    <Select value={form.frequency} onValueChange={(v) => set("frequency", v as FrequencyKey)}>
                      <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Select frequency" /></SelectTrigger>
                      <SelectContent>
                        {pricing.frequencies.map((f) => (
                          <SelectItem key={f.key} value={f.key}>
                            {f.label} {f.discount > 0 && `(${Math.round(f.discount * 100)}% off)`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                {zone === "request" && (
                  <p className="text-xs text-warning mt-1">This city is in a request-only zone. We will confirm final pricing manually.</p>
                )}
                {zone === "extended" && (
                  <p className="text-xs text-muted-foreground mt-1">Extended area detected. A small distance fee may apply.</p>
                )}
              </Section>

              <Section title="Step 2 — Contact">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <Field label="Name">
                    <Input required value={form.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="Jane Doe" className="h-12 rounded-xl" />
                  </Field>
                  <Field label="Phone">
                    <Input required type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="(978) 000-0000" className="h-12 rounded-xl" />
                  </Field>
                  <Field label="Email (optional)">
                    <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@email.com" className="h-12 rounded-xl" />
                  </Field>
                  <Field label="Notes (optional)">
                    <Input value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Any quick note for our team" className="h-12 rounded-xl" />
                  </Field>
                </div>
              </Section>

              <Accordion type="single" collapsible className="rounded-2xl border border-border px-4 bg-secondary/20">
                <AccordionItem value="extras" className="border-none">
                  <AccordionTrigger className="py-3 text-sm font-semibold text-foreground hover:no-underline">
                    More details and extra options
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <Field label="Exact Bedrooms (optional)">
                          <Select value={form.bedrooms} onValueChange={(v) => set("bedrooms", v)}>
                            <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Use home size" /></SelectTrigger>
                            <SelectContent>
                              {pricing.bedrooms.map((b) => (
                                <SelectItem key={b.key} value={b.key}>
                                  {b.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field label="Bathrooms (optional)">
                          <Select value={form.bathrooms} onValueChange={(v) => set("bathrooms", v)}>
                            <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="1 Bathroom" /></SelectTrigger>
                            <SelectContent>
                              {pricing.bathrooms.map((b) => (
                                <SelectItem key={b.key} value={b.key}>
                                  {b.label} {b.addon > 0 && `(+${formatUSD(b.addon)})`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field label="Property Type">
                          <Select value={form.property_type} onValueChange={(v) => set("property_type", v)}>
                            <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Optional" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="apartment">Apartment</SelectItem>
                              <SelectItem value="house">Single-Family Home</SelectItem>
                              <SelectItem value="office">Office</SelectItem>
                              <SelectItem value="clinic">Clinic</SelectItem>
                              <SelectItem value="retail">Retail</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field label="Move in/out details">
                          <Input value={form.move_details} onChange={(e) => set("move_details", e.target.value)} placeholder="Optional move-related details" className="h-12 rounded-xl" />
                        </Field>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-2">
                        {pricing.extras.map((ex) => {
                          const checked = form.extras.includes(ex.key);
                          return (
                            <label
                              key={ex.key}
                              className={`flex items-center justify-between gap-3 p-3 rounded-xl border cursor-pointer transition-smooth ${
                                checked ? "border-primary bg-primary/5" : "border-border bg-surface hover:border-primary/40"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <Checkbox checked={checked} onCheckedChange={() => toggleExtra(ex.key)} />
                                <span className="text-sm font-medium text-foreground">{ex.label}</span>
                              </div>
                              <span className="text-sm font-semibold text-primary">+{formatUSD(ex.price)}</span>
                            </label>
                          );
                        })}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <Field label="Preferred Date">
                          <Input type="date" value={form.preferred_date} onChange={(e) => set("preferred_date", e.target.value)} className="h-12 rounded-xl" />
                        </Field>
                        <Field label="Preferred Time">
                          <Select value={form.preferred_time} onValueChange={(v) => set("preferred_time", v)}>
                            <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Optional" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="morning">Morning (8 - 12)</SelectItem>
                              <SelectItem value="afternoon">Afternoon (12 - 5)</SelectItem>
                              <SelectItem value="evening">Evening (5 - 8)</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field label="Other notes" full>
                          <Textarea
                            rows={3}
                            value={form.other_notes}
                            onChange={(e) => set("other_notes", e.target.value)}
                            placeholder="Pets, inside fridge/oven, windows, laundry, gate code, or anything else"
                            className="rounded-xl resize-none"
                          />
                        </Field>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <Button type="submit" variant="hero" size="xl" disabled={submitting} className="w-full h-12 rounded-xl">
                {submitting ? "Submitting..." : "Get My Estimate"} <Send className="h-4 w-4" />
              </Button>
              <p className="text-xs text-muted-foreground">
                By submitting, you agree to be contacted about your estimate. We never share your info.
              </p>
            </form>
          )}
        </div>
      </section>
    </Layout>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-3">
    <h3 className="font-display text-xs font-semibold text-foreground uppercase tracking-wider">{title}</h3>
    {children}
  </div>
);

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between">
    <span className="opacity-90">{label}</span>
    <span className="font-semibold">{value}</span>
  </div>
);

export default Contact;
