import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = "force-dynamic";

const PESHAWAR_AREAS = [
  "Hayatabad",
  "University Town",
  "Saddar",
  "Kohati Gate",
  "Hashtnagri",
  "Gulbahar",
  "Charsadda Road",
  "Ring Road",
  "Yakatooth",
  "Dabgari Gardens",
  "G.T. Road",
  "Karkhano",
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { audioBase64, mimeType = "audio/webm", customKey } = body;

    if (!audioBase64) {
      return NextResponse.json({ error: "No audio data provided" }, { status: 400 });
    }

    const apiKey = customKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is required to process audio complaints. Please add your key in settings." },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are NaaliWatch Peshawar Civic AI assistant.
A citizen in Peshawar, Khyber Pakhtunkhwa is recording a voice complaint in Urdu, Pashto, or English regarding street waterlogging, flooded roads, blocked storm drains (naalis), or hazardous open manholes.

Analyze the audio recording and extract civic complaint details in pure JSON format:
{
  "transcript": "Exact transcription of words spoken in original language (Urdu, Pashto, or English)",
  "languageDetected": "ur | ps | en",
  "complaintText": "A clear, descriptive summary of the problem in English for municipal dispatch",
  "complaintTextUrdu": "اردو میں مسئلے کا خلاصہ",
  "detectedArea": "Matched Peshawar area/mohallah (e.g. 'Kohati Gate', 'Hayatabad', 'University Town', 'Saddar', 'Gulbahar', 'Charsadda Road', 'Ring Road', 'Hashtnagri') or null if not specified",
  "detectedType": "blocked_drain | standing_water | open_manhole | garbage_in_drain | other",
  "detectedSeverity": "ankle | knee | danger"
}

Do not wrap in markdown or backticks, return ONLY valid JSON.`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: mimeType.split(";")[0],
          data: audioBase64.replace(/^data:audio\/\w+;base64,/, ""),
        },
      },
      prompt,
    ]);

    const text = result.response.text().trim();
    let parsed: any;
    try {
      const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        transcript: text,
        complaintText: text,
        detectedType: "blocked_drain",
        detectedSeverity: "knee",
        detectedArea: null,
      };
    }

    // Verify area against known Peshawar landmarks
    if (parsed.detectedArea) {
      const match = PESHAWAR_AREAS.find(
        (a) => a.toLowerCase() === parsed.detectedArea.toLowerCase()
      );
      if (match) parsed.detectedArea = match;
    }

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("Voice transcription error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to transcribe audio" },
      { status: 500 }
    );
  }
}
