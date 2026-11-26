import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createDatabaseSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  const storedState = req.cookies.get("google_oauth_state")?.value;

  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, req.url));
  }

  if (!code || !state || !storedState || state !== storedState) {
    return NextResponse.redirect(
      new URL("/login?error=Invalid+OAuth+state+or+authorization+code.", req.url)
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL("/login?error=Google+OAuth+credentials+missing+on+server.", req.url)
    );
  }

  try {
    // Exchange authorization code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      console.error("Google Token Exchange Failed:", errBody);
      return NextResponse.redirect(new URL("/login?error=Failed+to+exchange+Google+authorization+code.", req.url));
    }

    const tokens = await tokenRes.json();

    // Fetch user profile from Google
    const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!profileRes.ok) {
      return NextResponse.redirect(new URL("/login?error=Failed+to+fetch+Google+profile.", req.url));
    }

    const profile = await profileRes.json();
    const email = profile.email?.toLowerCase();

    if (!email) {
      return NextResponse.redirect(new URL("/login?error=No+email+returned+from+Google+account.", req.url));
    }

    // Upsert user and link OAuthAccount
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: profile.name || email.split("@")[0],
          avatarUrl: profile.picture,
          emailVerified: new Date(),
          role: "CUSTOMER",
        },
      });
    }

    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: "google",
          providerAccountId: profile.id,
        },
      },
      update: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: tokens.expires_in ? Math.floor(Date.now() / 1000) + tokens.expires_in : undefined,
        id_token: tokens.id_token,
      },
      create: {
        userId: user.id,
        provider: "google",
        providerAccountId: profile.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: tokens.expires_in ? Math.floor(Date.now() / 1000) + tokens.expires_in : undefined,
        id_token: tokens.id_token,
        type: "oauth",
      },
    });

    // Create database session
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || undefined;
    const { sessionToken, expires } = await createDatabaseSession(user.id, ip, userAgent);

    const res = NextResponse.redirect(new URL("/dashboard", req.url));
    res.cookies.set("tideset_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires,
    });
    res.cookies.delete("google_oauth_state");

    return res;
  } catch (err: any) {
    console.error("OAuth error:", err);
    return NextResponse.redirect(new URL("/login?error=Unexpected+OAuth+error.", req.url));
  }
}
