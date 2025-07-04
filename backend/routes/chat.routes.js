import express from 'express';
import { handleCourseChat } from '../controllers/chat.controllers.js';

const router = express.Router();

router.post('/:courseId/ask', handleCourseChat);

export default router;
