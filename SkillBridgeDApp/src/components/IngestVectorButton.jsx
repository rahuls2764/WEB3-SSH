// src/components/IngestVectorButton.jsx
import React, { useState } from "react";
import { ingestCourseToVector } from "../services/aiApi";
import toast from "react-hot-toast";

// src/components/IngestVectorButton.jsx
const IngestVectorButton = ({ courseData }) => {
  const [loading, setLoading] = useState(false);

  const handleIngest = async () => {
    try {
      setLoading(true);
      await ingestCourseToVector(courseData); // ✅ pass full object
      toast.success("Course content uploaded to AI assistant!");
    } catch (err) {
      console.error("Ingest error:", err);
      toast.error("Failed to upload to AI assistant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleIngest}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      disabled={loading}
    >
      {loading ? "Uploading..." : "Enable AI Assistant"}
    </button>
  );
};


export default IngestVectorButton;
