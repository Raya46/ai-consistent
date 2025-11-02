import { experimental_transcribe as transcribe } from "ai";
import { openai } from "@ai-sdk/openai";

export const maxDuration = 360;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return new Response(JSON.stringify({ error: "Audio file is required." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

    const { text } = await transcribe({
      model: openai.transcription("whisper-1"),
      audio: audioBuffer,
    });

    return new Response(JSON.stringify({ transcript: text }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error transcribing audio:", error);
    return new Response(JSON.stringify({ error: "Failed to transcribe audio." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}