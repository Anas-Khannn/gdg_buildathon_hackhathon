import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { HomePageClient } from "@/components/home-page-client";
import type { ReportItem } from "@/types/report";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/about");
  }
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
      fixPhotoFile: schema.reports.fixPhotoFile,
      aiFixConfidence: schema.reports.aiFixConfidence,
      aiFixAnalysis: schema.reports.aiFixAnalysis,
      createdAt: sql<string>`${schema.reports.createdAt}::text`,
      sentAt: sql<string | null>`${schema.reports.sentAt}::text`,
      markedFixedAt: sql<string | null>`${schema.reports.markedFixedAt}::text`,
      verifiedAt: sql<string | null>`${schema.reports.verifiedAt}::text`,
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
    .where(eq(schema.reports.hidden, false))
    .orderBy(desc(schema.reports.createdAt));

  return <HomePageClient initialReports={reportsList as unknown as ReportItem[]} />;
}
