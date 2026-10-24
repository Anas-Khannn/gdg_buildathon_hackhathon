import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import fs from "fs";
import path from "path";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:12345@localhost:5433/naali_watch";

const pool = new Pool({ connectionString });
const db = drizzle(pool, { schema });

async function seed() {
  console.log("🌊 Starting Naali Watch database seed for Peshawar...");

  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Generate sample placeholder drain images if not present
  const sampleImages = [
    "kohati_water.jpg",
    "hayatabad_drain.jpg",
    "gulbahar_manhole.jpg",
    "rehman_baba_flood.jpg",
    "hashtnagri_clog.jpg",
    "saddar_pipe.jpg",
    "university_town_puddle.jpg",
  ];

  for (const img of sampleImages) {
    const filePath = path.join(uploadsDir, img);
    if (!fs.existsSync(filePath)) {
      // Create a lightweight SVG placeholder converted to file
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">
        <rect width="640" height="480" fill="#12263A"/>
        <circle cx="320" cy="200" r="80" fill="#0E6B73" opacity="0.8"/>
        <path d="M320 140 C340 180, 360 200, 360 230 C360 252, 342 270, 320 270 C298 270, 280 252, 280 230 C280 200, 300 180, 320 140 Z" fill="#EAF0F2"/>
        <text x="320" y="340" fill="#EAF0F2" font-size="22" font-family="sans-serif" text-anchor="middle" font-weight="bold">Naali Watch Report Photo</text>
        <text x="320" y="375" fill="#C9D4DA" font-size="16" font-family="sans-serif" text-anchor="middle">${img.replace(/_/g, ' ').replace('.jpg', '')}</text>
      </svg>`;
      fs.writeFileSync(filePath, svg);
    }
  }

  // 1. Seed Areas of Peshawar
  console.log("📍 Seeding Peshawar administrative areas...");
  const existingAreas = await db.select().from(schema.areas);
  let areaRecords = existingAreas;

  if (existingAreas.length === 0) {
    areaRecords = await db
      .insert(schema.areas)
      .values([
        { name: "Hayatabad", name_ur: "حیات آباد", name_ps: "حیات اباد" },
        { name: "Gulbahar", name_ur: "گلبہار", name_ps: "ګلبہار" },
        { name: "Hashtnagri", name_ur: "ہشتنگری", name_ps: "ہشتنګری" },
        { name: "Kohati Gate", name_ur: "کوہاٹی گیٹ", name_ps: "کوہاټی ګیټ" },
        { name: "Rehman Baba Square", name_ur: "رحمان بابا چوک", name_ps: "رحمان بابا چوک" },
        { name: "University Town", name_ur: "یونیورسٹی ٹاؤن", name_ps: "یونیورسټی ټاؤن" },
        { name: "Saddar Cantt", name_ur: "صدر کینٹ", name_ps: "صدر کینټ" },
        { name: "Khyber Bazaar", name_ur: "خیبر بازار", name_ps: "خیبر بازار" },
      ])
      .returning();
  }

  const areaMap = new Map(areaRecords.map((a) => [a.name, a.id]));

  // 2. Seed Default Users (Ali the citizen, Fatima the WSSP admin, and community reporters)
  console.log("👤 Seeding system users...");
  const [ali] = await db
    .insert(schema.users)
    .values({
      name: "Ali Khan (Rickshaw Commuter)",
      email: "ali.citizen@peshawar.local",
      role: "user",
      image: "https://api.dicebear.com/7.x/bottts/svg?seed=Ali",
    })
    .onConflictDoUpdate({
      target: schema.users.email,
      set: { role: "user" },
    })
    .returning();

  const [fatima] = await db
    .insert(schema.users)
    .values({
      name: "Fatima Noor (WSSP Moderator)",
      email: "admin@wssp.peshawar.gov.pk",
      role: "admin",
      image: "https://api.dicebear.com/7.x/bottts/svg?seed=Fatima",
    })
    .onConflictDoUpdate({
      target: schema.users.email,
      set: { role: "admin" },
    })
    .returning();

  const [tariq] = await db
    .insert(schema.users)
    .values({
      name: "Tariq Shah",
      email: "tariq.shah@peshawar.local",
      role: "user",
    })
    .onConflictDoUpdate({
      target: schema.users.email,
      set: { role: "user" },
    })
    .returning();

  // 3. Clear existing demo reports to provide clean realistic dataset
  await db.delete(schema.confirmations);
  await db.delete(schema.fixChecks);
  await db.delete(schema.reports);

  console.log("🚨 Seeding 35+ realistic reports across Peshawar...");

  const rawReports = [
    // Kohati Gate
    {
      area: "Kohati Gate",
      lat: 34.0048,
      lng: 71.5721,
      type: "standing_water" as const,
      severity: "danger" as const,
      status: "open" as const,
      photo: "kohati_water.jpg",
      confidence: "0.95",
      complaint: "Severe waterlogging near Kohati Gate main bazaar. Water entering ground-floor shops, traffic halted.",
      daysAgo: 1,
    },
    {
      area: "Kohati Gate",
      lat: 34.0062,
      lng: 71.5739,
      type: "open_manhole" as const,
      severity: "danger" as const,
      status: "open" as const,
      photo: "gulbahar_manhole.jpg",
      confidence: "0.98",
      complaint: "Uncovered manhole in middle of pedestrian path near church gate. Extreme hazard in dark.",
      daysAgo: 2,
    },
    {
      area: "Kohati Gate",
      lat: 34.0035,
      lng: 71.5704,
      type: "blocked_drain" as const,
      severity: "knee" as const,
      status: "sent" as const,
      photo: "hashtnagri_clog.jpg",
      confidence: "0.91",
      complaint: "Main surface drain clogged with construction debris, water spilling onto Circular Road.",
      daysAgo: 3,
    },
    {
      area: "Kohati Gate",
      lat: 34.0055,
      lng: 71.5715,
      type: "garbage_in_drain" as const,
      severity: "ankle" as const,
      status: "verified_fixed" as const,
      photo: "hayatabad_drain.jpg",
      confidence: "0.89",
      complaint: "Plastic bags and silt choking side gutter opposite commercial plaza.",
      daysAgo: 12,
      resolvedDays: 3,
    },

    // Rehman Baba Square
    {
      area: "Rehman Baba Square",
      lat: 33.9875,
      lng: 71.5834,
      type: "standing_water" as const,
      severity: "danger" as const,
      status: "open" as const,
      photo: "rehman_baba_flood.jpg",
      confidence: "0.96",
      complaint: "Ring Road underpass completely inundated after rain. Rickshaws and bikes cannot pass.",
      daysAgo: 1,
    },
    {
      area: "Rehman Baba Square",
      lat: 33.9892,
      lng: 71.5818,
      type: "blocked_drain" as const,
      severity: "knee" as const,
      status: "sent" as const,
      photo: "hashtnagri_clog.jpg",
      confidence: "0.92",
      complaint: "Storm drain outlet blocked with silt, causing backflow toward surrounding residential streets.",
      daysAgo: 4,
    },
    {
      area: "Rehman Baba Square",
      lat: 33.9861,
      lng: 71.5852,
      type: "other" as const,
      severity: "ankle" as const,
      status: "marked_fixed" as const,
      photo: "saddar_pipe.jpg",
      confidence: "0.85",
      complaint: "Broken supply pipe leaking fresh water continuously into roadside trench.",
      daysAgo: 5,
    },
    {
      area: "Rehman Baba Square",
      lat: 33.9881,
      lng: 71.5841,
      type: "garbage_in_drain" as const,
      severity: "knee" as const,
      status: "verified_fixed" as const,
      photo: "hayatabad_drain.jpg",
      confidence: "0.88",
      complaint: "Garbage overflow from municipal bin spilling directly into storm ditch.",
      daysAgo: 15,
      resolvedDays: 4,
    },

    // Gulbahar
    {
      area: "Gulbahar",
      lat: 34.0091,
      lng: 71.5872,
      type: "open_manhole" as const,
      severity: "danger" as const,
      status: "open" as const,
      photo: "gulbahar_manhole.jpg",
      confidence: "0.99",
      complaint: "Missing sewer cover near Ishrat Cinema Chowk. Residents put tree branch as makeshift warning.",
      daysAgo: 2,
    },
    {
      area: "Gulbahar",
      lat: 34.0112,
      lng: 71.5891,
      type: "standing_water" as const,
      severity: "knee" as const,
      status: "sent" as const,
      photo: "kohati_water.jpg",
      confidence: "0.90",
      complaint: "Knee-deep stagnant wastewater pool near Gulbahar No. 2 girls school gate.",
      daysAgo: 5,
    },
    {
      area: "Gulbahar",
      lat: 34.0078,
      lng: 71.5855,
      type: "blocked_drain" as const,
      severity: "knee" as const,
      status: "marked_fixed" as const,
      photo: "hashtnagri_clog.jpg",
      confidence: "0.93",
      complaint: "Drain clogged near meat market, foul smell and dirty runoff.",
      daysAgo: 6,
    },
    {
      area: "Gulbahar",
      lat: 34.0125,
      lng: 71.5912,
      type: "garbage_in_drain" as const,
      severity: "ankle" as const,
      status: "verified_fixed" as const,
      photo: "hayatabad_drain.jpg",
      confidence: "0.87",
      complaint: "Polythene bags trapped in culvert grill.",
      daysAgo: 18,
      resolvedDays: 9,
    },

    // Hashtnagri
    {
      area: "Hashtnagri",
      lat: 34.0142,
      lng: 71.5794,
      type: "blocked_drain" as const,
      severity: "danger" as const,
      status: "open" as const,
      photo: "hashtnagri_clog.jpg",
      confidence: "0.94",
      complaint: "Hashtnagri railway road drainage fully choked. Water flowing over BRT bus station crossing.",
      daysAgo: 2,
    },
    {
      area: "Hashtnagri",
      lat: 34.0158,
      lng: 71.5815,
      type: "open_manhole" as const,
      severity: "danger" as const,
      status: "sent" as const,
      photo: "gulbahar_manhole.jpg",
      confidence: "0.97",
      complaint: "Cracked iron grate collapsed under truck, leaving deep pit exposed.",
      daysAgo: 4,
    },
    {
      area: "Hashtnagri",
      lat: 34.0131,
      lng: 71.5772,
      type: "standing_water" as const,
      severity: "knee" as const,
      status: "marked_fixed" as const,
      photo: "kohati_water.jpg",
      confidence: "0.91",
      complaint: "Stagnant rainwater blocking access to spare parts market.",
      daysAgo: 8,
    },
    {
      area: "Hashtnagri",
      lat: 34.0169,
      lng: 71.5828,
      type: "garbage_in_drain" as const,
      severity: "ankle" as const,
      status: "verified_fixed" as const,
      photo: "hayatabad_drain.jpg",
      confidence: "0.86",
      complaint: "Carton waste blocking drainage grating.",
      daysAgo: 22,
      resolvedDays: 14,
    },

    // Hayatabad (Known for fastest fixes)
    {
      area: "Hayatabad",
      lat: 33.9928,
      lng: 71.4392,
      type: "blocked_drain" as const,
      severity: "ankle" as const,
      status: "open" as const,
      photo: "hayatabad_drain.jpg",
      confidence: "0.93",
      complaint: "Leaves and mud choking storm grill near Phase 3 commercial area park.",
      daysAgo: 1,
    },
    {
      area: "Hayatabad",
      lat: 33.9871,
      lng: 71.4312,
      type: "standing_water" as const,
      severity: "ankle" as const,
      status: "sent" as const,
      photo: "university_town_puddle.jpg",
      confidence: "0.89",
      complaint: "Puddle formation along Phase 5 service lane after sprinkler overflow.",
      daysAgo: 2,
    },
    {
      area: "Hayatabad",
      lat: 33.9964,
      lng: 71.4468,
      type: "open_manhole" as const,
      severity: "danger" as const,
      status: "verified_fixed" as const,
      photo: "gulbahar_manhole.jpg",
      confidence: "0.96",
      complaint: "Cover displaced during road resurfacing near Phase 1 roundabout.",
      daysAgo: 7,
      resolvedDays: 2,
    },
    {
      area: "Hayatabad",
      lat: 33.9905,
      lng: 71.4354,
      type: "garbage_in_drain" as const,
      severity: "ankle" as const,
      status: "verified_fixed" as const,
      photo: "hayatabad_drain.jpg",
      confidence: "0.91",
      complaint: "Garden clipping waste dumped in gutter near Sector F1.",
      daysAgo: 10,
      resolvedDays: 3,
    },

    // University Town
    {
      area: "University Town",
      lat: 33.9984,
      lng: 71.4882,
      type: "standing_water" as const,
      severity: "knee" as const,
      status: "open" as const,
      photo: "university_town_puddle.jpg",
      confidence: "0.92",
      complaint: "Extensive water pooling along Park Avenue, impassable for walkers and cyclists.",
      daysAgo: 2,
    },
    {
      area: "University Town",
      lat: 34.0012,
      lng: 71.4915,
      type: "blocked_drain" as const,
      severity: "ankle" as const,
      status: "sent" as const,
      photo: "hayatabad_drain.jpg",
      confidence: "0.88",
      complaint: "Culvert beneath driveway blocked by tree roots.",
      daysAgo: 3,
    },
    {
      area: "University Town",
      lat: 33.9951,
      lng: 71.4854,
      type: "open_manhole" as const,
      severity: "danger" as const,
      status: "marked_fixed" as const,
      photo: "gulbahar_manhole.jpg",
      confidence: "0.97",
      complaint: "Damaged cement slab over municipal junction pit.",
      daysAgo: 5,
    },
    {
      area: "University Town",
      lat: 34.0035,
      lng: 71.4942,
      type: "garbage_in_drain" as const,
      severity: "ankle" as const,
      status: "verified_fixed" as const,
      photo: "hayatabad_drain.jpg",
      confidence: "0.85",
      complaint: "Food packaging from cafes clogging gutter inlets.",
      daysAgo: 14,
      resolvedDays: 5,
    },

    // Saddar Cantt
    {
      area: "Saddar Cantt",
      lat: 34.0075,
      lng: 71.5432,
      type: "blocked_drain" as const,
      severity: "knee" as const,
      status: "open" as const,
      photo: "saddar_pipe.jpg",
      confidence: "0.94",
      complaint: "Drainage alongside Saddar Road shopping complex overflowing onto pedestrian arcade.",
      daysAgo: 1,
    },
    {
      area: "Saddar Cantt",
      lat: 34.0092,
      lng: 71.5458,
      type: "standing_water" as const,
      severity: "ankle" as const,
      status: "sent" as const,
      photo: "university_town_puddle.jpg",
      confidence: "0.90",
      complaint: "Water pooling at GPO Chowk crossing.",
      daysAgo: 3,
    },
    {
      area: "Saddar Cantt",
      lat: 34.0058,
      lng: 71.5411,
      type: "open_manhole" as const,
      severity: "danger" as const,
      status: "verified_fixed" as const,
      photo: "gulbahar_manhole.jpg",
      confidence: "0.98",
      complaint: "Telephone inspection pit left uncovered outside bank.",
      daysAgo: 9,
      resolvedDays: 4,
    },

    // Khyber Bazaar
    {
      area: "Khyber Bazaar",
      lat: 34.0118,
      lng: 71.5645,
      type: "standing_water" as const,
      severity: "danger" as const,
      status: "open" as const,
      photo: "kohati_water.jpg",
      confidence: "0.96",
      complaint: "Critical flooding right outside LRH (Lady Reading Hospital) entrance. Ambulances delayed.",
      daysAgo: 1,
    },
    {
      area: "Khyber Bazaar",
      lat: 34.0135,
      lng: 71.5672,
      type: "garbage_in_drain" as const,
      severity: "knee" as const,
      status: "sent" as const,
      photo: "hashtnagri_clog.jpg",
      confidence: "0.91",
      complaint: "Cardboard and market waste completely sealing water gutter.",
      daysAgo: 3,
    },
    {
      area: "Khyber Bazaar",
      lat: 34.0102,
      lng: 71.5621,
      type: "open_manhole" as const,
      severity: "danger" as const,
      status: "marked_fixed" as const,
      photo: "gulbahar_manhole.jpg",
      confidence: "0.95",
      complaint: "Broken gutter cover near clinic entrance.",
      daysAgo: 7,
    },
    {
      area: "Khyber Bazaar",
      lat: 34.0148,
      lng: 71.5694,
      type: "blocked_drain" as const,
      severity: "ankle" as const,
      status: "verified_fixed" as const,
      photo: "hayatabad_drain.jpg",
      confidence: "0.89",
      complaint: "Mud accumulation in drainage line.",
      daysAgo: 20,
      resolvedDays: 8,
    },
  ];

  for (const item of rawReports) {
    const areaId = areaMap.get(item.area);
    const createdAt = new Date(Date.now() - item.daysAgo * 24 * 60 * 60 * 1000);
    const sentAt =
      item.status !== "open"
        ? new Date(createdAt.getTime() + 15 * 60 * 1000)
        : null;
    const markedFixedAt =
      item.status === "marked_fixed" || item.status === "verified_fixed"
        ? new Date(createdAt.getTime() + (item.resolvedDays || 3) * 24 * 60 * 60 * 1000)
        : null;
    const verifiedAt =
      item.status === "verified_fixed"
        ? new Date((markedFixedAt?.getTime() || createdAt.getTime()) + 12 * 60 * 60 * 1000)
        : null;

    const [report] = await db
      .insert(schema.reports)
      .values({
        userId: ali.id,
        photoFile: item.photo,
        type: item.type,
        severity: item.severity,
        complaintText: item.complaint,
        lat: item.lat,
        lng: item.lng,
        areaId,
        status: item.status,
        aiConfidence: item.confidence,
        hidden: false,
        createdAt,
        sentAt,
        markedFixedAt,
        verifiedAt,
      })
      .returning();

    // Add confirmations for danger / high-profile reports
    const confirmUsers = [ali.id, fatima.id, tariq.id];
    const numConfirms = item.severity === "danger" ? 3 : item.severity === "knee" ? 2 : 1;
    for (let i = 0; i < numConfirms; i++) {
      await db
        .insert(schema.confirmations)
        .values({
          reportId: report.id,
          userId: confirmUsers[i],
          createdAt: new Date(createdAt.getTime() + (i + 1) * 30 * 60 * 1000),
        })
        .onConflictDoNothing();
    }

    // Add fix check votes for marked_fixed or verified_fixed
    if (item.status === "verified_fixed") {
      // 3 positive votes to verify fix
      for (const u of confirmUsers) {
        await db
          .insert(schema.fixChecks)
          .values({
            reportId: report.id,
            userId: u,
            isFixed: true,
            createdAt: verifiedAt || new Date(),
          })
          .onConflictDoNothing();
      }
    } else if (item.status === "marked_fixed") {
      // 1 vote so far (pending community confirmation)
      await db
        .insert(schema.fixChecks)
        .values({
          reportId: report.id,
          userId: tariq.id,
          isFixed: true,
          createdAt: new Date(),
        })
        .onConflictDoNothing();
    }
  }

  console.log(`✅ Successfully seeded ${rawReports.length} reports across Peshawar!`);
  await pool.end();
}

seed().catch((err) => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});
