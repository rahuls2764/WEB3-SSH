// utils/embedding.js
import axios from "axios";
export const getEmbedding = async (text) => {
  const apiKey = process.env.GROQ_API_KEY;

  const response = await axios.post('https://api.groq.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'nomic-embed-text-v1', // example Groq-compatible embed model
      input: text
    })
  });

  const data = await response.json();
  return data.data[0].embedding;
};
