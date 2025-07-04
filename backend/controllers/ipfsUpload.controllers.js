// controllers/ipfsUpload.controller.js
import pinata from '../services/pinata.service.js';
import multer from 'multer';
import { generateCertificateImage } from '../utils/certificateImage.js';
const upload = multer(); // For parsing multipart/form-data (used in video, thumbnail uploads)

import { chunkCourseForVector } from '../utils/chunkCourse.js';
import { uploadCourseChunks } from '../services/vector.service.js';

export const uploadCourseToIPFS = async (req, res) => {
  try {
    const {
      title,
      category,
      difficulty,
      price,
      duration,
      description,
      prerequisites,
      learningOutcomes,
      quiz
    } = JSON.parse(req.body.metadata); // metadata is JSON string

    const files = req.files;
    const videoFile = files?.videoFile?.[0];
    const thumbnail = files?.thumbnail?.[0];

    const videoCid = videoFile
      ? await pinata.uploadFile(videoFile.buffer, videoFile.originalname)
      : '';
    const thumbnailCid = thumbnail
      ? await pinata.uploadFile(thumbnail.buffer, thumbnail.originalname)
      : '';

    const descriptionCid = await pinata.uploadText(description, `description_${Date.now()}.txt`);
    const prerequisitesCid = await pinata.uploadText(prerequisites.join('\n'), `prerequisites_${Date.now()}.txt`);
    const outcomesCid = await pinata.uploadText(learningOutcomes.join('\n'), `outcomes_${Date.now()}.txt`);
    const quizCid = await pinata.uploadJSON(quiz, `quiz_${Date.now()}.json`);

    const metadata = {
      title,
      category,
      difficulty,
      price,
      duration,
      videoCid,
      thumbnailCid,
      descriptionCid,
      prerequisitesCid,
      learningOutcomesCid: outcomesCid,
      quizCid
    };

    const metadataCid = await pinata.uploadJSON(metadata, `course_metadata_${Date.now()}.json`);

    // 🧠 Step 2: Chunk and embed course content to vector DB
    const chunks = chunkCourseForVector({
      title,
      description,
      prerequisites,
      learningOutcomes,
      syllabus: [], // optionally pass syllabus too
    });

    // Use metadataCid as unique course ID in vector DB
    await uploadCourseChunks(metadataCid, chunks);

    return res.json({ metadataCid });
  } catch (err) {
    console.error('Upload course error:', err);
    res.status(500).json({ error: 'Failed to upload course content to IPFS or vector DB' });
  }
};




export const uploadCertificateToIPFS = async (req, res) => {
  try {
    const quizResult = req.body;

    const imageBuffer = await generateCertificateImage(quizResult);
    const imageCid = await pinata.uploadFile(imageBuffer, `certificate_${quizResult.userAddress}.png`);

    const metadata = {
      name: `SkillBridge Certificate - ${quizResult.courseTitle}`,
      description: `Awarded to ${quizResult.userName} for scoring ${quizResult.percentage}%`,
      image: `ipfs://${imageCid}`,
      userAddress:quizResult.userAddress,
      attributes: [
        { trait_type: 'Name', value: quizResult.userName },
        { trait_type: 'Score', value: `${quizResult.score}/${quizResult.total}` },
        { trait_type: 'Percentage', value: `${quizResult.percentage.toFixed(1)}%` },
        { trait_type: 'Course', value: quizResult.courseTitle },
        { trait_type: 'Date', value: quizResult.completedAt },
      ],
    };
    console.log("this is metadata",metadata);
   
    const metadataCid = await pinata.uploadJSON(metadata, `certificate_metadata_${quizResult.userAddress}.json`);
    return res.json({ resultCid: metadataCid });
  } catch (err) {
    console.error("Certificate generation error:", err);
    res.status(500).json({ error: "Certificate generation failed" });
  }
};

// controllers/ipfsUpload.controller.js
export const uploadUserProfileToIPFS = async (req, res) => {
  try {
    const avatarFile = req.files?.userAvatar?.[0];
    const { metadata: rawMetadata } = req.body;

    if (!rawMetadata) {
      return res.status(400).json({ error: "Missing metadata field" });
    }

    const metadata = JSON.parse(rawMetadata); // Parse userName, email, bio, skills, city
    let avatarCid = "";

    if (avatarFile) {
      // Upload avatar image to IPFS
      avatarCid = await pinata.uploadFile(avatarFile.buffer, avatarFile.originalname);
    }

    const finalMetadata = {
      ...metadata,
      avatarCid,
      updatedAt: new Date().toISOString()
    };

    // Upload final profile metadata JSON to IPFS
    const metadataCid = await pinata.uploadJSON(finalMetadata, `user_profile_${Date.now()}.json`);

    return res.json({ metadataCid });
  } catch (err) {
    console.error("Upload profile error:", err);
    res.status(500).json({ error: "Failed to upload profile to IPFS" });
  }
};

export const multerUpload = upload.fields([
  { name: 'videoFile', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 },
  { name: 'userAvatar', maxCount: 1 } // Added for profile avatar

]);
