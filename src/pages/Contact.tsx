import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, Mail, MapPin, Phone, Send, Sparkles } from "lucide-react";
import { Layout } from "@/components/Layout";
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
    address: "",
    zip_code: params.get("zip") ?? "",
    city: "",
    service_type: "" as ServiceKey | "",
    property_type: "",
    bedrooms: "1",
    bathrooms: "1",
    frequency: "one_time" as FrequencyKey | "",
    preferred_date: "",
    preferred_time: "",
    notes: "",
    extras: [] as string[],
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const zone = useMemo(() => findZoneForCity(areas, form.city), [areas, form.city]);

  const breakdown = useMemo(
    () =>
      calcEstimateWith(pricing, {
        service: form.service_type,
        bedrooms: form.bedrooms,
        bathrooms: form.bathrooms,
        frequency: form.frequency,
        extras: form.extras,
        zone,
      }),
    [pricing, form.service_type, form.bedrooms, form.bathrooms, form.frequency, form.extras, zone]
  );

  const toggleExtra = (key: string) =>
    set(
      "extras",
      form.extras.includes(key)
        ? form.extras.filter((k) => k !== key)
        : [...form.extras, key]
    );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.service_type) {
      toast.error("Please select a service type");
      return;
    }
    setSubmitting(true);

    const payload = {
      full_name: form.full_name,
      phone: form.phone,
      email: form.email,
      address: form.address,
      zip_code: form.zip_code,
      city: form.city || null,
      service_type: form.service_type,
      property_type: form.property_type || null,
      bedrooms: form.bedrooms,
      bathrooms: form.bathrooms,
      frequency: form.frequency || null,
      preferred_date: form.preferred_date || null,
      preferred_time: form.preferred_time || null,
      notes: form.notes || null,
      calculated_estimate: breakdown && !breakdown.manualReview ? breakdown.total : null,
      estimate_breakdown: breakdown ? (breakdown as any) : null,
      service_zone: zone,
    };

    const { error } = await supabase.from("estimate_requests").insert(payload);
    setSubmitting(false);

    if (error) {
      console.error(error);
      toast.error("Could not submit your request. Please try again or call us.");
      return;
    }
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (submitted) document.title = `Thank you — ${companyName}`;
  }, [submitted, companyName]);

  return (
    <Layout>
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

      <section className="container py-12 md:py-16 grid lg:grid-cols-[1fr_1.6fr] gap-10">
        {/* Sidebar: contact info + live estimate */}
        <aside className="space-y-5 lg:sticky lg:top-28 self-start">
          {/* Live estimate card */}
          {!submitted && (
            <div className="bg-gradient-to-br from-primary to-primary-strong text-primary-foreground rounded-2xl p-6 shadow-strong">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4" />
                <p className="text-xs uppercase tracking-wider font-semibold opacity-90">Your Estimate</p>
              </div>
              {breakdown ? (
                breakdown.manualReview ? (
                  <>
                    <p className="font-display text-2xl font-semibold leading-tight mb-2">Manual review</p>
                    <p className="text-sm opacity-90 leading-relaxed">
                      This area may require manual review. Submit your request and our team will confirm pricing.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-display text-5xl font-semibold leading-none mb-1">
                      {formatUSD(breakdown.total)}
                    </p>
                    <p className="text-sm opacity-90">{breakdown.serviceLabel}</p>
                    <div className="mt-5 pt-5 border-t border-white/20 space-y-1.5 text-sm">
                      <Row label="Base price" value={formatUSD(breakdown.base)} />
                      {breakdown.bedroomAddon > 0 && <Row label="Bedrooms" value={`+${formatUSD(breakdown.bedroomAddon)}`} />}
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
                  <p className="text-sm opacity-90">Pick a service type to see your live price.</p>
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
        <div className="bg-surface rounded-2xl p-6 md:p-10 border border-border shadow-strong">
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
            <form onSubmit={onSubmit} className="space-y-6">
              <Section title="Contact details">
                <div className="grid md:grid-cols-2 gap-5">
                  <Field label="Full Name">
                    <Input required value={form.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="Jane Doe" className="h-11 rounded-lg" />
                  </Field>
                  <Field label="Phone Number">
                    <Input required type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="(978) 000-0000" className="h-11 rounded-lg" />
                  </Field>
                  <Field label="Email">
                    <Input required type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@email.com" className="h-11 rounded-lg" />
                  </Field>
                  <Field label="ZIP Code">
                    <Input required value={form.zip_code} onChange={(e) => set("zip_code", e.target.value)} placeholder="01852" className="h-11 rounded-lg" />
                  </Field>
                  <Field label="Address" full>
                    <Input required value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="123 Main St" className="h-11 rounded-lg" />
                  </Field>
                  <Field label="City" full>
                    <Select value={form.city} onValueChange={(v) => set("city", v)}>
                      <SelectTrigger className="h-11 rounded-lg"><SelectValue placeholder="Select your city" /></SelectTrigger>
                      <SelectContent className="max-h-72">
                        {areas.map((a) => (
                          <SelectItem key={a.id} value={a.city}>{a.city}, {a.state}</SelectItem>
                        ))}
                        <SelectItem value="other">Other (not listed)</SelectItem>
                      </SelectContent>
                    </Select>
                    {zone === "request" && (
                      <p className="text-xs text-warning mt-1">This area may require manual review — we'll confirm pricing.</p>
                    )}
                    {zone === "extended" && (
                      <p className="text-xs text-muted-foreground mt-1">Extended service area — small distance fee applies.</p>
                    )}
                  </Field>
                </div>
              </Section>

              <Section title="Service details">
                <div className="grid md:grid-cols-2 gap-5">
                  <Field label="Service Type">
                    <Select value={form.service_type} onValueChange={(v) => set("service_type", v as ServiceKey)}>
                      <SelectTrigger className="h-11 rounded-lg"><SelectValue placeholder="Select service" /></SelectTrigger>
                      <SelectContent>
                        {pricing.services.map((s) => (
                          <SelectItem key={s.key} value={s.key}>
                            {s.label} — from {formatUSD(s.base)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Property Type">
                    <Select value={form.property_type} onValueChange={(v) => set("property_type", v)}>
                      <SelectTrigger className="h-11 rounded-lg"><SelectValue placeholder="Select property" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="house">Single-Family Home</SelectItem>
                        <SelectItem value="office">Office</SelectItem>
                        <SelectItem value="clinic">Clinic</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Bedrooms">
                    <Select value={form.bedrooms} onValueChange={(v) => set("bedrooms", v)}>
                      <SelectTrigger className="h-11 rounded-lg"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {pricing.bedrooms.map((b) => (
                          <SelectItem key={b.key} value={b.key}>
                            {b.label} {b.addon > 0 && `(+${formatUSD(b.addon)})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Bathrooms">
                    <Select value={form.bathrooms} onValueChange={(v) => set("bathrooms", v)}>
                      <SelectTrigger className="h-11 rounded-lg"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {pricing.bathrooms.map((b) => (
                          <SelectItem key={b.key} value={b.key}>
                            {b.label} {b.addon > 0 && `(+${formatUSD(b.addon)})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Frequency">
                    <Select value={form.frequency} onValueChange={(v) => set("frequency", v as FrequencyKey)}>
                      <SelectTrigger className="h-11 rounded-lg"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {pricing.frequencies.map((f) => (
                          <SelectItem key={f.key} value={f.key}>
                            {f.label} {f.discount > 0 && `(${Math.round(f.discount * 100)}% off)`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Preferred Date">
                    <Input type="date" value={form.preferred_date} onChange={(e) => set("preferred_date", e.target.value)} className="h-11 rounded-lg" />
                  </Field>
                  <Field label="Preferred Time" full>
                    <Select value={form.preferred_time} onValueChange={(v) => set("preferred_time", v)}>
                      <SelectTrigger className="h-11 rounded-lg"><SelectValue placeholder="Select time" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning (8 – 12)</SelectItem>
                        <SelectItem value="afternoon">Afternoon (12 – 5)</SelectItem>
                        <SelectItem value="evening">Evening (5 – 8)</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </Section>

              <Section title="Extras (optional)">
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
              </Section>

              <Section title="Notes">
                <Textarea
                  rows={4}
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Tell us anything that helps us prepare — pets, focus areas, access details, etc."
                  className="rounded-lg resize-none"
                />
              </Section>

              <Button type="submit" variant="hero" size="xl" disabled={submitting} className="w-full sm:w-auto">
                {submitting ? "Submitting…" : "Submit Estimate Request"} <Send className="h-4 w-4" />
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
    <h3 className="font-display text-base font-semibold text-foreground uppercase tracking-wider text-xs">{title}</h3>
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
