import { NextResponse } from "next/server";
import { getPayPalIntegrationStatus } from "@/lib/paypal";

export async function GET() {
  const status = getPayPalIntegrationStatus();
  return NextResponse.json({
    success: true,
    status,
  });
}
