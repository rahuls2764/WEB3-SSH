import React from 'react'

export default async function FetchQuiz({prompt=""}) {
    const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "deepseek-r1-distill-llama-70b", // Replace with the recommended model
      messages: [
        { role: "system", content: "You are a helpful quiz generator bot." },
        { role: "user", content: prompt }
      ]
    })
  });
  console.log("this is response of api ",res);
  const data = await res.json();
  console.log("this is response of api data ",data);

  const content = data.choices?.[0]?.message?.content;
  console.log("this is response of api content ",content);

  
  try {
    // Extract only the JSON part
    const jsonStart = content.indexOf('[');
    const jsonEnd = content.lastIndexOf(']');
    const jsonString = content.slice(jsonStart, jsonEnd + 1);

    const parsed = JSON.parse(jsonString);
    console.log("Parsed quiz data:", parsed);
    return parsed;
  } catch (err) {
    console.error("Failed to parse quiz JSON", err);
    return [];
  }
  
}
