// utils/chunker.js
export const chunkText = (text, maxLength = 400) => {
    const sentences = text.split(/(?<=[.?!])\s+/);
    const chunks = [];
  
    let currentChunk = "";
  
    for (const sentence of sentences) {
      if ((currentChunk + sentence).length <= maxLength) {
        currentChunk += sentence + " ";
      } else {
        chunks.push(currentChunk.trim());
        currentChunk = sentence + " ";
      }
    }
  
    if (currentChunk) chunks.push(currentChunk.trim());
  
    return chunks;
  };
  