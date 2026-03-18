import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const listModels = async () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('No API key found in .env');
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    // We'll try to list models using the v1 API if possible, or usually the SDK handles this
    // Using a simple fetch or the SDK method if available. 
    // In @google/generative-ai, there isn't a direct listModels but we can try common names.
    
    console.log('Testing common model names...');
    const modelsToTest = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-pro', 'gemini-1.0-pro'];
    
    for (const modelName of modelsToTest) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Hi');
        console.log(`✅ ${modelName}: Success`);
      } catch (err) {
        console.log(`❌ ${modelName}: Failed - ${err.message}`);
      }
    }
  } catch (error) {
    console.error('Global Error:', error);
  }
};

listModels();
