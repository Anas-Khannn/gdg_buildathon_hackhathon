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
  console.log("🌊 Initializing Naali Watch real-world database for Peshawar...");

  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // 1. Ensure administrative areas of Peshawar
  console.log("📍 Ensuring Peshawar administrative areas...");
  const existingAreas = await db.select().from(schema.areas);

  if (existingAreas.length === 0) {
    await db
      .insert(schema.areas)
      .values([
        { name: "Hayatabad", name_ur: "حیات آباد", name_ps: "حیات اباد" },
        { name: "Gulbahar", name_ur: "گلبہار", name_ps: "ګلبہار" },
        { name: "Hashtnagri", name_ur: "ہشتنگری", name_ps: "ہشتنګری" },
        { name: "Kohati Gate", name_ur: "کوہاٹی گیٹ", name_ps: "کوہاټی ګیټ" },
        { name: "Rehman Baba Square", name_ur: "رحمان بابا چوک", name_ps: "رحمان بابا چوک" },
        { name: "University Town", name_ur: "یونیورسٹی ٹاؤن", name_ps: "یونیورسټی ټاؤن" },
        { name: "Saddar Cantt", name_ur: "صدر کینٹ", name_ps: "صدر کینټ" },
        { name: "Khyber Bazaar", name_ur: "خیber بازار", name_ps: "خیبر بازار" },
      ])
      .returning();
    console.log("✅ 8 Peshawar administrative areas initialized.");
  } else {
    console.log(`ℹ️ ${existingAreas.length} Peshawar areas already exist.`);
  }

  // 2. Ensure official WSSP Admin Account exists
  console.log("👤 Ensuring official WSSP Admin moderator account...");
  await db
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
    });

  console.log("✅ Real-world setup ready. No mock data injected.");
  await pool.end();
}

seed().catch((err) => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});
