// services/chroma.service.js
import axios from "axios";

// Configuration
const CHROMA_TENANT = process.env.CHROMA_TENANT || "default_tenant";
const CHROMA_DATABASE = process.env.CHROMA_DATABASE || "default_database";
const CHROMA_BASE_URL = process.env.CHROMA_BASE_URL || "https://chroma-server-production-232e.up.railway.app";
const CHROMA_API_ROOT = `${CHROMA_BASE_URL}/api/v2/tenants/${CHROMA_TENANT}/databases/${CHROMA_DATABASE}`;

console.log("Chroma API Root:", CHROMA_API_ROOT);

// Helper function to get collection by name (since API uses UUIDs)
const getCollectionByName = async (name) => {
    try {
        const response = await axios.get(`${CHROMA_API_ROOT}/collections`);
        const collections = response.data;
        const collection = collections.find(col => col.name === name);
        if (!collection) {
            throw new Error(`Collection '${name}' not found`);
        }
        return collection;
    } catch (error) {
        console.error("Error fetching collection:", error.message);
        throw error;
    }
};

// Create a new collection
export const createCollection = async (name, metadata = null, configuration = null) => {
    try {
        console.log("Attempting to create collection:", name);
        
        const payload = {
            name,
            get_or_create: true, // This will get existing collection if it already exists
        };
        
        if (metadata) {
            payload.metadata = metadata;
        }
        
        if (configuration) {
            payload.configuration = configuration;
        }
        
        const response = await axios.post(`${CHROMA_API_ROOT}/collections`, payload);
        console.log(`Collection '${name}' created successfully with ID:`, response.data.id);
        return response.data;
    } catch (error) {
        console.error("Error creating collection:", error.response?.data || error.message);
        throw error;
    }
};

// Add documents to a collection
export const addDocuments = async (collectionName, documents) => {
    try {
        console.log("Attempting to add documents to collection:", collectionName);
        
        const collection = await getCollectionByName(collectionName);
        
        // Prepare the payload according to API specification
        const payload = {
            ids: documents.map(doc => doc.id || `doc_${Date.now()}_${Math.random()}`),
            documents: documents.map(doc => doc.document || doc.text || doc.content),
            metadatas: documents.map(doc => doc.metadata || null),
        };
        
        // Include embeddings if provided
        if (documents[0]?.embedding) {
            payload.embeddings = documents.map(doc => doc.embedding);
        }
        
        // Include URIs if provided
        if (documents[0]?.uri) {
            payload.uris = documents.map(doc => doc.uri || null);
        }
        
        const response = await axios.post(
            `${CHROMA_API_ROOT}/collections/${collection.id}/add`,
            payload
        );
        
        console.log(`Added ${documents.length} documents to collection '${collectionName}'.`);
        return response.data;
    } catch (error) {
        console.error("Error adding documents:", error.response?.data || error.message);
        throw error;
    }
};

// Upsert documents to a collection (create or update)
export const upsertDocuments = async (collectionName, documents) => {
    try {
        console.log("Attempting to upsert documents into collection:", collectionName);
        
        const collection = await getCollectionByName(collectionName);
        
        // Prepare the payload according to API specification
        const payload = {
            ids: documents.map(doc => doc.id || `doc_${Date.now()}_${Math.random()}`),
            documents: documents.map(doc => doc.document || doc.text || doc.content),
            metadatas: documents.map(doc => doc.metadata || null),
        };
        
        // Include embeddings if provided
        if (documents[0]?.embedding) {
            payload.embeddings = documents.map(doc => doc.embedding);
        }
        
        // Include URIs if provided
        if (documents[0]?.uri) {
            payload.uris = documents.map(doc => doc.uri || null);
        }
        
        const response = await axios.post(
            `${CHROMA_API_ROOT}/collections/${collection.id}/upsert`,
            payload
        );
        
        console.log(`Upserted ${documents.length} documents into collection '${collectionName}'.`);
        return response.data;
    } catch (error) {
        console.error("Error upserting documents:", error.response?.data || error.message);
        throw error;
    }
};

// Update existing documents in a collection
export const updateDocuments = async (collectionName, documents) => {
    try {
        console.log("Attempting to update documents in collection:", collectionName);
        
        const collection = await getCollectionByName(collectionName);
        
        // Prepare the payload according to API specification
        const payload = {
            ids: documents.map(doc => doc.id), // IDs are required for updates
            documents: documents.map(doc => doc.document || doc.text || doc.content || null),
            metadatas: documents.map(doc => doc.metadata || null),
        };
        
        // Include embeddings if provided
        if (documents[0]?.embedding) {
            payload.embeddings = documents.map(doc => doc.embedding || null);
        }
        
        // Include URIs if provided
        if (documents[0]?.uri) {
            payload.uris = documents.map(doc => doc.uri || null);
        }
        
        const response = await axios.post(
            `${CHROMA_API_ROOT}/collections/${collection.id}/update`,
            payload
        );
        
        console.log(`Updated ${documents.length} documents in collection '${collectionName}'.`);
        return response.data;
    } catch (error) {
        console.error("Error updating documents:", error.response?.data || error.message);
        throw error;
    }
};

// Query a collection
export const queryCollection = async (collectionName, queryEmbeddings, options = {}) => {
    try {
        console.log("Attempting to query collection:", collectionName);
        
        const collection = await getCollectionByName(collectionName);
        
        const {
            nResults = 5,
            where = null,
            whereDocument = null,
            include = ["documents", "metadatas", "distances"],
            ids = null
        } = options;
        
        const payload = {
            query_embeddings: Array.isArray(queryEmbeddings[0]) ? queryEmbeddings : [queryEmbeddings],
            n_results: nResults,
            include: include
        };
        
        // Add optional filters
        if (where) payload.where = where;
        if (whereDocument) payload.where_document = whereDocument;
        if (ids) payload.ids = ids;
        
        const result = await axios.post(
            `${CHROMA_API_ROOT}/collections/${collection.id}/query`,
            payload
        );
        
        console.log(`Queried collection '${collectionName}', found results.${result}`);
        console.log("this is response data in query collection",result.data);
        return result.data;
    } catch (error) {
        console.error("Error querying collection:", error.response?.data || error.message);
        throw error;
    }
};

