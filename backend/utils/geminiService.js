const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

/**
 * Sentinel AI Production-Ready Integration
 * Features: Multi-Key Rotation, High-Performance Fallback, Structured Error Mapping, 
 * Dynamic MIME detection, Safety Filter Overrides, and Request Timeouts.
 */
const analyzeThreatImage = async (imagePath, threatType, description) => {
    // 1. Unified Key Management
    const apiKeyString = process.env.GEMINI_API_KEY || "";
    const apiKeys = apiKeyString.split(",").map(k => k.trim()).filter(Boolean);

    if (apiKeys.length === 0) {
        console.error("❌ [AI] No valid API Key found. Fix GEMINI_API_KEY in .env");
        return null;
    }

    // 2. High-Performance Model Strategy
    // Primary: User's Gemini 2.5 Flash, Fallbacks: Pro 1.5, Flash 1.5, 2.0 Exp
    const MODELS = ["gemini-2.5-flash", "gemini-1.5-pro", "gemini-1.5-flash", "gemini-2.0-flash-exp", "gemini-pro-vision"]; 
    const REQUEST_TIMEOUT_MS = 25000; 

    // Safety Settings to allow analysis of threat evidence without false-positive blocks
    const safetySettings = [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ];

    const getMimeType = (filePath) => {
        const ext = path.extname(filePath).toLowerCase();
        const types = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' };
        return types[ext] || 'image/jpeg';
    };

    let imageData;
    try {
        imageData = Buffer.from(fs.readFileSync(imagePath)).toString("base64");
    } catch (err) {
        console.error("❌ [AI] File Read Error:", err.message);
        return null;
    }
    const mimeType = getMimeType(imagePath);

    // 3. Resilient Execution Loop
    for (let keyIdx = 0; keyIdx < apiKeys.length; keyIdx++) {
        const currentKey = apiKeys[keyIdx];
        
        for (const modelId of MODELS) {
            let delay = 2000; 

            for (let attempt = 1; attempt <= 2; attempt++) {
                try {
                    console.log(`[AI] Routing [Key:${keyIdx + 1}] -> [Model:${modelId}] [Attempt:${attempt}]`);

                    const genAI = new GoogleGenerativeAI(currentKey);
                    const model = genAI.getGenerativeModel({ model: modelId, safetySettings });

                    const imagePart = {
                        inlineData: { data: imageData, mimeType }
                    };

                    const prompt = `Strictly validate image for cyber-threat category: ${threatType}. 
                    Evidence Context: ${description || 'No detailed evidence context provided'}.
                    You are a specialist. Return JSON ONLY: {"valid": boolean, "detected_category": string, "confidence": number, "reason": string}`;

                    const timeoutPromise = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('AI_TIMEOUT')), REQUEST_TIMEOUT_MS)
                    );

                    const result = await Promise.race([
                        model.generateContent([prompt, imagePart]),
                        timeoutPromise
                    ]);

                    const response = await result.response;
                    
                    // Handle Safety Blocking
                    const candidate = response.candidates?.[0];
                    if (candidate?.finishReason === 'SAFETY') {
                        console.warn(`⚠️ [AI] Safety Filter Block [Key:${keyIdx+1}|Mod:${modelId}]. Switching...`);
                        break; 
                    }

                    const text = await response.text();
                    const jsonMatch = text.match(/\{[\s\S]*\}/);

                    if (jsonMatch) {
                        try {
                            const parsedJson = JSON.parse(jsonMatch[0]);
                            console.log(`✅ [AI] Key ${keyIdx + 1} Success (${modelId}): ${parsedJson.valid ? 'Verified' : 'Anomaly'}`);
                            return {
                                isValid: !!parsedJson.valid,
                                detectedThreat: String(parsedJson.detected_category || 'Unknown'),
                                confidence: Number(parsedJson.confidence || 0),
                                summary: String(parsedJson.reason || 'No summary')
                            };
                        } catch (e) {
                            console.error("❌ [AI] JSON Parse failed. Retrying...");
                        }
                    }
                } catch (error) {
                    const statusCode = error.status || error.response?.status || 0;
                    const errorMsg = (error.message || "").toLowerCase();

                    const isQuotaError = statusCode === 429 || errorMsg.includes("quota") || errorMsg.includes("429");
                    const isRetryable = statusCode === 503 || statusCode === 504 || errorMsg.includes("timeout");

                    if (isQuotaError) {
                        console.warn(`⚠️ [AI] Quota hit for Key ${keyIdx + 1} on ${modelId}. Failover...`);
                        break; 
                    }

                    if (isRetryable && attempt < 2) {
                        await new Promise(r => setTimeout(r, delay));
                        delay *= 2;
                        continue;
                    }

                    console.error(`❌ [AI] Error [Key:${keyIdx+1}|Mod:${modelId}]: ${error.message}`);
                    break; 
                }
            }
        }
    }

    console.error("🚫 [AI] Critical Failure: All models and keys failed.");
    return null;
};

module.exports = { analyzeThreatImage };
