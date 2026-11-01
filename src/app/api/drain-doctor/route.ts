import { NextRequest, NextResponse } from "next/server";
import {
  calculateDrainAudit,
  DrainParameters,
  PESHAWAR_DRAIN_TEMPLATES,
} from "@/lib/drain-doctor-engine";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      drainName = "Peshawar Municipal Drain",
      location = "Peshawar, Khyber Pakhtunkhwa",
      widthMeters = 2.5,
      depthMeters = 2.0,
      lengthMeters = 300,
      siltFillPercentage = 65,
      wasteType = "dense_sludge",
      contractorQuotedPkr,
      templateId,
    } = body;

    let auditParams: DrainParameters;

    if (templateId) {
      const template = PESHAWAR_DRAIN_TEMPLATES.find((t) => t.id === templateId);
      if (template) {
        auditParams = {
          drainName: template.drainName,
          location: template.location,
          widthMeters: template.widthMeters,
          depthMeters: template.depthMeters,
          lengthMeters: template.lengthMeters,
          siltFillPercentage: template.siltFillPercentage,
          wasteType: template.wasteType,
          contractorQuotedPkr: template.contractorQuotedPkr,
        };
      } else {
        auditParams = {
          drainName,
          location,
          widthMeters: Number(widthMeters),
          depthMeters: Number(depthMeters),
          lengthMeters: Number(lengthMeters),
          siltFillPercentage: Number(siltFillPercentage),
          wasteType,
          contractorQuotedPkr: contractorQuotedPkr ? Number(contractorQuotedPkr) : undefined,
        };
      }
    } else {
      auditParams = {
        drainName,
        location,
        widthMeters: Number(widthMeters),
        depthMeters: Number(depthMeters),
        lengthMeters: Number(lengthMeters),
        siltFillPercentage: Number(siltFillPercentage),
        wasteType,
        contractorQuotedPkr: contractorQuotedPkr ? Number(contractorQuotedPkr) : undefined,
      };
    }

    const audit = calculateDrainAudit(auditParams);

    return NextResponse.json({
      success: true,
      audit,
    });
  } catch (error: any) {
    console.error("Drain Doctor audit error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to calculate drain desilting audit" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    name: "AI Drain Doctor & Anti-Corruption Desiltation Audit",
    jurisdiction: "Peshawar, Khyber Pakhtunkhwa",
    csrStandard: "Khyber Pakhtunkhwa C&W Composite Schedule of Rates (CSR)",
    templates: PESHAWAR_DRAIN_TEMPLATES,
  });
}
