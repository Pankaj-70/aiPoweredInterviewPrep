import axios from 'axios';

export const askAI = async(messages) => {
    try {
        if(!messages || !Array.isArray(messages) || messages.length === 0) {
            throw new Error('No message found');
        }
        const res = axios.post("https://openrouter.ai/api/v1/chat/completions", {
            models: "openai/gpt-4o-mini",
            messages: messages
        },{
        headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",   
        }});

        const content = res.data?.choices?.[0]?.messages?.content;
        if(!content || !content.trim()) {
            throw new Error("AI returned empty response");
        }
        return content;
 
     } catch (error) {
        console.error("Open router error: ", error);
        throw new Error("Openrouter API Error");
    }
}