import { CohereClientV2 } from "cohere-ai";

const systemPrompt = `You are a skilled music writer. Write the specified number of bars of sheet music following the format used by the example below (but use different notes). Only use notes between C3 and C5. Note that w=whole, h=half, q=quarter, 8=eighth, 16=sixteenth. Output in JSON format.
[
    { key: ["c/3"], duration: "q", fingering: "5" },
    { key: ["g/3"], duration: "q", fingering: "1" },
    { key: ["c/3"], duration: "h", fingering: "5" },
    { key: ["f/3"], duration: "q", fingering: "2" },
    { key: ["g/3"], duration: "q", fingering: "1" },
    { key: ["c/3"], duration: "h", fingering: "5" },
    { key: ["f/3"], duration: "w", fingering: "2" },
    { key: ["g/3"], duration: "8", fingering: "1" },
    { key: ["a/3"], duration: "8", fingering: "2" },
    { key: ["b/3"], duration: "8", fingering: "1" },
    { key: ["a/3"], duration: "8", fingering: "2" },
    { key: ["e/3"], duration: "h", fingering: "3" }
  ]`;

const userPrompt = `Write 6 bars of music, separated into trebleNotes and bassNotes.`;

const schema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    trebleNotes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          key: {
            type: "array",
            items: {
              type: "string",
            },
          },
          duration: {
            type: "string",
            enum: ["w", "h", "q", "8", "16"],
          },
          fingering: {
            type: "number",
            enum: [1, 2, 3, 4, 5],
          },
        },
        required: ["key", "duration", "fingering"],
        additionalProperties: false,
      },
    },
    bassNotes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          key: {
            type: "array",
            items: {
              type: "string",
            },
          },
          duration: {
            type: "string",
            enum: ["w", "h", "q", "8", "16"],
          },
          fingering: {
            type: "number",
            enum: [1, 2, 3, 4, 5],
          },
        },
        required: ["key", "duration", "fingering"],
        additionalProperties: false,
      },
    },
  },
  required: ["trebleNotes", "bassNotes"],
  additionalProperties: false,
};

export async function GET() {
  try {
    const cohere = new CohereClientV2({
      token: process.env.COHERE_API_KEY,
    });
    const response = await cohere.chat({
      model: "command-a-03-2025",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      responseFormat: {
        type: "json_object",
        jsonSchema: schema,
      },
    });

    return Response.json(response.message.content);
  } catch (error) {
    console.error("Error fetching feedback from Gemini:", error);
    return new Response("Internal server error", {
      status: 500,
    });
  }
}
