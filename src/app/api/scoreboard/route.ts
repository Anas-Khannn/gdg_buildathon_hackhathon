import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, sql, desc, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    // 1. Fetch all areas with reported & fixed counts and average days to fix
    const areasStatsQuery = sql`
      SELECT 
        a.id,
        a.name,
        a.name_ur,
        a.name_ps,
        COUNT(r.id)::int as total_reports,
        COUNT(CASE WHEN r.status = 'verified_fixed' THEN 1 END)::int as fixed_reports,
        COUNT(CASE WHEN r.status IN ('open', 'sent') THEN 1 END)::int as open_reports,
        COUNT(CASE WHEN r.severity = 'danger' AND r.status != 'verified_fixed' THEN 1 END)::int as danger_open,
        ROUND(COALESCE(
          AVG(
            CASE 
              WHEN r.verified_at IS NOT NULL 
              THEN EXTRACT(EPOCH FROM (r.verified_at - r.created_at)) / 86400.0
              WHEN r.marked_fixed_at IS NOT NULL
              THEN EXTRACT(EPOCH FROM (r.marked_fixed_at - r.created_at)) / 86400.0
            END
          ), 
          0.0
        )::numeric, 1)::float as avg_days_to_fix
      FROM ${schema.areas} a
      LEFT JOIN ${schema.reports} r ON r.area_id = a.id AND r.hidden = false
      GROUP BY a.id, a.name, a.name_ur, a.name_ps
      ORDER BY avg_days_to_fix DESC;
    `;

    const areasStatsResult = await db.execute(areasStatsQuery);
    const areas = areasStatsResult.rows;

    // 2. Determine worst 3 areas (highest days to fix with active reports)
    const worstThreeAreas = [...areas]
      .filter((a: any) => (a.total_reports || 0) > 0)
      .sort((a: any, b: any) => b.avg_days_to_fix - a.avg_days_to_fix)
      .slice(0, 3);

    // 3. Overall Totals
    const totalReports = areas.reduce((acc: number, curr: any) => acc + (curr.total_reports || 0), 0);
    const totalFixed = areas.reduce((acc: number, curr: any) => acc + (curr.fixed_reports || 0), 0);
    const totalOpen = areas.reduce((acc: number, curr: any) => acc + (curr.open_reports || 0), 0);

    const activeAreas = areas.filter((a: any) => (a.total_reports || 0) > 0 && a.avg_days_to_fix > 0);
    const overallAvgDays = activeAreas.length > 0
      ? (activeAreas.reduce((acc: number, curr: any) => acc + curr.avg_days_to_fix, 0) / activeAreas.length).toFixed(1)
      : "0.0";

    // 4. Monthly chart data aggregated from real database reports
    const monthlyStatsQuery = sql`
      SELECT 
        TO_CHAR(r.created_at, 'Mon') as month,
        DATE_TRUNC('month', r.created_at) as month_date,
        COUNT(r.id)::int as reported,
        COUNT(CASE WHEN r.status = 'verified_fixed' THEN 1 END)::int as fixed
      FROM ${schema.reports} r
      WHERE r.hidden = false
      GROUP BY TO_CHAR(r.created_at, 'Mon'), DATE_TRUNC('month', r.created_at)
      ORDER BY month_date ASC;
    `;

    const monthlyResult = await db.execute(monthlyStatsQuery);
    let monthlyData = (monthlyResult.rows as any[]).map((row) => ({
      month: row.month,
      reported: Number(row.reported) || 0,
      fixed: Number(row.fixed) || 0,
    }));

    if (monthlyData.length === 0) {
      const currentMonth = new Date().toLocaleString("en-US", { month: "short" });
      monthlyData = [{ month: currentMonth, reported: totalReports, fixed: totalFixed }];
    }

    return NextResponse.json({
      areas,
      worstThreeAreas,
      summary: {
        totalReports,
        totalFixed,
        totalOpen,
        overallAvgDays,
      },
      monthlyData,
    });
  } catch (error) {
    console.error("Scoreboard API error:", error);
    return NextResponse.json({ error: "Failed to fetch scoreboard" }, { status: 500 });
  }
}
