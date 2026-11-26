import { z } from "zod";
import {
  CandidateStage,
  BuyerConstraints,
  ProviderConstraints,
  FinancialConstraintEngine,
} from "./solver";

export interface AIProposalRequest {
  naturalLanguagePrompt?: string;
  totalAmountCents: number;
  buyerLiquidityCents: number;
  buyerInflows: { dayOffset: number; amountCents: number; source?: string }[];
  providerMinDepositCents: number;
  providerMaxExposureCents: number;
}

export const CandidateStageSchema = z.object({
  sequenceIndex: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string().min(1),
  amountCents: z.number().int().positive(),
  dueDayOffset: z.number().int().nonnegative(),
  deliveryDayOffset: z.number().int().nonnegative(),
});

export const ProposalOutputSchema = z.object({
  summary: z.string().min(1),
  stages: z.array(CandidateStageSchema).min(1),
  tradeoffs: z.object({
    customerPerspective: z.string().min(1),
    providerPerspective: z.string().min(1),
  }),
  feasibilityExplanation: z.string().min(1),
});

export type ProposalOutput = z.infer<typeof ProposalOutputSchema>;

export type PlanSource = "OPENROUTER_AI" | "DETERMINISTIC_FALLBACK";

export class AITimeoutError extends Error {
  constructor(message = "AI service request timed out", public timeoutMs = 10000) {
    super(message);
    this.name = "AITimeoutError";
  }
}

export class AIRateLimitError extends Error {
  constructor(message = "OpenRouter rate limit exceeded (HTTP 429)") {
    super(message);
    this.name = "AIRateLimitError";
  }
}

export class AIProviderError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = "AIProviderError";
  }
}

export class AISchemaValidationError extends Error {
  constructor(message: string, public issues: any[]) {
    super(message);
    this.name = "AISchemaValidationError";
  }
}

export interface AIProposalResponse {
  summary: string;
  stages: CandidateStage[];
  tradeoffs: {
    customerPerspective: string;
    providerPerspective: string;
  };
  feasibilityExplanation: string;
  survivabilityScore: number;
  isAiGenerated: boolean;
  planSource: PlanSource;
  providerName: "OPENROUTER" | "DETERMINISTIC_CONSTRAINT_ENGINE";
  modelDetails: string;
  openRouterMetadata?: {
    model: string;
    latencyMs?: number;
  };
}

export const RecoveryProposalSchema = z.object({
  explanation: z.string().min(1),
  recommendedAdjustment: z.string().min(1),
  tradeoffSummary: z.string().min(1),
});

export type RecoveryProposal = z.infer<typeof RecoveryProposalSchema>;

export interface AIRecoveryProposalResponse {
  explanation: string;
  recommendedAdjustment: string;
  tradeoffSummary: string;
  isAiGenerated: boolean;
  planSource: PlanSource;
  modelDetails: string;
}

/**
 * Extracts and parses JSON from raw LLM text that may contain markdown fences or surrounding commentary.
 */
export function extractAndParseJSON(rawText: string): any {
  try {
    return JSON.parse(rawText);
  } catch {
    // continue
  }

  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
  const match = rawText.match(codeBlockRegex);
  if (match && match[1]) {
    try {
      return JSON.parse(match[1]);
    } catch {
      // continue
    }
  }

  const firstBrace = rawText.indexOf("{");
  const lastBrace = rawText.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const jsonSubstring = rawText.substring(firstBrace, lastBrace + 1);
    return JSON.parse(jsonSubstring);
  }

  throw new Error("No valid JSON structure found in LLM response text.");
}

/**
 * Checks if a real OpenRouter API key is configured.
 */
export function hasConfiguredOpenRouterKey(): boolean {
  const key = process.env.OPENROUTER_API_KEY?.trim();
  return (
    !!key &&
    key !== "dummy" &&
    key !== "sk-or-dummy" &&
    key !== "openrouter_key_here" &&
    key.length > 20
  );
}

const DEFAULT_AI_TIMEOUT_MS = 10000; // 10s strict deadline

/**
 * Synthesizes a milestone payment agreement proposal.
 * Uses OpenRouter when available, gated by strict deterministic solver verification.
 * Falls back transparently to the deterministic engine when offline or timed out.
 */
