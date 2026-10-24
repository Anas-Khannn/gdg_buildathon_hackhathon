import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { auth } from "@/auth";
import { eq, sql } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    // Use logged in user ID or anonymous demo IP/session identifier
    const userId = session?.user?.id || req.headers.get("x-forwarded-for") || "guest-user";

    // Insert confirmation (One confirmation per user per report, on conflict do nothing)
    await db
      .insert(schema.confirmations)
      .values({
        reportId: id,
        userId,
      })
      .onConflictDoNothing();

    // Fetch updated confirmation count
    const [result] = await db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(schema.confirmations)
      .where(eq(schema.confirmations.reportId, id));

    return NextResponse.json({
      success: true,
      count: result?.count || 1,
    });
  } catch (error) {
    console.error("Error confirming report:", error);
    return NextResponse.json(
      { error: "Failed to add confirmation" },
      { status: 500 }
    );
  }
}
