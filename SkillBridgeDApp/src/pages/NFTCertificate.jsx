import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import axios from 'axios';

const NFTCertificate = () => {
  const { cid } = useParams();
  const [metadata, setMetadata] = useState(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const url = `https://gateway.pinata.cloud/ipfs/${cid}`;
        const res = await axios.get(url);
        setMetadata(res.data);
      } catch (err) {
        console.error('Failed to fetch NFT metadata:', err);
      }
    };
    fetchMetadata();
  }, [cid]);

  if (!metadata) {
    return (
      <div className="p-10 text-center text-gray-600">
        <p>Loading certificate...</p>
      </div>
    );
  }

  const course = metadata.attributes?.find(a => a.trait_type === "Course")?.value;
  const score = metadata.attributes?.find(a => a.trait_type === "Score")?.value;
  const name = metadata.attributes?.find(a => a.trait_type === "Name")?.value;
  const date = metadata.attributes?.find(a => a.trait_type === "Date")?.value;
  const imageUrl = `https://gateway.pinata.cloud/ipfs/${metadata.image?.split("ipfs://")[1]}`;
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=https://yourdapp.com/certificate/${cid}`;

  return (
    <div className="max-w-3xl mx-auto p-6 text-center bg-white rounded-xl shadow-md mt-8 border border-gray-200">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">{metadata.name}</h1>
      
      <img
        src={imageUrl}
        alt="Certificate"
        className="w-full rounded-lg shadow-lg mb-6 border border-gray-300"
      />

      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 text-left text-gray-800">
        <p><strong>Recipient:</strong> {name}</p>
        <p><strong>Course:</strong> {course}</p>
        <p><strong>Score:</strong> {score}</p>
        <p><strong>Date:</strong> {new Date(date).toLocaleDateString()}</p>
        <p className="mt-2 text-gray-600">{metadata.description}</p>
      </div>

      <a
        href={linkedinShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
      >
        <ExternalLink size={18} />
        Share on LinkedIn
      </a>
    </div>
  );
};

export default NFTCertificate;
