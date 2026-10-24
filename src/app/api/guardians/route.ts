import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export interface GuardianItem {
  id: string;
  name: string;
  area: string;
  badge: "guardian" | "watchdog" | "scout";
  badgeTitle: string;
  badgeTitleUr: string;
  badgeTitlePs: string;
  points: number;
  reportsCount: number;
  confirmationsCount: number;
  verifiedCount: number;
}

export async function GET() {
  try {
    // 100% Real Live Database Aggregation: Join reports, confirmations, users, and areas
    const queryResult = await db.execute(sql`
      WITH user_reports AS (
        SELECT 
          r.user_id,
          COUNT(r.id)::int as rep_count,
          COUNT(CASE WHEN r.status = 'verified_fixed' THEN 1 END)::int as ver_count,
          MAX(a.name) as last_area
        FROM reports r
        LEFT JOIN areas a ON a.id = r.area_id
        WHERE r.hidden = false
        GROUP BY r.user_id
      ),
      user_confirms AS (
        SELECT 
          c.user_id,
          COUNT(*)::int as conf_count
        FROM confirmations c
        GROUP BY c.user_id
      )
      SELECT 
        ur.user_id,
        COALESCE(u.name, 'Citizen #' || SUBSTRING(ur.user_id, 1, 4)) as user_name,
        COALESCE(ur.last_area, 'Peshawar') as area_name,
        ur.rep_count,
        ur.ver_count,
        COALESCE(uc.conf_count, 0)::int as conf_count,
        (ur.rep_count * 50 + COALESCE(uc.conf_count, 0) * 20 + ur.ver_count * 100)::int as total_points
      FROM user_reports ur
      LEFT JOIN "user" u ON u.id = ur.user_id
      LEFT JOIN user_confirms uc ON uc.user_id = ur.user_id
      ORDER BY total_points DESC
      LIMIT 10;
    `);

    const rows = (queryResult as any)?.rows || (Array.isArray(queryResult) ? queryResult : []);

    const guardians: GuardianItem[] = rows.map((row: any, idx: number) => {
      const points = Number(row.total_points) || 0;
      const verCount = Number(row.ver_count) || 0;
      const repCount = Number(row.rep_count) || 0;

      let badge: "guardian" | "watchdog" | "scout" = "scout";
      let badgeTitle = "Mohallah Scout";
      let badgeTitleUr = "محلہ اسکاؤٹ";
      let badgeTitlePs = "د کلي څارونکی";

      if (verCount >= 1 || points >= 300) {
        badge = "guardian";
        badgeTitle = "Peshawar Guardian";
        badgeTitleUr = "محافظ پشاور";
        badgeTitlePs = "د پیښور ساتونکی";
      } else if (repCount >= 2 || points >= 100) {
        badge = "watchdog";
        badgeTitle = "Drainage Watchdog";
        badgeTitleUr = "سیلاب واچ ڈاگ";
        badgeTitlePs = "د نالو څارونکی";
      }

      return {
        id: row.user_id || `citizen-${idx + 1}`,
        name: row.user_name || `Citizen #${idx + 1}`,
        area: row.area_name || "Peshawar",
        badge,
        badgeTitle,
        badgeTitleUr,
        badgeTitlePs,
        points,
        reportsCount: repCount,
        confirmationsCount: Number(row.conf_count) || 0,
        verifiedCount: verCount,
      };
    });

    const totalPoints = guardians.reduce((acc, g) => acc + g.points, 0);

    return NextResponse.json({
      guardians,
      totalCivicPointsAwarded: totalPoints,
      activeGuardiansCount: guardians.length,
    });
  } catch (err: any) {
    console.error("Real Guardians API error:", err);
    return NextResponse.json({
      guardians: [],
      totalCivicPointsAwarded: 0,
      activeGuardiansCount: 0,
    });
  }
}
