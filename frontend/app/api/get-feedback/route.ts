import { CohereClientV2 } from "cohere-ai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { NextApiRequest, NextApiResponse } from "next";
import { remark } from "remark";
import { Note } from "../../tutor/page";
import { NextRequest } from "next/server";
import html from "remark-html";
import matter from "gray-matter";

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
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
    // Construct the prompt to send to Cohere
    const systemPrompt = `You are a nice and helpful piano tutor. Below are two arrays: the 1st is of the notes that the user should've played according to the sheet music (along with timestamps in seconds) and the 2nd is of the notes that the user actually played (along with timestamps in seconds). Respond with very brief, specific feedback in plain text on things the user could improve or did well.`;
    const userPrompt = `Expected: ${JSON.stringify(expectedNotes)}\nActual: ${JSON.stringify(playedNotes)}`;
    // Call Cohere API (make sure to set your API key in an environment variable)
    const response = await model.generateContent(systemPrompt + "\n" + userPrompt);

    const matterResult = matter(response.response.text())
    const processedContent = await remark()
      .use(html)
      .process(matterResult.content);
    const contentHtml = processedContent.toString();

    // if (response.response.tex === 'ERROR') {
    //   return new Response("An error occurred", {
    //     status: 500
    //   });
    // }

    return Response.json({ response: contentHtml });
  } catch (error) {
    console.error("Error fetching feedback from Gemini:", error);
    return new Response("Internal server error", {
      status: 500
    });
  }
}
