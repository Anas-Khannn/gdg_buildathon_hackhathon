import type { SeverityType } from "@/components/droplet-pin";

export interface ReportItem {
  id: string;
  userId: string;
  photoFile: string;
  type: "blocked_drain" | "standing_water" | "open_manhole" | "garbage_in_drain" | "other";
  severity: SeverityType;
  complaintText: string | null;
  lat: number;
  lng: number;
  areaId: number | null;
  areaName?: string | null;
  areaNameUr?: string | null;
  areaNamePs?: string | null;
  status: "open" | "sent" | "marked_fixed" | "verified_fixed";
  aiConfidence?: string | null;
  createdAt: string;
  sentAt?: string | null;
  markedFixedAt?: string | null;
  verifiedAt?: string | null;
  confirmationsCount: number;
  fixChecksYesCount: number;
  fixChecksNoCount: number;
}
