export interface QueuedReport {
  id: string;
  photoDataUrl: string;
  photoName: string;
  type: string;
  severity: string;
  complaintText?: string;
  lat: number;
  lng: number;
  areaId?: number | null;
  timestamp: number;
}

const STORAGE_KEY = "naali_offline_queue";

export function getOfflineQueue(): QueuedReport[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn("Error reading offline queue:", err);
    return [];
  }
}

export function saveReportOffline(
  report: Omit<QueuedReport, "id" | "timestamp">
): QueuedReport {
  const queue = getOfflineQueue();
  const newItem: QueuedReport = {
    ...report,
    id: `offline_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
  };

  queue.push(newItem);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error("Failed to save report offline:", err);
  }

  // Notify UI
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("naali-queue-updated", { detail: { count: queue.length } })
    );
  }

  return newItem;
}

export function removeOfflineReport(id: string): void {
  const queue = getOfflineQueue().filter((item) => item.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  } catch {}
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("naali-queue-updated", { detail: { count: queue.length } })
    );
  }
}

/**
 * Automatically sync all stored offline reports to server
 */
export async function syncOfflineReports(): Promise<{
  syncedCount: number;
  errors: number;
}> {
  const queue = getOfflineQueue();
  if (queue.length === 0) return { syncedCount: 0, errors: 0 };

  let syncedCount = 0;
  let errors = 0;

  for (const item of queue) {
    try {
      // 1. Convert base64 data URL to Blob
      const resBlob = await fetch(item.photoDataUrl);
      const blob = await resBlob.blob();
      const file = new File([blob], item.photoName || "offline_hazard.jpg", {
        type: blob.type || "image/jpeg",
      });

      // 2. Upload photo to /api/analyze to store safely on disk/tmp
      const formData = new FormData();
      formData.append("file", file);

      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const analyzeData = await analyzeRes.json();
      const photoFile = analyzeData?.photoFile;

      if (!photoFile) {
        throw new Error("Failed to persist offline photo");
      }

      // 3. Post to /api/reports
      const reportRes = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoFile,
          type: item.type,
          severity: item.severity,
          complaintText: item.complaintText || null,
          lat: item.lat,
          lng: item.lng,
          areaId: item.areaId || null,
          aiConfidence: "0.90",
        }),
      });

      if (reportRes.ok) {
        const createdData = await reportRes.json();
        removeOfflineReport(item.id);
        syncedCount++;

        // Notify client map to add the newly synced report
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("naali-report-synced", {
              detail: { report: createdData.report },
            })
          );
        }
      } else {
        errors++;
      }
    } catch (err) {
      console.error("Error syncing offline report item:", err);
      errors++;
    }
  }

  return { syncedCount, errors };
}
