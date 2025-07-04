import axios from "axios";

export const generateCertificateImage = async (quizResult) => {
  const html = `
    <html>
      <head>
        <style>
          body { font-family: Arial; text-align: center; padding: 40px; background: #fff; }
          h1 { color: #4b6cb7; }
          p { font-size: 18px; }
          .cert { border: 8px solid #4b6cb7; padding: 40px; border-radius: 20px; }
        </style>
      </head>
      <body>
        <div class="cert">
          <h1>SkillBridge Certificate of Completion</h1>
          <p>This certifies that</p>
          <h2>${quizResult.userName}</h2>
          <p>${quizResult.userAddress}</p>
          <p>has successfully completed</p>
          <h3>${quizResult.courseTitle}</h3>
          <p>with a score of ${quizResult.score}/${quizResult.total} (${quizResult.percentage.toFixed(1)}%)</p>
          <p>Date: ${new Date(quizResult.completedAt).toDateString()}</p>
        </div>
      </body>
    </html>
  `;

  // HCTI API credentials
  const HCTI_USER_ID = process.env.HCTI_USER_ID;
const HCTI_API_KEY = process.env.HCTI_API_KEY;


  try {
    const response = await axios.post(
      "https://hcti.io/v1/image",
      { html },
      {
        auth: {
          username: HCTI_USER_ID,
          password: HCTI_API_KEY,
        },
      }
    );

    const imageUrl = response.data.url;

    // Now fetch image as buffer to upload to Pinata
    const imageRes = await axios.get(imageUrl, { responseType: "arraybuffer" });
    // console.log("this is image response",imageRes);
    return imageRes.data;
  } catch (err) {
    console.error("❌ Failed to generate image from HCTI:", err);
    throw err;
  }
};
