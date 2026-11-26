import { NextRequest, NextResponse } from "next/server";
import { generateSecureToken } from "@/lib/security";

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/google/callback`;

  if (!clientId || clientId.trim().length < 5) {
    return NextResponse.redirect(
      new URL("/login?error=Google+OAuth+is+not+configured+in+this+environment.+Please+sign+in+with+your+email+and+password.", req.url)
    );
  }

  const state = generateSecureToken(16);
  const scope = encodeURIComponent("openid email profile");
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}&access_type=offline&prompt=consent`;

  const response = NextResponse.redirect(authUrl);
  response.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 minutes
  });

  return response;
}
