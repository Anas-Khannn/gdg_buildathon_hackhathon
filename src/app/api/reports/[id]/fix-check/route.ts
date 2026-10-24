import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { auth } from "@/auth";
import { eq, and, sql } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const userId = session?.user?.id || req.headers.get("x-forwarded-for") || "citizen-" + Math.random().toString(36).substring(7);

    const body = await req.json();
    const { isFixed } = body;

    if (typeof isFixed !== "boolean") {
      return NextResponse.json(
        { error: "isFixed boolean is required" },
        { status: 400 }
      );
    }

    // 1. Record or update user's fix check vote
    await db
      .insert(schema.fixChecks)
      .values({
        reportId: id,
        userId,
        isFixed,
      })
      .onConflictDoUpdate({
        target: [schema.fixChecks.reportId, schema.fixChecks.userId],
        set: { isFixed, createdAt: new Date() },
      });

    // 2. Count current votes for this report
    const votes = await db
      .select({
        isFixed: schema.fixChecks.isFixed,
        count: sql<number>`count(*)::int`,
      })
      .from(schema.fixChecks)
      .where(eq(schema.fixChecks.reportId, id))
      .groupBy(schema.fixChecks.isFixed);

    let yesVotes = 0;
    let noVotes = 0;
    votes.forEach((v) => {
      if (v.isFixed) yesVotes = v.count;
      else noVotes = v.count;
    });

    const totalVotes = yesVotes + noVotes;
    let updatedStatus: "open" | "marked_fixed" | "verified_fixed" = "marked_fixed";

    // PRD Section 6 (F9): With at least 3 votes:
    // majority Yes gives Verified fixed, majority No returns it to Open
    if (totalVotes >= 3) {
      if (yesVotes > noVotes) {
        updatedStatus = "verified_fixed";
        await db
          .update(schema.reports)
          .set({
            status: "verified_fixed",
            verifiedAt: new Date(),
          })
          .where(eq(schema.reports.id, id));
      } else if (noVotes > yesVotes) {
        updatedStatus = "open";
        await db
          .update(schema.reports)
          .set({
            status: "open",
            markedFixedAt: null,
            verifiedAt: null,
          })
          .where(eq(schema.reports.id, id));
      }
    }

    return NextResponse.json({
      success: true,
      yesVotes,
      noVotes,
      totalVotes,
      status: updatedStatus,
    });
  } catch (error) {
    console.error("Error submitting fix check:", error);
    return NextResponse.json(
      { error: "Failed to record fix check" },
      { status: 500 }
    );
  }
}
