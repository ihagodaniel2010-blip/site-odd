import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { isMissingRelationError } from "@/lib/supabaseErrors";
import { toast } from "sonner";

type MessageRow = {
  id: string;
  full_name: string | null;
  client_name: string;
  email: string;
  subject: string | null;
  message: string;
  status: string;
  sent_at: string | null;
  created_at: string;
};

const AdminMessages = () => {
  const [rows, setRows] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [schemaMissing, setSchemaMissing] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("sent_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (error) {
      if (isMissingRelationError(error)) {
        setSchemaMissing(true);
        setRows([]);
        setLoading(false);
        return;
      }
      toast.error(error.message);
    }

    setRows((data as MessageRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="p-6 md:p-10 space-y-6 max-w-7xl">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Communication
              </p>
              <h1 className="font-display text-3xl font-semibold text-foreground mt-1">Messages</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Sent messages log from admin follow-ups and estimate replies.
              </p>
            </div>
            <Button variant="outline" onClick={load}>
              Refresh
            </Button>
          </header>

          <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
            {loading ? (
              <div className="p-10 text-center text-sm text-muted-foreground">Loading...</div>
            ) : schemaMissing ? (
              <div className="p-16 text-center space-y-3">
                <div className="mx-auto h-14 w-14 rounded-full bg-secondary grid place-items-center text-muted-foreground">
                  <Mail className="h-6 w-6" />
                </div>
                <h2 className="font-display text-2xl font-semibold text-foreground">Messages module pending database migration.</h2>
                <p className="text-sm text-muted-foreground">
                  Apply Supabase migrations to create the public.messages table.
                </p>
              </div>
            ) : rows.length === 0 ? (
              <div className="p-16 text-center space-y-3">
                <div className="mx-auto h-14 w-14 rounded-full bg-secondary grid place-items-center text-muted-foreground">
                  <Mail className="h-6 w-6" />
                </div>
                <h2 className="font-display text-2xl font-semibold text-foreground">No messages sent yet.</h2>
                <p className="text-sm text-muted-foreground">
                  Messages sent from Estimate Requests will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium">Client / Lead</th>
                      <th className="text-left px-4 py-3 font-medium">Email</th>
                      <th className="text-left px-4 py-3 font-medium">Subject</th>
                      <th className="text-left px-4 py-3 font-medium">Message</th>
                      <th className="text-left px-4 py-3 font-medium">Status</th>
                      <th className="text-left px-4 py-3 font-medium">Sent date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rows.map((r) => (
                      <tr key={r.id} className="hover:bg-secondary/30">
                        <td className="px-4 py-3 font-medium text-foreground">{r.full_name || r.client_name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{r.email}</td>
                        <td className="px-4 py-3 text-muted-foreground">{r.subject || "-"}</td>
                        <td className="px-4 py-3 text-muted-foreground max-w-[380px]">
                          <p className="line-clamp-2">{r.message}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2.5 py-1 rounded-full bg-secondary text-foreground capitalize">
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {(r.sent_at || r.created_at)
                            ? new Date(r.sent_at || r.created_at).toLocaleString()
                            : "-"}
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

export default AdminMessages;
