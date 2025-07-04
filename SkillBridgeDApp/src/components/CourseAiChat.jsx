import React, { useState } from "react";
import { askCourseAI } from "../services/aiApi";
import { Sparkles, Trash2 } from "lucide-react";

const CourseAIChat = ({ courseMetadataCid }) => {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const askQuestion = async () => {
    if (!question.trim()) return;

    const userMessage = { type: "user", text: question };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await askCourseAI(courseMetadataCid, question);
      const answer = response || "I couldn't find a good answer.";

      setMessages([
        ...newMessages,
        {
          type: "ai",
          text: answer,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error("AI query failed:", err);
      let errorMessage = "Something went wrong.";
      if (err.response?.status === 400) errorMessage = "Invalid question.";
      else if (err.response?.status === 404) errorMessage = "Course not found.";
      else if (err.response?.status === 500) errorMessage = "AI is temporarily unavailable.";

      setMessages([
        ...newMessages,
        {
          type: "ai",
          text: errorMessage,
          isError: true,
          timestamp: new Date().toISOString(),
        },
      ]);
    }

    setQuestion("");
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askQuestion();
    }
  };

  const clearChat = () => setMessages([]);

  return (
    <div className="w-full h-full bg-white border border-gray-200 rounded-xl p-6 text-gray-900 shadow-xl transition duration-300 ease-in-out">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2 text-blue-600">
          <Sparkles className="w-5 h-5" /> AI Assistant
        </h3>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="text-sm text-gray-400 hover:text-red-500 flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" /> Clear
          </button>
        )}
      </div>

      <div className="h-[70%] overflow-y-auto bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-gray-400 text-center">
            Ask anything about this course – prerequisites, content, outcomes, and more.
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] px-4 py-3 rounded-xl text-sm transition-all duration-300 ease-in-out shadow-md ${
                  msg.type === "user"
                    ? "bg-blue-100 text-blue-800 rounded-br-none hover:scale-[1.02]"
                    : msg.isError
                    ? "bg-red-100 text-red-600 border border-red-300"
                    : "bg-gray-100 text-gray-800 border border-gray-200 rounded-bl-none hover:scale-[1.02]"
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
                {msg.timestamp && (
                  <div className="text-xs mt-1 text-gray-400 text-right">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-3 rounded-xl border border-gray-300 animate-pulse shadow">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                <span className="text-gray-400 text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask about outcomes, skills, topics..."
          disabled={loading}
          className="flex-1 bg-white border border-gray-300 text-gray-800 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={askQuestion}
          disabled={loading || !question.trim()}
          className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 px-5 py-3 rounded-lg text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed shadow"
        >
          {loading ? "..." : "Ask"}
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-2">
        Press <span className="font-semibold text-blue-500">Enter</span> to send • <span className="font-semibold text-blue-500">Shift+Enter</span> for newline
      </p>
    </div>
  );
};

export default CourseAIChat;
