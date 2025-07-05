// services/uploadCourseContentToIPFS.js
import axios from 'axios';
import toast from 'react-hot-toast';

export const uploadCourseContentToIPFS = async (courseData, quizData, setUploadProgress) => {
  try {
    toast.loading("Uploading course data...", { id: "ipfs-upload" });
    setUploadProgress(10);

    const formData = new FormData();

    // Append files
    if (courseData.videoFile) formData.append("videoFile", courseData.videoFile);
    if (courseData.thumbnail) formData.append("thumbnail", courseData.thumbnail);

    // Append structured metadata (stringified JSON)
    const metadata = {
      title: courseData.title,
      category: courseData.category,
      difficulty: courseData.difficulty,
      price: courseData.price,
      duration: courseData.duration,
      description: courseData.description,
      prerequisites: courseData.prerequisites,
      learningOutcomes: courseData.learningOutcomes,
      quiz: {
        passingScore: quizData.passingScore,
        timeLimit: quizData.timeLimit,
        questions: quizData.questions.map((q) => ({
          _id: q.id,
          question: q.question,
          options: {
            a: q.options[0],
            b: q.options[1],
            c: q.options[2],
            d: q.options[3],
          },
          answer: String.fromCharCode(97 + q.correctAnswer), // index to a/b/c/d
        })),
      },
    };

    formData.append("metadata", JSON.stringify(metadata));

    // Send to backend
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/ipfs/course`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        },
      }
    );

    toast.success("Uploaded to IPFS!", { id: "ipfs-upload" });
    return response.data.metadataCid;
  } catch (err) {
    console.error("Upload to IPFS failed:", err);
    toast.error("Upload failed. Check logs.", { id: "ipfs-upload" });
    throw err;
  }
};

// src/services/IpfsUploadService.js
export const uploadProfileDetailsToIPFS = async ({ profileData }) => {
  const formData = new FormData();
  if (profileData.userAvatar) {
    formData.append("userAvatar", profileData.userAvatar);
  }
  console.log("this isprofile data",profileData);
  const metadata = {
    userName: profileData.userName,
    email: profileData.email,
    bio: profileData.bio,
    skills: profileData.skills,
    city: profileData.city,
  };

  formData.append("metadata", JSON.stringify(metadata));

  const res = await axios.post(
    `${import.meta.env.VITE_BACKEND_URL}/api/ipfs/profile`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  console.log("this is cid of profile data while uploading",res.data.metadataCid);

  return res.data.metadataCid;
};

export const uploadCourseResult=async({quizResult})=>{
  const result = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/ipfs/uploadQuizResult`, quizResult);
  console.log("response from bakcned",result);
  return result.data.resultCid;
}