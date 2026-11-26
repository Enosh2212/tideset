import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateAgreementProposal } from "@/lib/ai";
import { FinancialConstraintEngine } from "@/lib/solver";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      buyerLiquidityCents,
      buyerInflows,
      providerMinDepositCents,
      providerMaxExposureCents,
      naturalLanguagePrompt,
      createNewVersion,
    } = body;

    const agreement = await prisma.agreement.findUnique({
      where: { id },
    });

    if (!agreement) {
      return NextResponse.json({ success: false, error: "Agreement not found" }, { status: 404 });
    }

    const totalAmountCents = agreement.totalAmountCents;

    // Run AI proposal generator with strict deterministic solver gatekeeping
    const proposal = await generateAgreementProposal({
      totalAmountCents,
      buyerLiquidityCents: buyerLiquidityCents || 21000, // $210.00
      buyerInflows: buyerInflows || [
        { dayOffset: 14, amountCents: 25000, source: "Paycheck" },
        { dayOffset: 28, amountCents: 20000, source: "Bakery Orders" },
      ],
      providerMinDepositCents: providerMinDepositCents || 18000, // $180.00
      providerMaxExposureCents: providerMaxExposureCents || 25000, // $250.00
      naturalLanguagePrompt,
    });

    // If createNewVersion is true, store as new AgreementVersion in DB
    let newVersion = null;
    if (createNewVersion && proposal.stages.length > 0) {
      const nextVerNum = agreement.currentVersionNumber + 1;

      newVersion = await prisma.agreementVersion.create({
        data: {
          agreementId: id,
          versionNumber: nextVerNum,
          totalAmountCents,
          proposalSummary: proposal.summary,
          customerApprovalState: "PENDING",
          providerApprovalState: "PENDING",
          solverRationale: proposal.feasibilityExplanation,
          stages: {
            create: proposal.stages.map((stg) => ({
              sequenceIndex: stg.sequenceIndex,
              title: stg.title,
              description: stg.description,
              amountCents: stg.amountCents,
              dueDate: new Date(Date.now() + stg.dueDayOffset * 86400000),
              deliveryDate: new Date(Date.now() + stg.deliveryDayOffset * 86400000),
              status: "LOCKED",
              paymentStatus: "UNPAID",
              deliveryStatus: "NOT_STARTED",
            })),
          },
        },
        include: { stages: true },
      });

      await prisma.agreement.update({
        where: { id },
        data: {
          currentVersionNumber: nextVerNum,
          status: "PENDING_APPROVAL", // Revoke prior approval
        },
      });

      const engineDescription = proposal.isAiGenerated
        ? `OpenRouter AI (${proposal.modelDetails}) validated by Deterministic Constraint Solver`
        : `Deterministic Constraint Engine (Local Mathematical Fallback)`;

      await prisma.auditEvent.create({
        data: {
          agreementId: id,
          eventType: "VERSION_CREATED",
          details: `Generated Agreement Version ${nextVerNum} via ${engineDescription}. Prior approvals reset.`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      proposal,
      planSource: proposal.planSource,
      isAiGenerated: proposal.isAiGenerated,
      modelDetails: proposal.modelDetails,
      newVersion,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
