import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createPayPalOrder } from "@/lib/paypal";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { stageId } = body;
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";

    const stage = await prisma.stage.findUnique({
      where: { id: stageId },
      include: {
        version: {
          include: { agreement: true },
        },
      },
    });

    if (!stage) {
      return NextResponse.json({ success: false, error: "Stage not found" }, { status: 404 });
    }

    if (stage.status !== "PAYMENT_PENDING") {
      return NextResponse.json(
        { success: false, error: `Stage is not payable. Current status: ${stage.status}` },
        { status: 400 }
      );
    }

    // 1. Idempotency Check: look for an existing active attempt created in the last 30 minutes
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    let attempt = await prisma.paymentAttempt.findFirst({
      where: {
        stageId: stage.id,
        status: "CREATED",
        createdAt: { gte: thirtyMinutesAgo },
      },
      orderBy: { createdAt: "desc" },
    });

    let isNewAttempt = false;
    if (!attempt) {
      isNewAttempt = true;
      // Persist the attempt record first to lock in the unique attempt ID
      attempt = await prisma.paymentAttempt.create({
        data: {
          stageId: stage.id,
          paypalOrderId: `PENDING_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          amountCents: stage.amountCents,
          currency: "USD",
          status: "CREATED",
          clientIp: ip,
        },
      });
    }

    // 2. Stable, persisted PayPal-Request-Id tied to this specific payment attempt
    const requestId = `order_${attempt.id}`;

    const order = await createPayPalOrder({
      stageId: stage.id,
      stageTitle: stage.title,
      amountCents: stage.amountCents,
      currency: "USD",
      agreementId: stage.version.agreement.id,
      allowSimulatedFallback: true,
      requestId,
    });

    // 3. Atomically attach the authoritative PayPal Order ID to the attempt and stage
    await prisma.paymentAttempt.update({
      where: { id: attempt.id },
      data: {
        paypalOrderId: order.orderId,
      },
    });

    await prisma.stage.update({
      where: { id: stageId },
      data: { paypalOrderId: order.orderId },
    });

    return NextResponse.json({
      success: true,
      order,
      attemptId: attempt.id,
      isReusedAttempt: !isNewAttempt,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
