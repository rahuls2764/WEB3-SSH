// routes/ipfsUpload.js
import express from 'express';
import {
  uploadCourseToIPFS,
  multerUpload,
  uploadUserProfileToIPFS,
  uploadCertificateToIPFS
} from '../controllers/ipfsUpload.controllers.js';

const router = express.Router();

router.post('/course', multerUpload, uploadCourseToIPFS);
router.post('/uploadQuizResult', uploadCertificateToIPFS);
router.post('/profile',multerUpload, uploadUserProfileToIPFS);

export default router;
