const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function checkModels() {
    const apiKey = process.env.GEMINI_API_KEY.split(',')[0];
    const genAI = new GoogleGenerativeAI(apiKey);
    
    try {
        const result = await genAI.listModels();
        console.log("Available models:");
        result.models.forEach(m => console.log(`- ${m.name} (Methods: ${m.supportedGenerationMethods})`));
    } catch (error) {
        console.error("Error listing models:", error.message);
    }
}

checkModels();
