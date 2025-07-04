// import { getEmbedding } from "../utils/embedding.js";
import {
  createCollection,
  upsertDocuments,
  queryCollection,
} from "./chroma.service.js";

import { getNomicEmbedding } from "../controllers/vector.controllers.js";
// Upload course chunks to ChromaDB
export const uploadCourseChunks = async (courseId, chunks = []) => {
  const collectionName = `course-${courseId}`;

  await createCollection(collectionName);

  const docs = await Promise.all(
    chunks.map(async (text, i) => ({
      id: `${courseId}_chunk_${i}`,
      document: text,
      embedding: await getNomicEmbedding(text),
      metadata: { courseId, chunk: i },
    }))
  );

  await upsertDocuments(collectionName, docs);
};

// Get top 4 relevant chunks for a given courseId + question
export const getRelevantChunks = async (courseId, question) => {
  const collectionName = `course-${courseId}`;
  const embedding = await getNomicEmbedding(question);

  const result = await queryCollection(collectionName, embedding, {
    nResults: 4,
    include: ["documents", "metadatas"],
  });
  console.log("this is response of chunks over collections",result);

  // Format response to return array of chunk objects
  return result.documents[0].map((doc, i) => ({
    content: doc,
    metadata: result.metadatas[0][i],
  }));
};
