export async function POST(request) {
  try {
    const { message } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("The GEMINI_API_KEY environment variable is not set.");
    }

    if (typeof message !== "string" || !message.trim()) {
      throw new Error("Please provide a message to send.");
    }

    // Send the question and study-helper instructions to Gemini.
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: "You are a friendly study helper. Explain things in simple words.",
              },
            ],
          },
          contents: [
            {
              parts: [{ text: message }],
            },
          ],
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Gemini could not generate a reply.");
    }

    const reply = data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .filter(Boolean)
      .join("");

    if (!reply) {
      throw new Error("Gemini returned an empty reply.");
    }

    return Response.json({ reply });
  } catch (error) {
    // Return a readable message when a request or the Gemini call fails.
    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong while generating a reply.";

    return Response.json({ error: message }, { status: 500 });
  }
}
