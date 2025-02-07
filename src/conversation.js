const { exec } = require('child_process');
const util = require('util');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const execPromise = util.promisify(exec);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function startConversation() {
  console.log('🎙️  Aethera is listening... (Press Ctrl+C to exit)');
  
  // For now, let's use console input instead of audio recording
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  while (true) {
    const text = await new Promise(resolve => {
      readline.question('You: ', resolve);
    });
    
    // Get AI response
    const response = await getAIResponse(text);
    console.log('Aethera:', response);
    
    // Convert response to speech and play it
    await textToSpeechAndPlay(response);
  }
}

async function getAIResponse(text) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const result = await model.generateContent(text);
  const response = await result.response;
  return response.text();
}

async function textToSpeechAndPlay(text) {
  try {
    // Escape single quotes in the text to prevent PowerShell command breaking
    const escapedText = text.replace(/'/g, "''");
    const command = `powershell -c "Add-Type -AssemblyName System.Speech; (New-Object System.Speech.Synthesis.SpeechSynthesizer).Speak('${escapedText}')"`;
    await execPromise(command);
  } catch (error) {
    console.error('Error playing speech:', error.message);
    console.log('Text that should have been spoken:', text);
  }
}

module.exports = { startConversation }; 