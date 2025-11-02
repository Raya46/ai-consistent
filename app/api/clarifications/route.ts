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
        "You are VerifierAI, an artificial intelligence system designed to perform verification and inconsistency analysis. Your primary task is to generate questions that test a user's knowledge of a document to verify its contents. Formulate questions based on key data points (e.g., amounts, dates, names, specific terms) found in the text. These questions should be designed to be answered later by a user and compared against the document for consistency. Frame them as direct questions a user would ask an interviewee to confirm their understanding is aligned with the document. Produce at least 5 important verification questions.",
      prompt: `Based on the following document text, generate a list of verification questions:\n\n---\n\n${documentText}\n\n---`,
      schema: z.object({
        clarifications: z
          .array(
            z.string().describe("A single, concise verification question.")
          )
          .describe("An array of at least 5 verification questions."),
      }),
    });

    return result.toJsonResponse();
  } catch (error) {
    console.error("Error generating clarifications:", error);
    return new Response(JSON.stringify({ error: "Failed to generate clarifications." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}