import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { documentText }: { documentText: string } = await req.json();

    if (!documentText) {
      return new Response(
        JSON.stringify({ error: "Document text is required." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = await generateObject({
      model: openai("gpt-4o"),
      system:
        "You are an expert summarizer. Your task is to provide a concise, professional summary of the provided document text, capturing the key points, figures, and conclusions. The summary should be objective and data-driven.",
      prompt: `Please summarize the following document content:\n\n---\n\n${documentText}\n\n---`,
      schema: z.object({
        summary: z
          .string()
          .describe(
            "A concise summary of the document, typically 3-5 sentences."
          ),
      }),
    });

    return result.toJsonResponse();
  } catch (error) {
    console.error("Error generating summary:", error);
    return new Response(JSON.stringify({ error: "Failed to generate summary." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}