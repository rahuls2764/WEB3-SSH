// routes/vector.routes.js
import express from "express";
import { ingestCourseChunks, queryCourseChunks,getCourseInfo } from "../controllers/vector.controllers.js";

const router = express.Router();

router.post("/ingest", ingestCourseChunks); // POST /api/vector/ingest
router.post("/query", queryCourseChunks);   // POST /api/vector/query
router.get('/courses/info/:courseId', getCourseInfo);

export default router;
