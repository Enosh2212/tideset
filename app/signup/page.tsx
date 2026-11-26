import { Suspense } from "react";
import { AuthSplitLayout } from "@/components/AuthSplitLayout";
export default function SignupPage() {
  const googleEnabled = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );
  return (
    <Suspense
      fallback={<div className="auth-loading">Opening registration…</div>}
    >
      <AuthSplitLayout initialMode="signup" googleEnabled={googleEnabled} />
    </Suspense>
  );
}
