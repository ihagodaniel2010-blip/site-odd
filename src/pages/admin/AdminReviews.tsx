import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { isMissingRelationError } from "@/lib/supabaseErrors";
import { toast } from "sonner";

type Review = {
  id: string;
  customer_name: string;
  rating: number;
  review_text: string;
  is_featured: boolean;
  is_public: boolean;
};

const AdminReviews = () => {
  const [rows, setRows] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [schemaMissing, setSchemaMissing] = useState(false);
  const [form, setForm] = useState({
    customer_name: "",
    rating: "5",
    review_text: "",
    is_featured: false,
    is_public: true,
  });

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });

    if (error) {
      if (isMissingRelationError(error)) {
        setSchemaMissing(true);
        setRows([]);
      } else {
        toast.error(error.message);
      }
      setLoading(false);
      return;
    }

    setSchemaMissing(false);
    setRows((data as Review[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("reviews").insert({
      customer_name: form.customer_name,
      rating: Number(form.rating),
      review_text: form.review_text,
      is_featured: form.is_featured,
      is_public: form.is_public,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Review saved");
    setForm({ customer_name: "", rating: "5", review_text: "", is_featured: false, is_public: true });
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="p-6 md:p-10 max-w-7xl space-y-6">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Content</p>
              <h1 className="font-display text-3xl font-semibold text-foreground mt-1">Reviews</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage testimonials shown on the public site.</p>
            </div>
            <Button variant="outline" onClick={load}>Refresh</Button>
          </header>

          <form onSubmit={save} className="bg-surface rounded-2xl border border-border shadow-card p-5 grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Customer name</Label>
              <Input required value={form.customer_name} onChange={(e) => setForm((f) => ({ ...f, customer_name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Rating (1-5)</Label>
              <Input required type="number" min="1" max="5" value={form.rating} onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Review</Label>
              <Textarea required rows={3} value={form.review_text} onChange={(e) => setForm((f) => ({ ...f, review_text: e.target.value }))} />
            </div>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <Checkbox checked={form.is_featured} onCheckedChange={(v) => setForm((f) => ({ ...f, is_featured: Boolean(v) }))} />
              Featured review
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <Checkbox checked={form.is_public} onCheckedChange={(v) => setForm((f) => ({ ...f, is_public: Boolean(v) }))} />
              Publicly visible
            </label>
            <div className="md:col-span-2">
              <Button type="submit" variant="hero">Save review</Button>
            </div>
          </form>

          <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
            {loading ? (
              <div className="p-10 text-center text-sm text-muted-foreground">Loading...</div>
            ) : schemaMissing ? (
              <div className="p-12 text-center space-y-2">
                <Star className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="font-semibold text-foreground">Reviews table not available yet</p>
                <p className="text-sm text-muted-foreground">Apply the latest Supabase migrations.</p>
              </div>
            ) : rows.length === 0 ? (
              <div className="p-10 text-center text-sm text-muted-foreground">No reviews yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="text-left px-4 py-3">Customer</th>
                      <th className="text-left px-4 py-3">Rating</th>
                      <th className="text-left px-4 py-3">Review</th>
                      <th className="text-left px-4 py-3">Visibility</th>
                      <th className="text-left px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rows.map((r) => (
                      <tr key={r.id}>
                        <td className="px-4 py-3 font-medium text-foreground">{r.customer_name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{r.rating}/5</td>
                        <td className="px-4 py-3 text-muted-foreground max-w-[420px]">{r.review_text}</td>
                        <td className="px-4 py-3 text-muted-foreground">{r.is_public ? "Public" : "Private"}{r.is_featured ? " / Featured" : ""}</td>
                        <td className="px-4 py-3">
                          <Button variant="outline" size="sm" onClick={() => remove(r.id)}>Delete</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
};

export default AdminReviews;
