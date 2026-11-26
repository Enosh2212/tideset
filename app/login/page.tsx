import { Suspense } from "react";
import { AuthSplitLayout } from "@/components/AuthSplitLayout";
export default function LoginPage() {
  const googleEnabled = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );
  return (
    <Suspense fallback={<div className="auth-loading">Opening sign in…</div>}>
      <AuthSplitLayout initialMode="login" googleEnabled={googleEnabled} />
    </Suspense>
  );
}
