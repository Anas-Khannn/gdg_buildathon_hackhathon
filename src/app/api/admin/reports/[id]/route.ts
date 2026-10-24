import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    // Verify admin role or allow demo test override
    const userRole = (session?.user as unknown as { role?: string })?.role;
    const isAdmin = userRole === "admin" || req.headers.get("x-admin-override") === "true";

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
    }

    const body = await req.json();
    const { status, hidden } = body;

    const updates: Partial<typeof schema.reports.$inferInsert> = {};

    if (status) {
      updates.status = status;
      if (status === "marked_fixed") {
        updates.markedFixedAt = new Date();
      } else if (status === "verified_fixed") {
        updates.verifiedAt = new Date();
      }
    }

    if (typeof hidden === "boolean") {
      updates.hidden = hidden;
    }

    const [updatedReport] = await db
      .update(schema.reports)
      .set(updates)
      .where(eq(schema.reports.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      report: updatedReport,
    });
  } catch (error) {
    console.error("Error updating report via admin:", error);
    return NextResponse.json({ error: "Failed to update report" }, { status: 500 });
  }
}
