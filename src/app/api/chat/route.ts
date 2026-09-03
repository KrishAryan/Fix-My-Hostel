import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `You are FixBot, the intelligent AI assistant for "Fix My Hostel" - a smart hostel facility and complaint management system.
Your mission is to help hostel students and administrators quickly resolve issues and navigate the platform.

Key Knowledge Base:
- How to raise a complaint: Go to the Student Dashboard and click "+ Raise Complaint". Provide the hostel block (Block A, B, C, etc.), room number, issue category, severity level (1 to 10 slider), and optional photo.
- Complaint Priority Algorithm: Priority Score = (0.4 × Severity) + (0.3 × Upvotes) + (0.2 × Days Pending).
  - Priority levels: Critical Priority (Emergencies / hazards), High Priority (Urgent fixes), Medium Priority (Standard maintenance), Low Priority (Routine requests).
  - Critical & High Priority complaints are prioritized for rapid technician assignment.
- Categories supported: Plumbing, Electrical, Furniture, Cleaning / Housekeeping, Internet / Wi-Fi, Security, Pest Control.
- Upvoting: Students can upvote existing complaints in common areas to boost their priority without creating duplicate tickets.
- Tracking status: Students can view ticket lifecycle (Pending -> In Progress -> Resolved) directly on their dashboard.
- Emergency Contacts: For urgent safety or severe facility hazards, contact the Hostel Warden (+1-800-WARDEN / +91-98765-43210) or Security Desk (+1-800-SECURE).
- Hostel Rules: Quiet hours are 10:00 PM - 6:00 AM. Visitors permitted until 8:00 PM only. Common facilities must be kept clean.

Keep answers concise, direct, helpful, and formatted with clean bullet points or short paragraphs where helpful.`;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === "") {
      console.error("[FixBot API] GEMINI_API_KEY is not configured in environment variables.");
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload in request body." },
        { status: 400 }
      );
    }

    const message = body?.message;
    if (!message || typeof message !== "string" || message.trim() === "") {
      return NextResponse.json(
        { error: "A valid 'message' string is required." },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // Stream using gemini-2.5-flash with fallback to gemini-2.5-flash-lite
    let stream;
    try {
      stream = await ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents: message.trim(),
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
      });
    } catch (modelErr: any) {
      console.warn("[FixBot API] gemini-2.5-flash stream failed, falling back to gemini-2.5-flash-lite:", modelErr?.message || modelErr);
      try {
        stream = await ai.models.generateContentStream({
          model: "gemini-2.5-flash-lite",
          contents: message.trim(),
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
          },
        });
      } catch (fallbackErr: any) {
        console.error("[FixBot API] All Gemini model stream attempts failed:", fallbackErr?.message || fallbackErr);
        return NextResponse.json(
          { error: fallbackErr?.message || "Failed to generate AI response from Gemini API." },
          { status: 500 }
        );
      }
    }

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.text;
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
        } catch (streamErr) {
          console.error("[FixBot API] Error streaming chunks:", streamErr);
          controller.error(streamErr);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
      },
    });
  } catch (err: any) {
    console.error("[FixBot API] Unhandled server error in chat route:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error occurred while processing chat request." },
      { status: 500 }
    );
  }
}