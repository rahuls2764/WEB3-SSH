// controllers/vector.controller.js
import { chunkText } from "../utils/chunker.js";
import { createCollection, upsertDocuments, queryCollection } from "../services/chroma.service.js";
import axios from "axios";

// --- Helper to get Groq embedding ---
export const getNomicEmbedding = async (text) => {
  try {
    const res = await axios.post(
      "https://api-atlas.nomic.ai/v1/embedding/text",
      {
        model: "nomic-embed-text-v1.5", // Latest version
        texts: [text],
        task_type: "search_document",
        dimensionality: 768
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.NOMIC_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    console.log("Nomic embedding response received for text length:", text.length);
    return res.data.embeddings[0];
  } catch (error) {
    console.error("Error getting Nomic embedding:", error.response?.data || error.message);
    throw new Error("Failed to get embedding from Nomic AI");
  }
};

// --- Ingest course ---
export const ingestCourseChunks = async (req, res) => {
  try {
    const { courseId, description, prerequisites, outcomes } = req.body;
    console.log("Ingesting course:", courseId);
    
    // Validate required fields
    if (!courseId || !description) {
      return res.status(400).json({ error: "courseId and description are required" });
    }

    const combinedText = `${description}\n\nPrerequisites:\n${(prerequisites || []).join(
      "\n"
    )}\n\nLearning Outcomes:\n${(outcomes || []).join("\n")}`;
    
    console.log("Combined text length:", combinedText.length);
    
    const chunks = chunkText(combinedText);
    console.log("Generated chunks:", chunks.length);
    
    const collectionName = `course-${courseId}`;
    console.log("Collection name:", collectionName);
    
    // Create collection (will get existing if it already exists due to get_or_create: true)
    await createCollection(collectionName, {
      description: `Vector store for course ${courseId}`,
      courseId: courseId
    });

    // Process chunks in batches to avoid overwhelming the API
    const batchSize = 5;
    const documents = [];
    
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(chunks.length/batchSize)}`);
      
      const batchDocuments = await Promise.all(
        batch.map(async (text, batchIndex) => {
          const chunkIndex = i + batchIndex;
          console.log(`Getting embedding for chunk ${chunkIndex + 1}/${chunks.length}`);
          
          try {
            const embedding = await getNomicEmbedding(text);
            return {
              id: `${courseId}_chunk_${chunkIndex}`,
              document: text, // Note: using 'document' as per API spec
              metadata: { 
                chunk: chunkIndex, 
                courseId,
                chunkLength: text.length,
                createdAt: new Date().toISOString()
              },
              embedding
            };
          } catch (error) {
            console.error(`Failed to process chunk ${chunkIndex}:`, error.message);
            throw error;
          }
        })
      );
      
      documents.push(...batchDocuments);
    }
    
    console.log("Upserting documents:", documents.length);
    await upsertDocuments(collectionName, documents);
    
    res.json({ 
      success: true, 
      chunksStored: documents.length,
      collectionName,
      courseId
    });
    
  } catch (err) {
    console.error("Ingest error:", err.response?.data || err.message);
    res.status(500).json({ 
      error: "Failed to ingest course chunks",
      details: err.message 
    });
  }
};

// --- Ask question ---
export const queryCourseChunks = async (req, res) => {
  try {
    const { courseId, question, topK = 5 } = req.body;
    
    // Validate required fields
    if (!courseId || !question) {
      return res.status(400).json({ error: "courseId and question are required" });
    }
    
    console.log("Querying course:", courseId, "with question:", question.substring(0, 100) + "...");
    
    const embedding = await getNomicEmbedding(question);
    const collectionName = `course-${courseId}`;
    
    // Query with proper options structure
    const result = await queryCollection(collectionName, [embedding], {
      nResults: topK,
      include: ["documents", "metadatas", "distances"]
    });
    
    // The result structure from ChromaDB v2 API:
    // result.documents[0] = array of documents for first query
    // result.metadatas[0] = array of metadata for first query  
    // result.distances[0] = array of distances for first query
    // result.ids[0] = array of ids for first query
    
    const topChunks = result.documents[0] || [];
    const metadata = result.metadatas[0] || [];
    const distances = result.distances[0] || [];
    const ids = result.ids[0] || [];
    
    // Combine the results for easier consumption
    const combinedResults = topChunks.map((doc, index) => ({
      document: doc,
      metadata: metadata[index],
      distance: distances[index],
      id: ids[index],
      similarity: 1 - (distances[index] || 1) // Convert distance to similarity score
    }));
    
    console.log("Query returned", combinedResults.length, "results",combinedResults);
    
    res.json({ 
      results: combinedResults,
      question,
      courseId,
      totalResults: combinedResults.length
    });
    
  } catch (err) {
    console.error("Query error:", err.response?.data || err.message);
    res.status(500).json({ 
      error: "Failed to query vector DB",
      details: err.message 
    });
  }
};

// --- Additional helper functions ---

// Get course collection info
export const getCourseInfo = async (req, res) => {
  try {
    const { courseId } = req.params;
    const collectionName = `course-${courseId}`;
    
    const { getCollection, countDocuments } = await import("../services/chroma.service.js");
    
    const collection = await getCollection(collectionName);
    const count = await countDocuments(collectionName);
    console.log("this is collection",collection,count);
    res.json({
      collection: collection,
      documentCount: count,
      courseId
    });
    
  } catch (err) {
    console.error("Get course info error:", err.message);
    res.status(500).json({ 
      error: "Failed to get course info",
      details: err.message 
    });
  }
};

// Delete course collection
export const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const collectionName = `course-${courseId}`;
    
    const { deleteCollection } = await import("../services/chroma.service.js");
    
    await deleteCollection(collectionName);
    
    res.json({
      success: true,
      message: `Course ${courseId} collection deleted successfully`,
      courseId
    });
    
  } catch (err) {
    console.error("Delete course error:", err.message);
    res.status(500).json({ 
      error: "Failed to delete course",
      details: err.message 
    });
  }
};

// List all course collections
export const listCourses = async (req, res) => {
  try {
    const { listCollections } = await import("../services/chroma.service.js");
    
    const collections = await listCollections();
    
    // Filter only course collections
    const courseCollections = collections
      .filter(col => col.name.startsWith('course-'))
      .map(col => ({
        ...col,
        courseId: col.name.replace('course-', '')
      }));
    
    res.json({
      courses: courseCollections,
      totalCourses: courseCollections.length
    });
    
  } catch (err) {
    console.error("List courses error:", err.message);
    res.status(500).json({ 
      error: "Failed to list courses",
      details: err.message 
    });
  }
};