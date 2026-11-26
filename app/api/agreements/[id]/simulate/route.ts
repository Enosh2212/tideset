import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { FinancialConstraintEngine, CandidateStage, BuyerConstraints, ProviderConstraints } from "@/lib/solver";
import { generateDelayRecoveryProposal } from "@/lib/ai";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      inflowDelayDays,
      costIncreaseCents,
      inflowReductionCents,
      buyerLiquidityCents,
      buyerInflows,
      providerMinDepositCents,
      providerMaxExposureCents,
    } = body;

    const agreement = await prisma.agreement.findUnique({
      where: { id },
      include: {
        versions: {
          orderBy: { versionNumber: "desc" },
          take: 1,
          include: { stages: { orderBy: { sequenceIndex: "asc" } } },
        },
      },
    });

    if (!agreement || agreement.versions.length === 0) {
      return NextResponse.json({ success: false, error: "Agreement not found" }, { status: 404 });
    }

    const version = agreement.versions[0];
    const candidateStages: CandidateStage[] = version.stages.map((stg, i) => ({
      sequenceIndex: stg.sequenceIndex,
      title: stg.title,
      description: stg.description,
      amountCents: stg.amountCents,
      dueDayOffset: i === 0 ? 0 : i === 1 ? 14 : 28,
      deliveryDayOffset: i === 0 ? 7 : i === 1 ? 21 : 30,
    }));

    const buyer: BuyerConstraints = {
      initialLiquidityCents: buyerLiquidityCents || 21000,
      expectedInflows: buyerInflows || [
        { dayOffset: 14, amountCents: 25000, source: "Paycheck" },
        { dayOffset: 28, amountCents: 20000, source: "Bakery Orders" },
      ],
    };

    const provider: ProviderConstraints = {
      minDepositCents: providerMinDepositCents || 18000,
      maxExposureCents: providerMaxExposureCents || 25000,
    };

    const simulation = FinancialConstraintEngine.simulateStressShock(
      candidateStages,
      buyer,
      provider,
      {
        inflowDelayDays: inflowDelayDays || 0,
        costIncreaseCents: costIncreaseCents || 0,
        inflowReductionCents: inflowReductionCents || 0,
      }
    );

    let aiRecoveryAdvice = null;
    if (simulation.hasDeficit && (inflowDelayDays || 0) > 0) {
      aiRecoveryAdvice = await generateDelayRecoveryProposal({
        delayDays: inflowDelayDays,
        stages: candidateStages,
        buyerLiquidityCents: buyer.initialLiquidityCents,
        providerMinDepositCents: provider.minDepositCents,
        providerMaxExposureCents: provider.maxExposureCents,
      });
    }

    return NextResponse.json({
      success: true,
      simulation,
      aiRecoveryAdvice,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
