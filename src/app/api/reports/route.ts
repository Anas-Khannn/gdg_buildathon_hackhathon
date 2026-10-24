import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { and, eq, gte, sql, desc, not } from "drizzle-orm";
import { auth } from "@/auth";

// GET /api/reports - Fetch reports with optional filters and polling since timestamp
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const since = searchParams.get("since");
    const type = searchParams.get("type");
    const severity = searchParams.get("severity");
    const status = searchParams.get("status");
    const areaId = searchParams.get("area_id");

    const conditions = [eq(schema.reports.hidden, false)];

    if (since) {
      const sinceDate = new Date(since);
      if (!isNaN(sinceDate.getTime())) {
        conditions.push(gte(schema.reports.createdAt, sinceDate));
      }
    }

    if (type && type !== "all") {
      conditions.push(eq(schema.reports.type, type as any));
    }

    if (severity && severity !== "all") {
      conditions.push(eq(schema.reports.severity, severity as any));
    }

    if (status && status !== "all") {
      conditions.push(eq(schema.reports.status, status as any));
    }

    if (areaId && areaId !== "all") {
      conditions.push(eq(schema.reports.areaId, parseInt(areaId, 10)));
    }

    // Query reports along with area info and confirmation/fix_check counts
    const reportsList = await db
      .select({
        id: schema.reports.id,
        userId: schema.reports.userId,
        photoFile: schema.reports.photoFile,
        type: schema.reports.type,
        severity: schema.reports.severity,
        complaintText: schema.reports.complaintText,
        lat: schema.reports.lat,
        lng: schema.reports.lng,
        areaId: schema.reports.areaId,
        areaName: schema.areas.name,
        areaNameUr: schema.areas.name_ur,
        areaNamePs: schema.areas.name_ps,
        status: schema.reports.status,
        aiConfidence: schema.reports.aiConfidence,
        createdAt: schema.reports.createdAt,
        sentAt: schema.reports.sentAt,
        markedFixedAt: schema.reports.markedFixedAt,
        verifiedAt: schema.reports.verifiedAt,
        confirmationsCount: sql<number>`(
          SELECT count(*)::int FROM ${schema.confirmations} 
          WHERE ${schema.confirmations.reportId} = ${schema.reports.id}
        )`,
        fixChecksYesCount: sql<number>`(
          SELECT count(*)::int FROM ${schema.fixChecks} 
          WHERE ${schema.fixChecks.reportId} = ${schema.reports.id} AND ${schema.fixChecks.isFixed} = true
        )`,
        fixChecksNoCount: sql<number>`(
          SELECT count(*)::int FROM ${schema.fixChecks} 
          WHERE ${schema.fixChecks.reportId} = ${schema.reports.id} AND ${schema.fixChecks.isFixed} = false
        )`,
      })
      .from(schema.reports)
      .leftJoin(schema.areas, eq(schema.reports.areaId, schema.areas.id))
      .where(and(...conditions))
      .orderBy(desc(schema.reports.createdAt));

    return NextResponse.json({
      reports: reportsList,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

// POST /api/reports - Create new report with duplicate check
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    // Allow anonymous or logged-in report (fallback to demo user if not logged in)
    const userId = session?.user?.id || "demo-citizen-id";

    const body = await req.json();
    const {
      photoFile,
      type,
      severity,
      complaintText,
      lat,
      lng,
      areaId,
      aiConfidence,
      checkDuplicatesOnly,
    } = body;

    if (!photoFile || !type || !severity || lat === undefined || lng === undefined) {
      return NextResponse.json(
        { error: "Missing required report fields" },
        { status: 400 }
      );
    }

    // 1. Haversine duplicate check within 30m of open issues of same type (PRD Section 8)
    const duplicateQuery = sql`
      SELECT id, type, lat, lng,
        (6371000 * acos(least(1.0,
          cos(radians(${lat})) * cos(radians(lat)) * cos(radians(lng) - radians(${lng}))
          + sin(radians(${lat})) * sin(radians(lat))
        )))::numeric(10,1) as dist_m
      FROM ${schema.reports}
      WHERE type = ${type}
        AND hidden = false
        AND status IN ('open', 'sent')
        AND (6371000 * acos(least(1.0,
          cos(radians(${lat})) * cos(radians(lat)) * cos(radians(lng) - radians(${lng}))
          + sin(radians(${lat})) * sin(radians(lat))
        ))) < 30
      ORDER BY dist_m ASC
      LIMIT 1;
    `;

    const duplicateResult = await db.execute(duplicateQuery);

    if (duplicateResult.rows && duplicateResult.rows.length > 0) {
      const duplicate = duplicateResult.rows[0];
      if (checkDuplicatesOnly) {
        return NextResponse.json({
          duplicateFound: true,
          duplicateId: duplicate.id,
          distanceMeters: Number(duplicate.dist_m),
        });
      }
    }

    if (checkDuplicatesOnly) {
      return NextResponse.json({ duplicateFound: false });
    }

    // 2. Insert report into database
    const [newReport] = await db
      .insert(schema.reports)
      .values({
        userId,
        photoFile,
        type,
        severity,
        complaintText,
        lat,
        lng,
        areaId: areaId ? Number(areaId) : null,
        aiConfidence: aiConfidence ? String(aiConfidence) : null,
        status: "open",
        hidden: false,
      })
      .returning();

    // 3. Automatically add 1 initial confirmation from reporter
    await db
      .insert(schema.confirmations)
      .values({
        reportId: newReport.id,
        userId,
      })
      .onConflictDoNothing();

    // 4. Trigger WSSP email notification in background (PRD Section 6 F8)
    // Email failure must never block or lose the report
    try {
      fetch(`${req.nextUrl.origin}/api/wssp-notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId: newReport.id }),
      }).catch((err) => console.log("WSSP async notify ping:", err.message));
    } catch (e) {
      // Ignored non-blocking
    }

    return NextResponse.json({
      success: true,
      report: newReport,
    });
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json(
      { error: "Failed to create report" },
      { status: 500 }
    );
  }
}
