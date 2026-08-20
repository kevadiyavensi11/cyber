const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const listModels = async () => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 
    // The SDK doesn't have a direct listModels in the main GenAI class usually, it's often a separate call or part of the specific service
    
    // Let's try to just run a simple prompt with gemini-1.5-flash-001 or 002
    const response = await model.generateContent("test");
    console.log("Success with gemini-1.5-flash:", response.response.text());
  } catch (error) {
    console.error("Failed with gemini-1.5-flash:", error.message);
  }
};

listModels();
