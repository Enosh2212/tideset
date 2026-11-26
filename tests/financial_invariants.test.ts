import test from "node:test";
import assert from "node:assert/strict";
import { FinancialConstraintEngine, CandidateStage, BuyerConstraints, ProviderConstraints } from "../lib/solver";

test("Financial Invariant 1: Total conservation of money", () => {
  const stages: CandidateStage[] = [
    { sequenceIndex: 1, title: "S1", description: "", amountCents: 20000, dueDayOffset: 0, deliveryDayOffset: 7 },
    { sequenceIndex: 2, title: "S2", description: "", amountCents: 25000, dueDayOffset: 14, deliveryDayOffset: 21 },
    { sequenceIndex: 3, title: "S3", description: "", amountCents: 15000, dueDayOffset: 28, deliveryDayOffset: 30 },
  ];

  const buyer: BuyerConstraints = {
    initialLiquidityCents: 21000,
    expectedInflows: [
      { dayOffset: 14, amountCents: 25000 },
      { dayOffset: 28, amountCents: 20000 },
    ],
  };

  const provider: ProviderConstraints = {
    minDepositCents: 18000,
    maxExposureCents: 25000,
  };

  // Exactly $600.00
  const valid = FinancialConstraintEngine.validateSchedule(60000, stages, buyer, provider);
  assert.equal(valid.isValid, true);
  assert.equal(valid.calculatedSumCents, 60000);

  // Violate total ($600.01)
  const invalid = FinancialConstraintEngine.validateSchedule(60001, stages, buyer, provider);
  assert.equal(invalid.isValid, false);
  assert.match(invalid.errors[0], /Conservation of money violated/);
});

test("Financial Invariant 2: Liquidity reserve non-negativity", () => {
  // Buyer has only $100 today, but Stage 1 is $200
  const stages: CandidateStage[] = [
    { sequenceIndex: 1, title: "S1", description: "", amountCents: 20000, dueDayOffset: 0, deliveryDayOffset: 7 },
  ];

  const brokeBuyer: BuyerConstraints = {
    initialLiquidityCents: 10000, // Only $100
    expectedInflows: [],
  };

  const provider: ProviderConstraints = {
    minDepositCents: 10000,
    maxExposureCents: 25000,
  };

  const res = FinancialConstraintEngine.validateSchedule(20000, stages, brokeBuyer, provider);
  assert.equal(res.isValid, false);
  assert.match(res.errors[0], /Liquidity deficit at Day 0/);
});

test("Financial Invariant 3: Provider exposure ceiling enforcement", () => {
  const stages: CandidateStage[] = [
    { sequenceIndex: 1, title: "S1", description: "", amountCents: 18000, dueDayOffset: 0, deliveryDayOffset: 7 },
    { sequenceIndex: 2, title: "S2", description: "", amountCents: 42000, dueDayOffset: 14, deliveryDayOffset: 21 }, // $420 exceeds $250
  ];

  const buyer: BuyerConstraints = {
    initialLiquidityCents: 30000,
    expectedInflows: [{ dayOffset: 14, amountCents: 50000 }],
  };

  const provider: ProviderConstraints = {
    minDepositCents: 15000,
    maxExposureCents: 25000, // Max $250.00
  };

  const res = FinancialConstraintEngine.validateSchedule(60000, stages, buyer, provider);
  assert.equal(res.isValid, false);
  assert.match(res.errors[0], /exceeds the provider's uncollateralized exposure limit/);
});

test("Financial Invariant 4: Minimum deposit floor enforcement", () => {
  const stages: CandidateStage[] = [
    { sequenceIndex: 1, title: "S1", description: "", amountCents: 10000, dueDayOffset: 0, deliveryDayOffset: 7 }, // $100 < $180
    { sequenceIndex: 2, title: "S2", description: "", amountCents: 50000, dueDayOffset: 14, deliveryDayOffset: 21 },
  ];

  const buyer: BuyerConstraints = {
    initialLiquidityCents: 30000,
    expectedInflows: [{ dayOffset: 14, amountCents: 50000 }],
  };

  const provider: ProviderConstraints = {
    minDepositCents: 18000, // Requires at least $180
    maxExposureCents: 50000,
  };

  const res = FinancialConstraintEngine.validateSchedule(60000, stages, buyer, provider);
  assert.equal(res.isValid, false);
  assert.match(res.errors[0], /below the provider's minimum start requirement/);
});

test("Stress-Test Invariant: Inflow delay shock and survivability repair", () => {
  const stages: CandidateStage[] = [
    { sequenceIndex: 1, title: "S1", description: "", amountCents: 20000, dueDayOffset: 0, deliveryDayOffset: 7 },
    { sequenceIndex: 2, title: "S2", description: "", amountCents: 25000, dueDayOffset: 14, deliveryDayOffset: 21 },
    { sequenceIndex: 3, title: "S3", description: "", amountCents: 15000, dueDayOffset: 28, deliveryDayOffset: 30 },
  ];

  const buyer: BuyerConstraints = {
    initialLiquidityCents: 21000,
    expectedInflows: [
      { dayOffset: 14, amountCents: 25000 },
      { dayOffset: 28, amountCents: 20000 },
    ],
  };

  const provider: ProviderConstraints = {
    minDepositCents: 18000,
    maxExposureCents: 25000,
  };

  // Shock: Paycheck delayed by 7 days (Day 14 -> Day 21)
  const simulation = FinancialConstraintEngine.simulateStressShock(stages, buyer, provider, {
    inflowDelayDays: 7,
  });

  assert.equal(simulation.hasDeficit, true);
  assert.ok(simulation.recommendedRepair);
  assert.equal(simulation.recommendedRepair.adjustedStages[1].dueDayOffset, 21); // Shifted to match delayed paycheck
  assert.equal(
    simulation.recommendedRepair.adjustedStages.reduce((acc, s) => acc + s.amountCents, 0),
    60000
  ); // Total still $600.00
});
