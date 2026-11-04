"use client";

import { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  async function sendMessage(event) {
    event.preventDefault();

    const message = question.trim();
    if (!message || isThinking) return;

    // Show the question right away and clear the input.
    setMessages((currentMessages) => [
      ...currentMessages,
      { sender: "user", text: message },
    ]);
    setQuestion("");
    setIsThinking(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "The request could not be completed.");
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        { sender: "ai", text: data.reply },
      ]);
    } catch {
      // Let the user know if the request did not work.
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          sender: "ai",
          text: "Sorry, I couldn't get a reply right now. Please try again.",
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col gap-6 p-6">
      <header>
        <h1 className="text-3xl font-bold">AI Study Helper</h1>
        <p className="mt-2 text-zinc-600">
          Ask a question and I&apos;ll explain it in simple words.
        </p>
      </header>

      <section
        aria-label="Chat messages"
        aria-live="polite"
        className="flex-1 space-y-4 rounded-2xl border border-gray-200 p-4"
      >
        {messages.length === 0 && (
          <p className="text-zinc-500">Your conversation will appear here.</p>
        )}

        {messages.map((message, index) => (
          <p
            key={`${message.sender}-${index}`}
            className={`max-w-[80%] rounded-2xl p-3 ${
              message.sender === "user"
                ? "ml-auto bg-blue-500 text-white"
                : "mr-auto bg-gray-200 text-gray-900"
            }`}
          >
            <strong>{message.sender === "user" ? "You: " : "AI: "}</strong>
            {message.text}
          </p>
        ))}

        {isThinking && <p className="text-zinc-500">Thinking...</p>}
      </section>

      <form onSubmit={sendMessage} className="flex gap-2">
        <label htmlFor="question" className="sr-only">
          Your question
        </label>
        <input
          id="question"
          type="text"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Type your question..."
          disabled={isThinking}
          className="min-w-0 flex-1 rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isThinking || !question.trim()}
          className="rounded-lg bg-blue-500 px-5 py-3 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </main>
  );
}
