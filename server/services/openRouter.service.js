import axios from "axios";

export const askAI = async (messages) => {
  try {
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error("No messages found");
    }

    const res = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: messages,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const content = res.data?.choices?.[0]?.message?.content;

    if (!content || !content.trim()) {
      console.log("Raw response:", res.data);
      throw new Error("AI returned empty response");
    }

    return content;
  } catch (error) {
    console.error("OpenRouter error:", error?.response?.data || error.message);
    throw new Error("Openrouter API Error");
  }
};