// Get documents from a collection
export const getDocuments = async (collectionName, options = {}) => {
    try {
        console.log("Attempting to get documents from collection:", collectionName);
        
        const collection = await getCollectionByName(collectionName);
        
        const {
            ids = null,
            where = null,
            whereDocument = null,
            include = ["documents", "metadatas"],
            limit = null,
            offset = null
        } = options;
        
        const payload = {
            include: include
        };
        
        // Add optional parameters
        if (ids) payload.ids = ids;
        if (where) payload.where = where;
        if (whereDocument) payload.where_document = whereDocument;
        if (limit) payload.limit = limit;
        if (offset) payload.offset = offset;
        
        const response = await axios.post(
            `${CHROMA_API_ROOT}/collections/${collection.id}/get`,
            payload
        );
        
        console.log(`Retrieved documents from collection '${collectionName}'.`);
        return response.data;
    } catch (error) {
        console.error("Error getting documents:", error.response?.data || error.message);
        throw error;
    }
};

// Delete documents from a collection
export const deleteDocuments = async (collectionName, options = {}) => {
    try {
        console.log("Attempting to delete documents from collection:", collectionName);
        
        const collection = await getCollectionByName(collectionName);
        
        const {
            ids = null,
            where = null,
            whereDocument = null
        } = options;
        
        const payload = {};
        
        // Add deletion criteria
        if (ids) payload.ids = ids;
        if (where) payload.where = where;
        if (whereDocument) payload.where_document = whereDocument;
        
        if (!ids && !where && !whereDocument) {
            throw new Error("Must provide at least one deletion criterion: ids, where, or whereDocument");
        }
        
        const response = await axios.post(
            `${CHROMA_API_ROOT}/collections/${collection.id}/delete`,
            payload
        );
        
        console.log(`Deleted documents from collection '${collectionName}'.`);
        return response.data;
    } catch (error) {
        console.error("Error deleting documents:", error.response?.data || error.message);
        throw error;
    }
};

// Get collection info
export const getCollection = async (collectionName) => {
    try {
        console.log("Attempting to get collection info:", collectionName);
        const collection = await getCollectionByName(collectionName);
        console.log(`Retrieved collection '${collectionName}' info.`);
        return collection;
    } catch (error) {
        console.error("Error getting collection:", error.response?.data || error.message);
        throw error;
    }
};

// List all collections
export const listCollections = async (limit = null, offset = null) => {
    try {
        console.log("Attempting to list collections");
        
        let url = `${CHROMA_API_ROOT}/collections`;
        const params = new URLSearchParams();
        
        if (limit) params.append('limit', limit);
        if (offset) params.append('offset', offset);
        
        if (params.toString()) {
            url += `?${params.toString()}`;
        }
        
        const response = await axios.get(url);
        console.log(`Retrieved ${response.data.length} collections.`);
        return response.data;
    } catch (error) {
        console.error("Error listing collections:", error.response?.data || error.message);
        throw error;
    }
};

// Count documents in a collection
export const countDocuments = async (collectionName) => {
    try {
        console.log("Attempting to count documents in collection:", collectionName);
        
        const collection = await getCollectionByName(collectionName);
        const response = await axios.get(`${CHROMA_API_ROOT}/collections/${collection.id}/count`);
        
        console.log(`Collection '${collectionName}' has ${response.data} documents.`);
        return response.data;
    } catch (error) {
        console.error("Error counting documents:", error.response?.data || error.message);
        throw error;
    }
};

// Delete a collection
export const deleteCollection = async (collectionName) => {
    try {
        console.log("Attempting to delete collection:", collectionName);
        
        const collection = await getCollectionByName(collectionName);
        const response = await axios.delete(`${CHROMA_API_ROOT}/collections/${collection.id}`);
        
        console.log(`Collection '${collectionName}' deleted successfully.`);
        return response.data;
    } catch (error) {
        console.error("Error deleting collection:", error.response?.data || error.message);
        throw error;
    }
};

// Update collection metadata or name
export const updateCollection = async (collectionName, updates = {}) => {
    try {
        console.log("Attempting to update collection:", collectionName);
        
        const collection = await getCollectionByName(collectionName);
        
        const payload = {};
        if (updates.name) payload.new_name = updates.name;
        if (updates.metadata) payload.new_metadata = updates.metadata;
        if (updates.configuration) payload.new_configuration = updates.configuration;
        
        const response = await axios.put(
            `${CHROMA_API_ROOT}/collections/${collection.id}`,
            payload
        );
        
        console.log(`Collection '${collectionName}' updated successfully.`);
        return response.data;
    } catch (error) {
        console.error("Error updating collection:", error.response?.data || error.message);
        throw error;
    }
};

// Health check
export const healthCheck = async () => {
    try {
        const response = await axios.get(`${CHROMA_BASE_URL}/api/v2/healthcheck`);
        return response.data;
    } catch (error) {
        console.error("Health check failed:", error.message);
        throw error;
    }
};

// Export all functions
export default {
    createCollection,
    addDocuments,
    upsertDocuments,
    updateDocuments,
    queryCollection,
    getDocuments,
    deleteDocuments,
    getCollection,
    listCollections,
    countDocuments,
    deleteCollection,
    updateCollection,
    healthCheck
};