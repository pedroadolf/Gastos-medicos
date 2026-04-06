const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: 'apps/web/.env.local' });

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

async function run() {
  try {
    const fetch = require('node-fetch'); // Use fetch to call the list endpoint directly if needed
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_GENERATIVE_AI_API_KEY}`);
    const data = await response.json();
    console.log("MODELS:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("ERROR:", e.message);
  }
}
run();
