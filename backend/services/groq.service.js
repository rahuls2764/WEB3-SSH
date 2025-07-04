import axios from 'axios';

export const askGroqModel = async (context, question) => {
  try {
    const prompt = `You are a helpful course assistant. Use the context below to answer the user's question.\n\nContext:\n${context}\n\nQuestion: ${question}\nAnswer:Answer to question in brief and short and in human tone`;

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'deepseek-r1-distill-llama-70b', // <-- Updated model name (example, check Groq docs!)
        messages: [
          { role: 'system', content: 'You are a helpful AI tutor for SkillBridge.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    let result = response.data.choices?.[0]?.message?.content;
    result = result.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    console.log("this is groq result",result);
    return result;
  } catch (error) {
    console.error("Groq API failed:", error.response?.data || error.message);
    throw new Error("Groq model failed to respond.");
  }
};
