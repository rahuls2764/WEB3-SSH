export const uploadCourseToIPFS = async (req, res) => {
    try {
      const {
        title,
        category,
        difficulty,
        price,
        duration,
        description,
        prerequisites,
        learningOutcomes,
        quiz
      } = JSON.parse(req.body.metadata); // frontend will send metadata as JSON string
  
      const files = req.files; // thumbnail and video
  
      const videoFile = files?.videoFile?.[0];
      const thumbnail = files?.thumbnail?.[0];
  
      const videoCid = videoFile ? await pinata.uploadFile(videoFile.buffer, videoFile.originalname) : '';
      const thumbnailCid = thumbnail ? await pinata.uploadFile(thumbnail.buffer, thumbnail.originalname) : '';
  
      const descriptionCid = await pinata.uploadText(description, `description_${Date.now()}.txt`);
      const prerequisitesCid = await pinata.uploadText(prerequisites.join('\n'), `prerequisites_${Date.now()}.txt`);
      const outcomesCid = await pinata.uploadText(learningOutcomes.join('\n'), `outcomes_${Date.now()}.txt`);
      const quizCid = await pinata.uploadJSON(quiz, `quiz_${Date.now()}.json`);
  
      const metadata = {
        title,
        category,
        difficulty,
        price,
        duration,
        videoCid,
        thumbnailCid,
        descriptionCid,
        prerequisitesCid,
        learningOutcomesCid: outcomesCid,
        quizCid
      };
  
      const metadataCid = await pinata.uploadJSON(metadata, `course_metadata_${Date.now()}.json`);
      return res.json({ metadataCid });
    } catch (err) {
      console.error('Upload course error:', err);
      res.status(500).json({ error: 'Failed to upload course content to IPFS' });
    }
  };import React, { useState } from 'react';
  import axios from 'axios';
  
  const CourseAssistant = ({ courseId }) => {
    const [question, setQuestion] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
  
    const handleAsk = async () => {
      if (!question.trim()) return;
      setMessages([...messages, { from: 'user', text: question }]);
      setLoading(true);
  
      try {
        const res = await axios.post(`/api/chat/${courseId}/ask`, { question });
        const reply = res.data.answer;
        setMessages(prev => [...prev, { from: 'ai', text: reply }]);
      } catch (err) {
        console.error(err);
        setMessages(prev => [...prev, { from: 'ai', text: "Error fetching answer" }]);
      }
  
      setLoading(false);
      setQuestion('');
    };
  
    return (
      <div className="bg-white p-4 rounded-xl shadow-md mt-8">
        <h3 className="text-xl font-semibold mb-3">🤖 Ask about this course</h3>
        
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {messages.map((m, i) => (
            <div key={i} className={`text-sm p-2 rounded ${m.from === 'user' ? 'bg-indigo-100 text-right' : 'bg-gray-100'}`}>
              <p>{m.text}</p>
            </div>
          ))}
        </div>
  
        <div className="mt-4 flex gap-2">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question..."
            className="flex-1 px-4 py-2 border rounded-md"
          />
          <button
            onClick={handleAsk}
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md"
          >
            {loading ? 'Asking...' : 'Ask'}
          </button>
        </div>
      </div>
    );
  };
  
  export default CourseAssistant;
  