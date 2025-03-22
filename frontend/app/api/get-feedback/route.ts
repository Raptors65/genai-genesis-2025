import { CohereClientV2 } from "cohere-ai";
import type { NextApiRequest, NextApiResponse } from "next";
import { Note } from "../../tutor/page";
import { NextRequest } from "next/server";

type FeedbackRequestBody = {
  expectedNotes: Note[];
  playedNotes: Note[];
};

export async function POST(
  req: NextRequest,
) {
  const { expectedNotes, playedNotes } = await req.json() as FeedbackRequestBody;

  // Basic validation: ensure arrays exist
  if (!Array.isArray(expectedNotes) || !Array.isArray(playedNotes)) {
    return new Response("expectedNotes and actualNotes must be provided as arrays", {
      status: 400
    });
  }

  try {

    const cohere = new CohereClientV2({
      token: process.env.COHERE_API_KEY
    });

    // Construct the prompt to send to Cohere
    const systemPrompt = `You are a helpful piano tutor. You'll be given two arrays: the 1st is of the notes that the user should've played according to the sheet music (along with timestamps in seconds) and the 2nd is of the notes that the user actually played (along with timestamps in seconds). Respond with very brief, specific feedback on things the user could improve or did well.`;
    const userPrompt = `Expected: ${JSON.stringify(expectedNotes)}\nActual: ${JSON.stringify(playedNotes)}`;
    // Call Cohere API (make sure to set your API key in an environment variable)
    const response = await cohere.chat({
      model: 'command-a-03-2025',
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      maxTokens: 100
    });

    if (response.finishReason === 'ERROR') {
      return new Response("An error occurred", {
        status: 500
      });
    }

    return Response.json({ response: response.message });
  } catch (error) {
    console.error("Error fetching feedback from Cohere:", error);
    return new Response("Internal server error", {
      status: 500
    });
  }
}
