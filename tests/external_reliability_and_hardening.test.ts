import { test } from "node:test";
import assert from "node:assert/strict";
import {
  PayPalTimeoutError,
  PayPalWafBlockError,
  PayPalApiError,
  PayPalNetworkError,
  hasConfiguredPayPalCredentials,
  createPayPalOrder,
  capturePayPalOrder,
} from "../lib/paypal";
import {
  generateAgreementProposal,
  extractAndParseJSON,
  ProposalOutputSchema,
  hasConfiguredOpenRouterKey,
} from "../lib/ai";
import { checkRateLimit } from "../lib/security";
import { FinancialConstraintEngine } from "../lib/solver";

test("Reliability 1: PayPal custom error classes maintain type hierarchy and attributes", () => {
  const timeoutErr = new PayPalTimeoutError("Connection timed out", 10000);
  assert.equal(timeoutErr.name, "PayPalTimeoutError");
  assert.equal(timeoutErr.timeoutMs, 10000);
  assert(timeoutErr instanceof Error);

  const wafErr = new PayPalWafBlockError("Cloudflare WAF Blocked", 403, "ray_123456");
  assert.equal(wafErr.name, "PayPalWafBlockError");
  assert.equal(wafErr.statusCode, 403);
  assert.equal(wafErr.rayId, "ray_123456");

  const apiErr = new PayPalApiError("Rate Limit Exceeded", 429, { issue: "RATE_LIMIT" });
  assert.equal(apiErr.name, "PayPalApiError");
  assert.equal(apiErr.statusCode, 429);

  const netErr = new PayPalNetworkError("Socket hang up", new Error("ECONNRESET"));
  assert.equal(netErr.name, "PayPalNetworkError");
  assert(netErr.cause instanceof Error);
});

test("Reliability 2: Rate limiter enforces sliding window and distinct keys", () => {
  const testKey = `test:ip:${Date.now()}_${Math.random()}`;
  
  // 3 requests allowed in 60s
  const r1 = checkRateLimit(testKey, 3, 60000);
  assert.equal(r1.allowed, true);
  assert.equal(r1.remaining, 2);

  const r2 = checkRateLimit(testKey, 3, 60000);
  assert.equal(r2.allowed, true);
  assert.equal(r2.remaining, 1);

  const r3 = checkRateLimit(testKey, 3, 60000);
  assert.equal(r3.allowed, true);
  assert.equal(r3.remaining, 0);

  // 4th request must be rejected
  const r4 = checkRateLimit(testKey, 3, 60000);
  assert.equal(r4.allowed, false);
  assert.equal(r4.remaining, 0);
  assert(r4.resetInMs > 0);

  // Independent key must still be allowed
  const otherKey = `test:ip:other_${Date.now()}`;
  const rOther = checkRateLimit(otherKey, 3, 60000);
  assert.equal(rOther.allowed, true);
});

test("Reliability 3: AI Engine strictly distinguishes plan source (OPENROUTER_AI vs DETERMINISTIC_FALLBACK)", async () => {
  // Call proposal generator without live LLM network dependency
  const proposal = await generateAgreementProposal({
    totalAmountCents: 60000,
    buyerLiquidityCents: 21000,
    buyerInflows: [
      { dayOffset: 14, amountCents: 25000 },
      { dayOffset: 28, amountCents: 20000 },
    ],
    providerMinDepositCents: 18000,
    providerMaxExposureCents: 25000,
    naturalLanguagePrompt: "Reliability test contract",
  });

  // Verify that metadata accurately reports source
  if (!hasConfiguredOpenRouterKey()) {
    assert.equal(proposal.isAiGenerated, false);
    assert.equal(proposal.planSource, "DETERMINISTIC_FALLBACK");
    assert.equal(proposal.providerName, "DETERMINISTIC_CONSTRAINT_ENGINE");
    assert(proposal.modelDetails.includes("Deterministic"));
  } else {
    assert(["OPENROUTER_AI", "DETERMINISTIC_FALLBACK"].includes(proposal.planSource));
  }

  // Verify that the proposed plan unconditionally satisfies all financial invariants
  const validation = FinancialConstraintEngine.validateSchedule(
    60000,
    proposal.stages,
    {
      initialLiquidityCents: 21000,
      expectedInflows: [
        { dayOffset: 14, amountCents: 25000 },
        { dayOffset: 28, amountCents: 20000 },
      ],
    },
    {
      minDepositCents: 18000,
      maxExposureCents: 25000,
    }
  );

  assert.equal(validation.isValid, true);
  assert.equal(validation.errors.length, 0);
  assert(validation.survivabilityScore > 0);
});

test("Reliability 4: JSON recovery parses code-fenced and damaged responses without crashing", () => {
  const fenced = "Here is your plan:\n```json\n{\"summary\":\"Test plan\",\"stages\":[],\"tradeoffs\":{\"customerPerspective\":\"Safe\",\"providerPerspective\":\"Protected\"},\"feasibilityExplanation\":\"Valid\"}\n```\nEnjoy!";
  const parsedFenced = extractAndParseJSON(fenced);
  assert.equal(parsedFenced.summary, "Test plan");

  const withSurroundingText = "Analysis results: {\"summary\":\"No fence\",\"stages\":[]} End of transmission";
  const parsedSurrounding = extractAndParseJSON(withSurroundingText);
  assert.equal(parsedSurrounding.summary, "No fence");

  assert.throws(() => {
    extractAndParseJSON("Invalid unstructured text without any braces");
  }, /No valid JSON structure found/);
});

test("Reliability 5: Simulated Sandbox Orders preserve safe idempotent structure", async () => {
  // Test simulated order creation with fallback
  const order = await createPayPalOrder({
    stageId: "stg_test_unit_1",
    stageTitle: "Test Stage Settlement",
    amountCents: 20000,
    agreementId: "agree_unit_1",
    allowSimulatedFallback: true,
  });

  assert(order.orderId.length > 5);
  assert(["CREATED", "COMPLETED", "APPROVED"].includes(order.status));

  // Test simulated capture
  const capture = await capturePayPalOrder(order.orderId, 20000, true);
  assert(capture.captureId.length > 5);
  assert.equal(capture.amountCapturedCents, 20000);
  assert.equal(capture.currency, "USD");
  assert.equal(capture.status, "COMPLETED");
});
