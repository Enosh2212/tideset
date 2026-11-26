import { test } from "node:test";
import assert from "node:assert";
import {
  extractAndParseJSON,
  ProposalOutputSchema,
  generateAgreementProposal,
  generateDelayRecoveryProposal,
} from "../lib/ai";
import {
  hasConfiguredPayPalCredentials,
  getPayPalIntegrationStatus,
  createPayPalOrder,
  capturePayPalOrder,
  verifyWebhookSignature,
} from "../lib/paypal";
import { FinancialConstraintEngine } from "../lib/solver";

test("OpenRouter: JSON extraction and markdown fence recovery", () => {
  // Test case 1: Raw JSON
  const rawJson = '{"summary":"Test","stages":[],"tradeoffs":{"customerPerspective":"a","providerPerspective":"b"},"feasibilityExplanation":"c"}';
  const parsed1 = extractAndParseJSON(rawJson);
  assert.strictEqual(parsed1.summary, "Test");

  // Test case 2: Markdown fenced json ```json ... ```
  const fenced = `Here is your schedule:
\`\`\`json
{
  "summary": "AI Generated Plan",
  "stages": [
    {
      "sequenceIndex": 1,
      "title": "Stage 1",
      "description": "Design",
      "amountCents": 20000,
      "dueDayOffset": 0,
      "deliveryDayOffset": 7
    }
  ],
  "tradeoffs": {
    "customerPerspective": "Safe liquidity",
    "providerPerspective": "Low risk"
  },
  "feasibilityExplanation": "Feasible"
}
\`\`\`
Let me know what you think!`;

  const parsed2 = extractAndParseJSON(fenced);
  assert.strictEqual(parsed2.summary, "AI Generated Plan");
  assert.strictEqual(parsed2.stages.length, 1);

  // Test case 3: Malformed text without JSON throws gracefully
  assert.throws(() => {
    extractAndParseJSON("Sorry, I cannot help with financial agreements.");
  }, /No valid JSON structure found/);
});

test("OpenRouter: Strict Zod schema validation", () => {
  // Valid payload
  const valid = {
    summary: "Balanced 3-stage plan",
    stages: [
      {
        sequenceIndex: 1,
        title: "Deposit",
        description: "Initial discovery",
        amountCents: 20000,
        dueDayOffset: 0,
        deliveryDayOffset: 7,
      },
    ],
    tradeoffs: {
      customerPerspective: "Protected",
      providerPerspective: "Protected",
    },
    feasibilityExplanation: "Optimal",
  };
  const result = ProposalOutputSchema.safeParse(valid);
  assert.strictEqual(result.success, true);

  // Invalid payload (missing tradeoffs)
  const invalid = {
    summary: "Missing tradeoffs",
    stages: [],
  };
  const invalidResult = ProposalOutputSchema.safeParse(invalid);
  assert.strictEqual(invalidResult.success, false);
});

test("OpenRouter: Deterministic fallback when credentials missing or unconfigured", async () => {
  // Ensure OPENROUTER_API_KEY is not set or empty for this test
  const originalKey = process.env.OPENROUTER_API_KEY;
  delete process.env.OPENROUTER_API_KEY;

  try {
    const proposal = await generateAgreementProposal({
      totalAmountCents: 60000,
      buyerLiquidityCents: 21000,
      buyerInflows: [
        { dayOffset: 14, amountCents: 25000, source: "Paycheck" },
        { dayOffset: 28, amountCents: 20000, source: "Bakery Orders" },
      ],
      providerMinDepositCents: 18000,
      providerMaxExposureCents: 25000,
      naturalLanguagePrompt: "Test project",
    });

    assert.strictEqual(proposal.isAiGenerated, false);
    assert.strictEqual(proposal.providerName, "DETERMINISTIC_CONSTRAINT_ENGINE");
    assert.match(proposal.modelDetails, /Deterministic Linear Solver/);
    assert.strictEqual(proposal.stages.length, 3);

    // Sum invariant
    const sum = proposal.stages.reduce((acc, s) => acc + s.amountCents, 0);
    assert.strictEqual(sum, 60000);
  } finally {
    process.env.OPENROUTER_API_KEY = originalKey;
  }
});

