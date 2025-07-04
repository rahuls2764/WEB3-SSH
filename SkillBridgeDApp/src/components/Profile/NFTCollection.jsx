import React from 'react';
import { Award, ExternalLink } from 'lucide-react';
import { Link } from "react-router-dom";

export default function NFTCollection({ nfts = [] }) {
  if (!nfts.length) return null;

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-purple-600">
        <Award /> NFT Certificates
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {nfts.map((nft, index) => {
  const ipfsUrl = nft.uri.includes('ipfs/')
    ? `https://gateway.pinata.cloud/ipfs/${nft.uri.split('ipfs/')[1]}`
    : `https://gateway.pinata.cloud/ipfs/${nft.uri}`;

  const uniqueKey = nft.tokenId || nft.uri || index; // fallback to something unique

  return (
    <div key={uniqueKey} className="bg-white border border-purple-200 rounded-xl p-4 shadow hover:shadow-lg transition">
      <h3 className="text-lg font-semibold text-gray-800">{nft.name || 'SkillBridge Certificate'}</h3>
      <p className="text-gray-500">{nft.course}</p>
      <p className="text-sm text-gray-400">
        Earned: {nft.date !== 'Invalid Date' ? nft.date : 'Date Unavailable'}
      </p>
      <Link
        to={`/certificate/${nft.uri.includes('ipfs/') ? nft.uri.split('ipfs/')[1] : nft.uri}`}
        className="mt-3 inline-flex items-center gap-2 text-sm bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
      >
        <ExternalLink size={14} /> View
      </Link>
    </div>
  );
})}

      </div>
    </div>
  );
}
