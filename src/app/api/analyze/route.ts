import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const clientKey = (formData.get("geminiApiKey") as string) || req.headers.get("x-gemini-api-key");

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    // 1. Save photo to ./uploads (with /tmp fallback for Vercel serverless functions)
    let uploadsDir = path.join(process.cwd(), "uploads");
    try {
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
    } catch {
      uploadsDir = path.join("/tmp", "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileExtension = path.extname(file.name) || ".jpg";
    const filename = `report_${Date.now()}_${crypto.randomBytes(4).toString("hex")}${fileExtension}`;
    let filePath = path.join(uploadsDir, filename);

    try {
      fs.writeFileSync(filePath, buffer);
    } catch {
      uploadsDir = path.join("/tmp", "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, buffer);
    }

    // 2. Analyze with Gemini Vision if API key is provided in env or request
    const apiKey = clientKey || process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // Using standard fast multimodal model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const systemPrompt = `You are a strict AI civic hazard classifier for Peshawar Urban Drainage and Sanitation (NaaliWatch).
YOUR PRIMARY TASK: Determine if the provided photo shows an ACTUAL OUTDOOR WATER HAZARD, STAGNANT/STANDING/STAINED WASTEWATER, A BLOCKED DRAIN, STREET FLOODING, PUDDLE, GUTTER OVERFLOW, OR OPEN MANHOLE THAT REQUIRES DRAINING OR DESILTATION.

STRICT VALIDATION CRITERIA:
1. ACCEPTABLE WATER IMAGES (valid = true):
   - Standing, pooled, or stained wastewater on streets, roads, sidewalks, or intersections that needs to be drained or pumped out.
   - Roadside drains ('naalis') or storm gutters choked with mud, silt, garbage, or sewage.
   - Flooded urban roads or pathways obstructing pedestrians, bikes, or vehicles.
   - Open, broken, or submerged manholes or overflowing sewage pipelines.

2. UNACCEPTABLE NON-WATER IMAGES (valid = false):
   - ANY image that does NOT show standing wastewater, flooded street, a drain, or an open manhole.
   - Indoor rooms, bedrooms, kitchens, offices, ceilings, walls.
   - Selfies, faces, portraits, people standing without standing water.
   - Clean, dry roads or cars without water accumulation.
   - Food, pets, animals, documents, receipts, screenshots of text, graphics, or memes.

Return ONLY a valid JSON object (no markdown, no backticks, no extra text):
{
  "valid": true or false,
  "detected_content": "A short 2-5 word label of what is actually visible in the photo (e.g. 'Indoor room', 'Selfie photo', 'Dry car on pavement', 'Standing dirty water on road', 'Clogged roadside drain')",
  "rejection_reason": "Wrong image! Please upload a photo showing standing water, flooded streets, or a blocked drain that needs to be drained." (set if valid is false, else null),
  "rejection_reason_ur": "غلط تصویر! برائے مہربانی کھڑے پانی، بند نالے، یا نکاسی آب کے مسئلے کی تصویر اپ لوڈ کریں جسے نکاسی کی ضرورت ہو۔" (set if valid is false, else null),
  "type": "blocked_drain" | "standing_water" | "open_manhole" | "garbage_in_drain" | "other",
  "severity": "ankle" | "knee" | "danger",
  "confidence": 0.95,
  "description": "one short sentence describing what is visible",
  "estimated_area": "Hayatabad" | "University Town" | "Saddar Bazar" | "Kohati Gate" | "Hashtnagri" | "Gulbahar" | "Charsadda Road" | "Ring Road" | null,
  "detected_text": "any Urdu or English signboard or landmark text spotted" | null,
  "complaint_en": "2-3 sentence formal complaint to Peshawar WSSP",
  "complaint_ur": "same complaint in Urdu"
}

Severity rules:
- danger: Open manhole, deep water covering road, live wires/electrical risk, or vehicle hazard.
- knee: Water deep enough to halt auto-rickshaws or motorcycles.
- ankle: Shallow standing water or gutter silt overflow.
Never include human faces or private vehicle license numbers.`;

        const imagePart = {
          inlineData: {
            data: buffer.toString("base64"),
            mimeType: file.type || "image/jpeg",
          },
        };

        const result = await model.generateContent([systemPrompt, imagePart]);
        const responseText = result.response.text().trim();

        // Clean markdown backticks
        const cleanedJson = responseText
          .replace(/^```json/i, "")
          .replace(/^```/, "")
          .replace(/```$/, "")
          .trim();

        const parsed = JSON.parse(cleanedJson);
        const isValid = parsed.valid === true;

        if (!isValid) {
          parsed.rejection_reason =
            parsed.rejection_reason ||
            "Wrong image! Please upload a photo showing standing water, flooded streets, or a blocked drain that needs to be drained.";
          parsed.rejection_reason_ur =
            parsed.rejection_reason_ur ||
            "غلط تصویر! برائے مہربانی کھڑے پانی، بند نالے، یا نکاسی آب کے مسئلے کی تصویر اپ لوڈ کریں جسے نکاسی کی ضرورت ہو۔";
          parsed.detected_content = parsed.detected_content || "Non-water image";
        }

        return NextResponse.json({
          success: true,
          photoFile: filename,
          ai: parsed,
          provider: "gemini_vision",
          isValidWaterHazard: isValid,
        });
      } catch (geminiError: any) {
        console.warn("Gemini Vision API call failed, falling back to heuristic tagging:", geminiError.message);
      }
    }

    // 3. Fallback Heuristic Tagging when Gemini key is not configured
    const originalName = (file.name || "").toLowerCase();
    const isWaterHazardKeyword =
      originalName.includes("water") ||
      originalName.includes("drain") ||
      originalName.includes("manhole") ||
      originalName.includes("flood") ||
      originalName.includes("puddle") ||
      originalName.includes("gutter") ||
      originalName.includes("sewage") ||
      originalName.includes("naali") ||
      originalName.includes("clog") ||
      originalName.includes("pipe") ||
      filename.includes("water") ||
      filename.includes("drain") ||
      filename.includes("manhole") ||
      filename.includes("flood") ||
      filename.includes("puddle") ||
      filename.includes("clog");

    // If filename clearly indicates a non-water/random image, reject in fallback
    if (!isWaterHazardKeyword) {
      return NextResponse.json({
        success: true,
        photoFile: filename,
        isValidWaterHazard: false,
        ai: {
          valid: false,
          detected_content: "Non-water image",
          rejection_reason:
            "Wrong image! Please upload a photo showing standing water, urban flooding, or a drainage problem that needs to be drained.",
          rejection_reason_ur:
            "غلط تصویر! برائے مہربانی کھڑے پانی، نالے یا نکاسی آب کے مسئلے کی تصویر اپ لوڈ کریں جسے نکاسی کی ضرورت ہو۔",
          confidence: 0.85,
          type: "other",
          severity: "ankle",
          description: "The uploaded image does not appear to show standing wastewater or a drainage blockage.",
          estimated_area: null,
          detected_text: null,
          complaint_en: null,
          complaint_ur: null,
        },
        isFallback: true,
      });
    }

    const fallbackArea = filename.includes("hayatabad")
      ? "Hayatabad"
      : filename.includes("kohati")
      ? "Kohati Gate"
      : filename.includes("saddar")
      ? "Saddar Bazar"
      : filename.includes("gulbahar")
      ? "Gulbahar"
      : filename.includes("hashtnagri")
      ? "Hashtnagri"
      : filename.includes("rehman")
      ? "Ring Road"
      : "University Town";

    const fallbackAi = {
      valid: true,
      detected_content: "Standing water and clogged drain",
      type: filename.includes("manhole")
        ? "open_manhole"
        : filename.includes("water")
        ? "standing_water"
        : "blocked_drain",
      severity: filename.includes("manhole") ? "danger" : "knee",
      confidence: 0.92,
      description: "Urban street drainage blockage with standing wastewater accumulation.",
      estimated_area: fallbackArea,
      detected_text: null,
      complaint_en:
        "The roadside storm drain is completely clogged with solid waste and mud, causing knee-deep water accumulation on the public thoroughfare. Urgent desiltation is requested from WSSP Peshawar.",
      complaint_ur:
        "سڑک کے کنارے کا نالہ گند اور مٹی سے مکمل بند ہے، جس کی وجہ سے راستے میں گندا پانی کھڑا ہو گیا ہے۔ ڈبلیو ایس ایس پی پشاور سے فوری صفائی کی درخواست ہے۔",
    };

    return NextResponse.json({
      success: true,
      photoFile: filename,
      ai: fallbackAi,
      isValidWaterHazard: true,
      isFallback: true,
    });
  } catch (error) {
    console.error("Photo analysis error:", error);
    return NextResponse.json({ error: "Failed to process photo" }, { status: 500 });
  }
}
