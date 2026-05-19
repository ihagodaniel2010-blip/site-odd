import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { AlertCircle, LockKeyhole, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminSession } from "@/hooks/useAdminSession";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LocationState = {
	error?: string;
};

const AdminLogin = () => {
	const location = useLocation();
	const { session, isAdmin, loading, error } = useAdminSession();
	const locationState = location.state as LocationState | null;
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);

	if (!loading && session && isAdmin) {
		return <Navigate to="/admin" replace />;
	}

	const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setSubmitting(true);
		setFormError(null);

		try {
			const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
			if (signInError) {
				setFormError(
					signInError.message.toLowerCase().includes("invalid")
						? "Invalid email or password. Please try again."
						: signInError.message
				);
			}
		} catch (err) {
			setFormError(err instanceof Error ? err.message : "Unable to sign in right now.");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-secondary/40 to-background">
			<div className="container flex min-h-screen items-center justify-center py-16">
				<div className="w-full max-w-md rounded-3xl border border-border bg-surface p-8 shadow-strong">
					<div className="mb-8 space-y-3 text-center">
						<span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl gradient-primary text-white shadow-soft">
							<LockKeyhole className="h-6 w-6" />
						</span>
						<h1 className="font-display text-3xl font-semibold text-foreground">Admin Login</h1>
						<p className="text-sm leading-relaxed text-muted-foreground">
							Secure access for Paiva Cleaners staff. Public pages continue to work even if auth is offline.
						</p>
					</div>

					{(formError || error || locationState?.error) && (
						<div className="mb-6 rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm text-foreground">
							<div className="flex items-start gap-3">
								<AlertCircle className="mt-0.5 h-4 w-4 text-warning" />
								<div>
									<p className="font-semibold">Admin access message</p>
									<p className="mt-1 text-muted-foreground">{formError || error || locationState?.error}</p>
								</div>
							</div>
						</div>
					)}

					<form onSubmit={onSubmit} className="space-y-5">
						<div className="space-y-2">
							<Label htmlFor="admin-email">Email</Label>
							<div className="relative">
								<Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									id="admin-email"
									type="email"
									required
									value={email}
									onChange={(event) => setEmail(event.target.value)}
									className="h-11 rounded-xl pl-10"
									placeholder="admin@paivacleaners.com"
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="admin-password">Password</Label>
							<Input
								id="admin-password"
								type="password"
								required
								value={password}
								onChange={(event) => setPassword(event.target.value)}
								className="h-11 rounded-xl"
								placeholder="Enter your password"
							/>
						</div>

						<Button type="submit" variant="hero" size="lg" className="w-full" disabled={submitting}>
							{submitting ? "Signing in..." : "Sign In to Admin"}
						</Button>
					</form>

					<div className="mt-6 text-center text-sm text-muted-foreground">
						<Link to="/" className="font-medium text-primary hover:underline">
							Back to public site
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AdminLogin;
