import { useEffect, useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { isMissingRelationError } from "@/lib/supabaseErrors";
import { toast } from "sonner";

type Booking = {
  id: string;
  service_request_id: string | null;
  cleaner_id: string | null;
  scheduled_date: string;
  scheduled_time: string | null;
  price: number | null;
  status: string;
  notes: string | null;
  created_at: string;
};

type ServiceRequest = {
  id: string;
  full_name: string;
};

type Cleaner = {
  id: string;
  full_name: string;
};

const BOOKING_STATUS = ["scheduled", "in_progress", "completed", "cancelled"] as const;

const AdminCalendar = () => {
  const [rows, setRows] = useState<Booking[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [cleaners, setCleaners] = useState<Cleaner[]>([]);
  const [loading, setLoading] = useState(true);
  const [schemaMissing, setSchemaMissing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    service_request_id: "",
    cleaner_id: "",
    scheduled_date: "",
    scheduled_time: "",
    price: "",
    status: "scheduled",
    notes: "",
  });

  const load = async () => {
    setLoading(true);

    const [{ data: bookingsData, error: bookingsError }, { data: reqData }, { data: cleanerData }] =
      await Promise.all([
        supabase
          .from("bookings")
          .select("id,service_request_id,cleaner_id,scheduled_date,scheduled_time,price,status,notes,created_at")
          .order("scheduled_date", { ascending: true }),
        supabase.from("service_requests").select("id,full_name").order("created_at", { ascending: false }).limit(100),
        supabase.from("cleaners").select("id,full_name").order("full_name"),
      ]);

    if (bookingsError) {
      if (isMissingRelationError(bookingsError)) {
        setSchemaMissing(true);
        setRows([]);
      } else {
        toast.error(bookingsError.message);
      }
      setLoading(false);
      return;
    }

    setSchemaMissing(false);
    setRows((bookingsData as Booking[]) ?? []);
    setRequests((reqData as ServiceRequest[]) ?? []);
    setCleaners((cleanerData as Cleaner[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, Booking[]>();
    rows.forEach((r) => {
      const key = r.scheduled_date || "unscheduled";
      const list = map.get(key) ?? [];
      list.push(r);
      map.set(key, list);
    });
    return Array.from(map.entries());
  }, [rows]);

  const createBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await supabase.from("bookings").insert({
      service_request_id: form.service_request_id || null,
      cleaner_id: form.cleaner_id || null,
      scheduled_date: form.scheduled_date,
      scheduled_time: form.scheduled_time || null,
      price: form.price ? Number(form.price) : null,
      status: form.status,
      notes: form.notes || null,
    });

    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Booking created");
    setForm({
      service_request_id: "",
      cleaner_id: "",
      scheduled_date: "",
      scheduled_time: "",
      price: "",
      status: "scheduled",
      notes: "",
    });
    load();
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="p-6 md:p-10 max-w-7xl space-y-6">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Operations</p>
              <h1 className="font-display text-3xl font-semibold text-foreground mt-1">Bookings & Schedule</h1>
              <p className="text-sm text-muted-foreground mt-1">Create bookings, assign cleaners, and update job status.</p>
            </div>
            <Button variant="outline" onClick={load}>Refresh</Button>
          </header>

          <form onSubmit={createBooking} className="bg-surface rounded-2xl border border-border p-5 md:p-6 shadow-card grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Service request</Label>
              <Select value={form.service_request_id} onValueChange={(v) => setForm((f) => ({ ...f, service_request_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent>
                  {requests.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cleaner</Label>
              <Select value={form.cleaner_id} onValueChange={(v) => setForm((f) => ({ ...f, cleaner_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent>
                  {cleaners.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {BOOKING_STATUS.map((s) => (
                    <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" required value={form.scheduled_date} onChange={(e) => setForm((f) => ({ ...f, scheduled_date: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Input type="time" value={form.scheduled_time} onChange={(e) => setForm((f) => ({ ...f, scheduled_time: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Price</Label>
              <Input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
            </div>
            <div className="space-y-2 md:col-span-3">
              <Label>Notes</Label>
              <Input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            </div>
            <div className="md:col-span-3">
              <Button type="submit" variant="hero" disabled={submitting}>{submitting ? "Saving..." : "Create booking"}</Button>
            </div>
          </form>

          <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
            {loading ? (
              <div className="p-10 text-center text-sm text-muted-foreground">Loading...</div>
            ) : schemaMissing ? (
              <div className="p-12 text-center space-y-2">
                <CalendarDays className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="font-semibold text-foreground">Bookings table not available yet</p>
                <p className="text-sm text-muted-foreground">Apply the latest Supabase migrations to enable this module.</p>
              </div>
            ) : grouped.length === 0 ? (
              <div className="p-10 text-center text-sm text-muted-foreground">No bookings yet.</div>
            ) : (
              <div className="divide-y divide-border">
                {grouped.map(([date, items]) => (
                  <section key={date} className="p-5 space-y-3">
                    <h2 className="font-display text-lg font-semibold text-foreground">
                      {date === "unscheduled" ? "Unscheduled" : new Date(date).toLocaleDateString()}
                    </h2>
                    <div className="space-y-2">
                      {items.map((b) => (
                        <div key={b.id} className="rounded-xl border border-border p-3 flex flex-wrap items-center gap-3 justify-between">
                          <div className="text-sm">
                            <p className="font-medium text-foreground">{b.scheduled_time || "No time set"}</p>
                            <p className="text-muted-foreground">{b.notes || "No notes"}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Select value={b.status} onValueChange={(v) => updateStatus(b.id, v)}>
                              <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {BOOKING_STATUS.map((s) => (
                                  <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
};

export default AdminCalendar;
