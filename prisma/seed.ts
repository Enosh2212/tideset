import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding TIDESET initial demonstration data...");

  // 1. Create or upsert Demo Users
  const customer = await prisma.user.upsert({
    where: { email: "elena@example.com" },
    update: {},
    create: {
      id: "user_elena_customer",
      email: "elena@example.com",
      name: "Elena Rostova",
      role: "CUSTOMER",
    },
  });

  const provider = await prisma.user.upsert({
    where: { email: "marcus@example.com" },
    update: {},
    create: {
      id: "user_marcus_provider",
      email: "marcus@example.com",
      name: "Marcus Vance",
      role: "PROVIDER",
    },
  });

  // 2. Clear old demo agreements if any
  await prisma.agreement.deleteMany({
    where: { title: "Custom Web Storefront & Brand Identity" },
  });

  // 3. Create the Core Scenario Agreement ($600 Total)
  const agreement = await prisma.agreement.create({
    data: {
      id: "agree_web_storefront_600",
      title: "Custom Web Storefront & Brand Identity",
      description:
        "End-to-end responsive e-commerce web storefront for Elena's artisanal bakery, including ordering flow, brand styling, and product catalog.",
      totalAmountCents: 60000, // $600.00
      currency: "USD",
      status: "ACTIVE", // Active agreement
      providerId: provider.id,
      customerId: customer.id,
      currentVersionNumber: 1,
      versions: {
        create: {
          id: "ver_web_storefront_v1",
          versionNumber: 1,
          totalAmountCents: 60000,
          proposalSummary:
            "3-Stage Survivable Payment & Delivery Schedule synchronized with Elena's cash reserves and Marcus's maximum labor exposure limit ($250).",
          customerApprovalState: "APPROVED",
          providerApprovalState: "APPROVED",
          customerApprovedAt: new Date(),
          providerApprovedAt: new Date(),
          solverRationale:
            "Validated by Deterministic Constraint Solver: Stage sum = $600.00 exact. Stage 1 ($200.00) respects buyer liquidity ($210.00). Stage 2 ($250.00) aligns with Day 14 cash inflow ($250.00). Stage 3 ($150.00) finalizes project on Day 28. Maximum provider exposure capped at $250.00.",
          stages: {
            create: [
              {
                id: "stage_discovery_v1",
                sequenceIndex: 1,
                title: "Stage 1: Architecture, Wireframes & Brand Kit",
                description:
                  "System information architecture, mobile-first responsive wireframes, visual brand kit, and payment gateway specifications.",
                amountCents: 20000, // $200.00
                dueDate: new Date(),
                deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                status: "PAYMENT_PENDING", // Ready for customer to pay with PayPal Sandbox
                acceptanceCriteria: JSON.stringify([
                  "Information architecture site map document (PDF)",
                  "Mobile & Desktop wireframe prototype links",
                  "Brand styling kit: Typography tokens, color palette, and allergen iconography",
                ]),
                deliverableEvidence: null,
                reviewDeadline: null,
                revisionHistory: JSON.stringify([]),
              },
              {
                id: "stage_development_v1",
                sequenceIndex: 2,
                title: "Stage 2: Core Storefront Development & Menu System",
                description:
                  "React component implementation, product catalog management, interactive basket flow, and performance optimization.",
                amountCents: 25000, // $250.00
                dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                deliveryDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
                status: "LOCKED",
                acceptanceCriteria: JSON.stringify([
                  "Interactive product listing grid with filtering by bakery category",
                  "Cart and checkout drawer with client-side quantity management",
                  "Lighthouse performance score >= 90 on mobile",
                ]),
                deliverableEvidence: null,
                reviewDeadline: null,
                revisionHistory: JSON.stringify([]),
              },
              {
                id: "stage_deployment_v1",
                sequenceIndex: 3,
                title: "Stage 3: Production Deployment, QA & Asset Handoff",
                description:
                  "Domain DNS routing, production build deployment, cross-browser verification, and complete source code repository transfer.",
                amountCents: 15000, // $150.00
                dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
                deliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                status: "LOCKED",
                acceptanceCriteria: JSON.stringify([
                  "DNS live on client custom domain with valid SSL certificate",
                  "End-to-end payment and order capture verified in production",
                  "Git repository ownership transfer and deployment credentials handoff",
                ]),
                deliverableEvidence: null,
                reviewDeadline: null,
                revisionHistory: JSON.stringify([]),
              },
            ],
          },
        },
      },
    },
  });

  // 4. Create initial Audit Trail
  await prisma.auditEvent.createMany({
    data: [
      {
        agreementId: agreement.id,
        actorId: provider.id,
        eventType: "AGREEMENT_PROPOSED",
        details: "Marcus created $600.00 service proposal with 3 milestone stages and agreed acceptance criteria.",
      },
      {
        agreementId: agreement.id,
        actorId: customer.id,
        eventType: "CONSTRAINTS_DECLARED",
        details: "Elena declared liquidity profile: $210 available today, $250 expected on Day 14.",
      },
      {
        agreementId: agreement.id,
        actorId: null,
        eventType: "SOLVER_OPTIMIZED",
        details: "Deterministic Solver generated mathematically survivable schedule v1 (100% invariant verified).",
      },
      {
        agreementId: agreement.id,
        actorId: customer.id,
        eventType: "VERSION_SIGNED",
        details: "Elena ratified Agreement Version 1.",
      },
      {
        agreementId: agreement.id,
        actorId: provider.id,
        eventType: "VERSION_SIGNED",
        details: "Marcus ratified Agreement Version 1. Agreement is now ACTIVE.",
      },
    ],
  });

  console.log("Seeding complete successfully! Agreement ID:", agreement.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
