// utils/TestQuizQuestions.js
import FetchQuiz from './FetchQuiz'; // your AI call utility
import {fallbackQuestions} from './FallbackQuestions';
// fallback questions in the required format  

export default async function TestQuizQuestions() {
  const prompt = `You are a strict JSON API. 
Generate 10 multiple-choice questions on "Beginner Tech Concepts". 
Each must have a question, 4 options (a–d), and a correct answer (a–d).
Respond ONLY with JSON. Format:
[
  {
    "_id": "uuid",
    "question": "...?",
    "options": {
      "a": "...",
      "b": "...",
      "c": "...",
      "d": "..."
    },
    "answer": "b"
  }
]`;

  try {
    const result = await FetchQuiz({ prompt });
    if (Array.isArray(result)) return result;
    return fallbackQuestions;
  } catch (err) {
    console.error("Quiz fetch failed. Using fallback.", err);
    return fallbackQuestions;
  }
}