export async function generateAgreementProposal(
  params: AIProposalRequest,
  timeoutMs = DEFAULT_AI_TIMEOUT_MS
): Promise<AIProposalResponse> {
  const buyer: BuyerConstraints = {
    initialLiquidityCents: params.buyerLiquidityCents,
    expectedInflows: params.buyerInflows,
  };

  const provider: ProviderConstraints = {
    minDepositCents: params.providerMinDepositCents,
    maxExposureCents: params.providerMaxExposureCents,
  };

  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  const modelName = process.env.OPENROUTER_MODEL?.trim() || "openrouter/free";

  if (hasConfiguredOpenRouterKey()) {
    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const promptText = `You are Bothway AI Agreement Intelligence.
Synthesize a 3-stage milestone payment schedule that guarantees cash-flow survivability for both parties.
Total Contract: $${(params.totalAmountCents / 100).toFixed(2)} USD.
Customer starting liquidity: $${(params.buyerLiquidityCents / 100).toFixed(2)}.
Customer scheduled inflows: ${JSON.stringify(
        params.buyerInflows.map((inf) => ({
          dayOffset: inf.dayOffset,
          amountUSD: (inf.amountCents / 100).toFixed(2),
        }))
      )}.
Provider minimum deposit: $${(params.providerMinDepositCents / 100).toFixed(2)}.
Provider max uncollateralized exposure: $${(params.providerMaxExposureCents / 100).toFixed(2)}.
Context: ${params.naturalLanguagePrompt || "Custom web project"}.

FINANCIAL INVARIANTS YOU MUST PRESERVE:
1. Exact total: The sum of amountCents across all stages MUST equal exactly ${params.totalAmountCents}.
2. Stage 1 amountCents MUST be at least ${params.providerMinDepositCents} (provider deposit floor).
3. Stage 1 amountCents MUST NOT exceed ${params.buyerLiquidityCents} (buyer initial liquidity limit).
4. No single stage amountCents can exceed ${params.providerMaxExposureCents} (exposure ceiling).

Return ONLY valid JSON (no markdown outside the JSON, no commentary) matching this exact schema:
{
  "summary": "1-sentence plain-English agreement summary",
  "stages": [
    {
      "sequenceIndex": 1,
      "title": "Stage 1 Title",
      "description": "Stage 1 scope",
      "amountCents": 20000,
      "dueDayOffset": 0,
      "deliveryDayOffset": 7
    },
    {
      "sequenceIndex": 2,
      "title": "Stage 2 Title",
      "description": "Stage 2 scope",
      "amountCents": 20000,
      "dueDayOffset": 14,
      "deliveryDayOffset": 21
    },
    {
      "sequenceIndex": 3,
      "title": "Stage 3 Title",
      "description": "Stage 3 scope",
      "amountCents": 20000,
      "dueDayOffset": 28,
      "deliveryDayOffset": 35
    }
  ],
  "tradeoffs": {
    "customerPerspective": "How customer cash reserve is protected",
    "providerPerspective": "How provider exposure is strictly capped"
  },
  "feasibilityExplanation": "Deterministic mathematical feasibility rationale"
}`;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://bothway.app",
          "X-Title": "Bothway AI Agreement Intelligence",
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            {
              role: "system",
              content:
                "You are an AI financial agreement optimizer. You output strict JSON meeting mathematical constraints.",
            },
            { role: "user", content: promptText },
          ],
          temperature: 0.2,
        }),
        signal: controller.signal,
      });

      if (response.status === 429) {
        console.warn("[OpenRouter AI] Rate limit (HTTP 429) encountered. Falling back to deterministic solver.");
      } else if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[OpenRouter AI] HTTP ${response.status}: ${errorText.slice(0, 150)}. Falling back to deterministic solver.`);
      } else {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (content) {
          const rawParsed = extractAndParseJSON(content);
          const validationResult = ProposalOutputSchema.safeParse(rawParsed);

          if (validationResult.success) {
            const parsed = validationResult.data;

            // Strict deterministic solver gatekeeper: NEVER trust LLM output for financial values
            const solverValidation = FinancialConstraintEngine.validateSchedule(
              params.totalAmountCents,
              parsed.stages,
              buyer,
              provider
            );

            if (solverValidation.isValid) {
              const latencyMs = Date.now() - startTime;
              return {
                summary: parsed.summary,
                stages: parsed.stages,
                tradeoffs: parsed.tradeoffs,
                feasibilityExplanation: parsed.feasibilityExplanation,
                survivabilityScore: solverValidation.survivabilityScore,
                isAiGenerated: true,
                planSource: "OPENROUTER_AI",
                providerName: "OPENROUTER",
                modelDetails: `OpenRouter (${modelName}) — Verified by Deterministic Constraint Solver`,
                openRouterMetadata: {
                  model: modelName,
                  latencyMs,
                },
              };
            } else {
              console.warn(
                "[OpenRouter AI] Generated plan violated financial invariants. Falling back to deterministic solver.",
                solverValidation.errors
              );
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.warn(`[OpenRouter AI] Request timed out after ${timeoutMs}ms. Falling back to deterministic solver.`);
      } else {
        console.warn("[OpenRouter AI] Network error:", err.message);
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // Deterministic engine fallback (Zero-Hallucination Mode)
  const result = FinancialConstraintEngine.synthesizeOptimalSchedule(
    params.totalAmountCents,
    buyer,
    provider
  );

  const fallbackReason = !apiKey
    ? "No OPENROUTER_API_KEY configured"
    : "Verified deterministic fallback active";

  return {
    summary:
      "Bothway 3-Stage Survivable Payment & Delivery Schedule (Synchronized Cash-Flow Guarantee)",
    stages: result.stages,
    tradeoffs: {
      customerPerspective: `Protects your immediate liquidity by requiring only $${(
        (result.stages[0]?.amountCents || 0) / 100
      ).toFixed(2)} upfront today (leaving a positive reserve of $${(
        (params.buyerLiquidityCents - (result.stages[0]?.amountCents || 0)) /
        100
      ).toFixed(2)}), with remaining stages aligned with your Day 14 and Day 28 income arrivals.`,
      providerPerspective: `Protects provider uncollateralized labor: minimum deposit of $${(
        params.providerMinDepositCents / 100
      ).toFixed(2)} is met before work begins, and no single milestone exceeds the maximum $${(
        params.providerMaxExposureCents / 100
      ).toFixed(2)} exposure ceiling.`,
    },
    feasibilityExplanation: result.rationale,
    survivabilityScore: result.validation.survivabilityScore,
    isAiGenerated: false,
    planSource: "DETERMINISTIC_FALLBACK",
    providerName: "DETERMINISTIC_CONSTRAINT_ENGINE",
    modelDetails: `Bothway Deterministic Linear Solver (${fallbackReason})`,
  };
}

/**
 * Generates an AI plain-language recovery explanation and schedule repair recommendation
 * when an inflow delay shock is simulated.
 */
export async function generateDelayRecoveryProposal(
  params: {
    delayDays: number;
    stages: CandidateStage[];
    buyerLiquidityCents: number;
    providerMinDepositCents: number;
    providerMaxExposureCents: number;
  },
  timeoutMs = 8000
): Promise<AIRecoveryProposalResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  const modelName = process.env.OPENROUTER_MODEL?.trim() || "openrouter/free";

  if (hasConfiguredOpenRouterKey()) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const prompt = `Customer scheduled income is delayed by ${params.delayDays} days.
