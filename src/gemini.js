// Import Google Generative AI SDK
import { GoogleGenerativeAI } from "@google/generative-ai";
import { API_KEY_Gemini } from  './assets/configAPI';


const apiKey2 = API_KEY_Gemini;
// Initialize the Google Generative AI SDK with the provided API key
const genAI = new GoogleGenerativeAI(apiKey2);

// Function to search Gemini AI with a prompt
const searchPrompt = async (input) => {
  let result;
  if (input && input.trim()) {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    result = await model.generateContentStream([`r ${input}`]);
  }

  let responseText = '';
  if (result) {
    for await (const chunk of result.stream) {
      responseText += chunk.text();
    }
  }

  return responseText;
};

export default searchPrompt;
