import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { summary, questions, transcript } = await req.json();

    if (!summary || !questions || !transcript) {
      return new Response(
        JSON.stringify({ error: "Missing required analysis data." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = await generateObject({
      model: openai("gpt-4o-mini"),
      system: `You are VerifierAI, an analysis system. Your task is to compare an interview transcript against a document summary and verification questions.
- Categorize findings into 'inconsistent', 'needClarification', or 'aligned'.
- For 'inconsistent' items, you MUST assign severity: "high".
- For 'needClarification' items, you MUST assign severity: "medium".
- For 'aligned' items, you MUST assign severity: "low".
- Provide a final score for Overall, Consistency, Clarity, and Completeness.`,
      prompt: `
      Document Summary: "${summary}"
      Verification Questions: ${JSON.stringify(questions)}
      Interview Transcript: "${transcript}"

      Based on the provided data, perform a comprehensive analysis.
    `,
      schema: z.object({
        assessment: z.object({
          overallScore: z.number().describe("The overall score, from 0-100."),
          consistencyScore: z
            .number()
            .describe("Consistency score, from 0-100."),
          clarityScore: z.number().describe("Clarity score, from 0-100."),
          completenessScore: z
            .number()
            .describe("Completeness score, from 0-100."),
          summary: z.string().describe("A brief summary of the findings."),
          recommendation: z.string().describe("e.g., 'Consistent & Valid'"),
        }),
        analysis: z.object({
          inconsistent: z.array(
            z.object({
              title: z.string(),
              document: z.string(),
              interview: z.string(),
              severity: z.literal("high"),
            })
          ),
          needClarification: z.array(
            z.object({
              title: z.string(),
              document: z.string(),
              interview: z.string(),
              severity: z.literal("medium"),
            })
          ),
          aligned: z.array(
            z.object({
              title: z.string(),
              document: z.string(),
              interview: z.string(),
              severity: z.literal("low"),
            })
          ),
        }),
      }),
    });

    return result.toJsonResponse();
  } catch (error) {
    console.error("Error analyzing interview:", error);
    return new Response(
      JSON.stringify({ error: "Failed to analyze interview." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}