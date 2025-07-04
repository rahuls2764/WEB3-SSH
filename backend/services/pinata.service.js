import pinataSDK from '@pinata/sdk';
import dotenv from 'dotenv';
import { Readable } from 'stream';

dotenv.config();

const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_JWT });

// Utility to convert Buffer to Readable stream
const bufferToStream = (buffer) => {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
};

export default {
  async uploadFile(buffer, filename) {
    const readableStream = bufferToStream(buffer);
    const options = {
      pinataMetadata: { name: filename },
      pinataOptions: { cidVersion: 0 }
    };
    const result = await pinata.pinFileToIPFS(readableStream, options);
    return result.IpfsHash;
  },

  async uploadText(text, filename) {
    const options = {
      pinataMetadata: { name: filename },
      pinataOptions: { cidVersion: 0 }
    };
    const buffer = Buffer.from(text, 'utf-8');
    const readableStream = bufferToStream(buffer);
    const result = await pinata.pinFileToIPFS(readableStream, options);
    return result.IpfsHash;
  },

  async uploadJSON(data, filename) {
    const options = {
      pinataMetadata: { name: filename },
      pinataOptions: { cidVersion: 0 }
    };
    const result = await pinata.pinJSONToIPFS(data, options);
    return result.IpfsHash;
  }
};
