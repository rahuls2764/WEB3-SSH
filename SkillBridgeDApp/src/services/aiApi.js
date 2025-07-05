// src/services/aiApi.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

import { fetchTextFromCid } from "../utils/ipfsFetcher";

export const ingestCourseToVector = async (courseData) => {
  const description = await fetchTextFromCid(courseData.descriptionCid);
  const prerequisitesText = await fetchTextFromCid(courseData.prerequisitesCid);
  const outcomesText = await fetchTextFromCid(courseData.learningOutcomesCid);

  const payload = {
    courseId: courseData.metadataCid,
    description,
    prerequisites: prerequisitesText.split("\n").filter(Boolean),
    outcomes: outcomesText.split("\n").filter(Boolean),
  };
  console.log("this is payload",payload);

  await axios.post(`${BASE_URL}/api/vector/ingest`, payload);
};


// export const askCourseAI = async (courseId, question) => {
//   const res = await axios.post(`${BASE_URL}/api/vector/query`, {
//     courseId,
//     question
//   });
//   return res.data.results;
// };
// // In your frontend (where askCourseAI is defined)

export const askCourseAI = async (courseMetadataCid, question) => {
  try {
    // CHANGE THIS LINE:
    // Instead of /api/vector/query, call the route that triggers handleCourseChat
    const res = await axios.post(`${BASE_URL}/api/chat/${courseMetadataCid}/ask`, {
      question // Only send the question in the body, courseId is in the URL param
    });

    // The response data should now contain the 'answer' from Groq
    return res.data.answer;

  } catch (error) {
    console.error("Error asking Course AI:", error);
    // You might want to return a user-friendly error message or re-throw
    throw new Error("Failed to get AI response.");
  }
};