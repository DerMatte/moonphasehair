import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { sanitizeLocalRedirect } from "@/lib/security/redirect";
import { createClient } from "@/lib/supabase/server";

function LoginSkeleton() {
	return (
		<div className="flex min-h-[50vh] items-center justify-center">
			<div className="animate-pulse text-muted-foreground">Loading…</div>
		</div>
	);
}

async function LoginPageContent({
	searchParams,
}: {
	searchParams: Promise<{ redirect?: string }>;
}) {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	const params = await searchParams;
	const redirectTo = sanitizeLocalRedirect(params.redirect);

	if (user) {
		redirect(redirectTo);
	}

	return <LoginForm redirectTo={redirectTo} />;
}

export default function LoginPage({
	searchParams,
}: {
	searchParams: Promise<{ redirect?: string }>;
}) {
	return (
		<Suspense fallback={<LoginSkeleton />}>
			<LoginPageContent searchParams={searchParams} />
		</Suspense>
	);
}
