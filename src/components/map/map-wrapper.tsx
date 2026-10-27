"use client";

import dynamic from "next/dynamic";
import React from "react";
import type { ReportItem } from "@/types/report";
import type { SafeRouteResponse } from "@/types/route";

const DynamicLiveMap = dynamic(
  () => import("./live-map").then((mod) => mod.LiveMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-[#EAF0F2] text-[#4B6073] gap-3">
        <div className="w-10 h-10 border-4 border-[#0E6B73] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium">Loading Peshawar Live Map...</span>
      </div>
    ),
  }
);

export function MapWrapper(props: {
  reports: ReportItem[];
  selectedReport: ReportItem | null;
  onSelectReport: (report: ReportItem | null) => void;
  avoidRoadLayer: boolean;
  pickedLocation: { lat: number; lng: number } | null;
  onPickLocation?: (coords: { lat: number; lng: number }) => void;
  isPickingLocation?: boolean;
  activeRoute?: SafeRouteResponse | null;
  radarActive?: boolean;
  onProximityAlert?: (hazardText: string | null) => void;
}) {
  return <DynamicLiveMap {...props} />;
}
