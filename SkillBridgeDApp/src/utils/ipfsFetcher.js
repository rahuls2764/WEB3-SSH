// src/utils/ipfsFetcher.js
export const fetchTextFromCid = async (cid) => {
    const res = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
    if (!res.ok) throw new Error("Failed to fetch CID content");
    return res.text();
  };
  