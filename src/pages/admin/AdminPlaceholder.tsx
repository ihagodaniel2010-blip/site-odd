import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminLayout } from "@/components/admin/AdminLayout";

const ComingSoon = ({ title, description }: { title: string; description: string }) => (
  <AdminGuard>
    <AdminLayout>
      <div className="p-6 md:p-10 max-w-3xl">
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Section
        </p>
        <h1 className="font-display text-3xl font-semibold text-foreground mt-1">{title}</h1>
        <p className="text-muted-foreground mt-3 leading-relaxed">{description}</p>
        <div className="mt-8 bg-surface border border-border rounded-2xl p-8 text-center text-sm text-muted-foreground">
          This section is available with database-ready infrastructure and can be expanded with
          custom workflows.
        </div>
      </div>
    </AdminLayout>
  </AdminGuard>
);

export const AdminCalendar = () => (
  <ComingSoon
    title="Calendar"
    description="Visualize scheduled cleanings on a calendar. Reads from estimates marked as Scheduled."
  />
);

export const AdminPortfolio = () => (
  <ComingSoon
    title="Portfolio"
    description="Manage portfolio items shown on the public Portfolio page, with image uploads and categories."
  />
);

export const AdminServices = () => (
  <ComingSoon
    title="Services"
    description="Edit the services shown on the public site — name, description, starting price, and visibility."
  />
);

export const AdminMedia = () => (
  <ComingSoon
    title="Media Manager"
    description="Upload, replace, and reuse images across the site. Powered by managed file storage."
  />
);

export const AdminMessages = () => (
  <ComingSoon
    title="Messages"
    description="Audit log of every email sent from the admin. The Send Message modal in Estimate Requests already works."
  />
);
