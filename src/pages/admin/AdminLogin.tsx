import { FormEvent, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAdminSession } from "@/hooks/useAdminSession";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const AdminLogin = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { session, isAdmin, loading } = useAdminSession();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [submitting, setSubmitting] = useState(false);

	const from = (location.state as { from?: string } | null)?.from || "/admin";

	if (!loading && session && isAdmin) {
		return <Navigate to={from} replace />;
	}

	const onSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setSubmitting(true);
		const { error } = await supabase.auth.signInWithPassword({ email, password });
		setSubmitting(false);

		if (error) {
			toast.error(error.message);
			return;
		}

		toast.success("Logged in");
		navigate(from, { replace: true });
	};

	return (
		<div className="min-h-screen grid place-items-center px-4 bg-gradient-to-b from-secondary/40 to-background">
			<div className="w-full max-w-md bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-strong space-y-6">
				<div className="space-y-1 text-center">
					<p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Admin</p>
					<h1 className="font-display text-3xl font-semibold text-foreground">Sign in</h1>
				</div>

				<form onSubmit={onSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label>Email</Label>
						<Input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							autoComplete="email"
							className="h-11"
						/>
					</div>
					<div className="space-y-2">
						<Label>Password</Label>
						<Input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							autoComplete="current-password"
							className="h-11"
						/>
					</div>
					<Button type="submit" variant="hero" size="lg" className="w-full h-11" disabled={submitting}>
						{submitting ? "Signing in..." : "Sign in"}
					</Button>
				</form>

				<div className="text-center text-sm">
					<Link to="/" className="text-primary hover:underline">
						Back to public site
					</Link>
				</div>
			</div>
		</div>
	);
};

export default AdminLogin;