test("OpenRouter: Delay recovery proposal generator fallback", async () => {
  const recovery = await generateDelayRecoveryProposal({
    delayDays: 7,
    stages: [
      {
        sequenceIndex: 1,
        title: "Stage 1",
        description: "Desc",
        amountCents: 20000,
        dueDayOffset: 0,
        deliveryDayOffset: 7,
      },
      {
        sequenceIndex: 2,
        title: "Stage 2",
        description: "Desc",
        amountCents: 20000,
        dueDayOffset: 14,
        deliveryDayOffset: 21,
      },
      {
        sequenceIndex: 3,
        title: "Stage 3",
        description: "Desc",
        amountCents: 20000,
        dueDayOffset: 28,
        deliveryDayOffset: 35,
      },
    ],
    buyerLiquidityCents: 21000,
    providerMinDepositCents: 18000,
    providerMaxExposureCents: 25000,
  });

  assert.ok(recovery.explanation.length > 0);
  assert.ok(recovery.recommendedAdjustment.includes("+7"));
  assert.ok(recovery.tradeoffSummary.length > 0);
});

test("PayPal Sandbox: Real vs. Simulated credentials detection", () => {
  const origClientId = process.env.PAYPAL_CLIENT_ID;
  const origSecret = process.env.PAYPAL_CLIENT_SECRET;
  try {
    process.env.PAYPAL_CLIENT_ID = "sb";
    process.env.PAYPAL_CLIENT_SECRET = "sandbox_secret";
    const status = getPayPalIntegrationStatus();
    assert.strictEqual(status.isConfigured, false);
    assert.strictEqual(status.status, "EXTERNAL INTEGRATION NOT CONFIGURED");
    assert.strictEqual(hasConfiguredPayPalCredentials(), false);
  } finally {
    process.env.PAYPAL_CLIENT_ID = origClientId;
    process.env.PAYPAL_CLIENT_SECRET = origSecret;
  }
});

test("PayPal Sandbox: Simulated checkout order creation and capture status", async () => {
  const origClientId = process.env.PAYPAL_CLIENT_ID;
  const origSecret = process.env.PAYPAL_CLIENT_SECRET;
  try {
    process.env.PAYPAL_CLIENT_ID = "sb";
    process.env.PAYPAL_CLIENT_SECRET = "sandbox_secret";
    const order = await createPayPalOrder({
      stageId: "stg_test_123",
      stageTitle: "Test Milestone",
      amountCents: 20000,
      currency: "USD",
      agreementId: "agr_test_123",
      allowSimulatedFallback: true,
    });

    assert.strictEqual(order.isSimulated, true);
    assert.ok(order.orderId.startsWith("SIM-ORDER-"));
    assert.strictEqual(order.systemStatus, "SIMULATED LOCAL TEST");

    const capture = await capturePayPalOrder(order.orderId, 20000, true);
    assert.strictEqual(capture.settlementType, "SIMULATED_LOCAL_TEST");
    assert.strictEqual(capture.systemStatus, "SIMULATED LOCAL TEST");
    assert.strictEqual(capture.amountCapturedCents, 20000);
    assert.ok(capture.captureId.startsWith("SIM-CAP-"));
  } finally {
    process.env.PAYPAL_CLIENT_ID = origClientId;
    process.env.PAYPAL_CLIENT_SECRET = origSecret;
  }
});

test("PayPal Sandbox: Strict mode disallows simulated capture fallback", async () => {
  await assert.rejects(async () => {
    await capturePayPalOrder("SIM-ORDER-FAKE123", 20000, false);
  }, /Simulated order captures are disabled in strict mode/);
});

test("PayPal Sandbox: Webhook signature verification distinguishes simulated test headers", async () => {
  // Test transmission ID starts with TEST- in simulated environment
  const testValid = await verifyWebhookSignature({
    transmissionId: "TEST-TRANS-9999",
    transmissionTime: new Date().toISOString(),
    certUrl: "https://api.sandbox.paypal.com/cert",
    authAlgo: "SHA256withRSA",
    transmissionSig: "test_sig",
    webhookId: "test_wh",
    webhookEvent: { event_type: "PAYMENT.CAPTURE.COMPLETED" },
  });
  assert.strictEqual(testValid, true);

  // Invalid transmission ID in unconfigured environment is rejected
  const testInvalid = await verifyWebhookSignature({
    transmissionId: "FORGED-LIVE-TRANS-1234",
    transmissionTime: new Date().toISOString(),
    certUrl: "https://api.sandbox.paypal.com/cert",
    authAlgo: "SHA256withRSA",
    transmissionSig: "test_sig",
    webhookId: "test_wh",
    webhookEvent: { event_type: "PAYMENT.CAPTURE.COMPLETED" },
  });
  assert.strictEqual(testInvalid, false);
});
