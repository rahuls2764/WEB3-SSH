import { getRelevantChunks } from '../services/vector.service.js';
import { askGroqModel } from '../services/groq.service.js';

export const handleCourseChat = async (req, res) => {
  const { courseId } = req.params;
  const { question } = req.body;
  console.log("this is course id",courseId);
  if (!question) return res.status(400).json({ error: "Question is required." });

  try {
    const contextChunks = await getRelevantChunks(courseId, question);
    console.log("this is contextchunks",contextChunks);
    const contextText = contextChunks.map(c => c.content).join('\n');
    console.log("this is context text",contextText);
    const answer = await askGroqModel(contextText, question);
    console.log("this is answer",answer);
    res.json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI assistant failed." });
  }
};