Current stages: ${JSON.stringify(
        params.stages.map((s) => ({
          sequence: s.sequenceIndex,
          amountUSD: (s.amountCents / 100).toFixed(2),
          dueDay: s.dueDayOffset,
        }))
      )}.
Explain the liquidity risk and recommend a bilateral schedule adjustment so neither party defaults.
Return ONLY valid JSON matching:
{
  "explanation": "Clear explanation of the delay shock",
  "recommendedAdjustment": "Actionable stage shift recommendation",
  "tradeoffSummary": "Bilateral balance explanation"
}`;

      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://bothway.app",
          "X-Title": "Bothway AI Recovery Optimizer",
        },
        body: JSON.stringify({
          model: modelName,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const parsed = extractAndParseJSON(content);
          const validated = RecoveryProposalSchema.safeParse(parsed);
          if (validated.success) {
            return {
              ...validated.data,
              isAiGenerated: true,
              planSource: "OPENROUTER_AI",
              modelDetails: `OpenRouter (${modelName})`,
            };
          }
        }
      }
    } catch {
      // fall back below
    } finally {
      clearTimeout(timeoutId);
    }
  }

  return {
    explanation: `Simulated a +${params.delayDays}-day delay in customer scheduled inflow. This causes negative cash reserves if subsequent milestones are kept on original schedule.`,
    recommendedAdjustment: `Shift Stage 2 due date by +${params.delayDays} days to synchronize with adjusted arrival date. Pause uncollateralized provider labor during the gap.`,
    tradeoffSummary: "Customer avoids liquidity deficit while provider avoids unpaid labor exposure.",
    isAiGenerated: false,
    planSource: "DETERMINISTIC_FALLBACK",
    modelDetails: "Bothway Deterministic Stress Engine",
  };
}
