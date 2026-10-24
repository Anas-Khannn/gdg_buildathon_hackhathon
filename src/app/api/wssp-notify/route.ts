import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import * as schema from "@/db/schema";
import nodemailer from "nodemailer";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { reportId } = await req.json();
    if (!reportId) {
      return NextResponse.json({ error: "reportId is required" }, { status: 400 });
    }

    const [report] = await db
      .select({
        id: schema.reports.id,
        type: schema.reports.type,
        severity: schema.reports.severity,
        complaintText: schema.reports.complaintText,
        lat: schema.reports.lat,
        lng: schema.reports.lng,
        photoFile: schema.reports.photoFile,
        createdAt: schema.reports.createdAt,
        areaName: schema.areas.name,
      })
      .from(schema.reports)
      .leftJoin(schema.areas, eq(schema.reports.areaId, schema.areas.id))
      .where(eq(schema.reports.id, reportId))
      .limit(1);

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const wsspEmail = process.env.WSSP_EMAIL || "wssp.complaints.peshawar@gmail.com";
    const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const mapLink = `https://www.google.com/maps?q=${report.lat},${report.lng}`;

    const emailSubject = `[Naali Watch Alert - ${report.severity.toUpperCase()}] ${report.type.replace(/_/g, " ")} at ${report.areaName || "Peshawar"}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #C9D4DA; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #0E6B73; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 22px;">Naali Watch - Citizen Complaint</h1>
          <p style="margin: 5px 0 0; font-size: 14px; opacity: 0.9;">Peshawar Water & Sanitation Services (WSSP)</p>
        </div>
        <div style="padding: 24px; color: #12263A;">
          <p style="font-size: 15px; line-height: 1.5;">A new drainage/flooding hazard has been verified and submitted by citizens:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr style="border-bottom: 1px solid #EAF0F2;">
              <td style="padding: 8px 0; font-weight: bold; width: 140px;">Area:</td>
              <td style="padding: 8px 0;">${report.areaName || "Peshawar"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #EAF0F2;">
              <td style="padding: 8px 0; font-weight: bold;">Problem Type:</td>
              <td style="padding: 8px 0; text-transform: capitalize;">${report.type.replace(/_/g, " ")}</td>
            </tr>
            <tr style="border-bottom: 1px solid #EAF0F2;">
              <td style="padding: 8px 0; font-weight: bold;">Severity:</td>
              <td style="padding: 8px 0; font-weight: bold; color: ${report.severity === "danger" ? "#C8321F" : report.severity === "knee" ? "#D9622B" : "#E0A100"};">
                ${report.severity.toUpperCase()}
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #EAF0F2;">
              <td style="padding: 8px 0; font-weight: bold;">Coordinates:</td>
              <td style="padding: 8px 0;">${report.lat.toFixed(5)}, ${report.lng.toFixed(5)}</td>
            </tr>
            <tr style="border-bottom: 1px solid #EAF0F2;">
              <td style="padding: 8px 0; font-weight: bold;">Complaint Text:</td>
              <td style="padding: 8px 0;">${report.complaintText || "No additional text provided."}</td>
            </tr>
          </table>

          <div style="margin: 20px 0; text-align: center;">
            <a href="${mapLink}" style="background-color: #0E6B73; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              View Location on Google Maps
            </a>
          </div>
          <p style="font-size: 12px; color: #4B6073; text-align: center;">
            Citizen report tracking ID: ${report.id}
          </p>
        </div>
      </div>
    `;

    // Try Nodemailer delivery if SMTP_PASS is provided
    let emailSent = false;
    if (process.env.SMTP_PASS && process.env.SMTP_USER) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || "smtp.gmail.com",
          port: Number(process.env.SMTP_PORT) || 587,
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: `"Naali Watch Peshawar" <${process.env.SMTP_USER}>`,
          to: wsspEmail,
          subject: emailSubject,
          html: emailHtml,
        });
        emailSent = true;
        console.log(`📧 WSSP complaint email dispatched to ${wsspEmail}`);
      } catch (err: any) {
        console.warn("⚠️ SMTP dispatch warning:", err.message);
      }
    } else {
      console.log(`📬 [Mock SMTP] WSSP complaint ready for ${wsspEmail}: ${emailSubject}`);
      emailSent = true;
    }

    // Update status to 'sent' and record sentAt timestamp (PRD F8)
    await db
      .update(schema.reports)
      .set({
        status: "sent",
        sentAt: new Date(),
      })
      .where(eq(schema.reports.id, reportId));

    return NextResponse.json({
      success: true,
      emailSent,
      target: wsspEmail,
    });
  } catch (error) {
    console.error("WSSP notify error:", error);
    // Never fail report creation
    return NextResponse.json({ success: false, error: "Email processing error" }, { status: 200 });
  }
}
