const { exec } = require('child_process');
const util = require('util');
const fs = require('fs').promises;
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const execPromise = util.promisify(exec);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function startConversation() {
  console.log('🎙️  Aethera is listening... (Press Ctrl+C to exit)');
  
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  while (true) {
    const text = await new Promise(resolve => {
      readline.question('You: ', resolve);
    });
    
    const response = await getAIResponse(text);
    console.log('Aethera:', response);
    
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
    const tempDir = path.join(process.env.TEMP || process.env.TMP || '.');
    const vbsPath = path.join(tempDir, 'speak.vbs');
    
    // Clean the text: replace newlines with spaces and escape quotes
    const cleanText = text
      .replace(/\n/g, ' ')  // Replace newlines with spaces
      .replace(/"/g, '""')  // Double up quotes for VBScript
      .replace(/[^\x20-\x7E]/g, ''); // Remove any other special characters
    
    // VBScript for faster TTS
    const vbsContent = `
      Set speech = CreateObject("SAPI.SpVoice")
      speech.Rate = 1
      speech.Volume = 100
      speech.Speak "${cleanText}"
    `;

    await fs.writeFile(vbsPath, vbsContent);
    await execPromise(`cscript //nologo "${vbsPath}"`);
    await fs.unlink(vbsPath);
  } catch (error) {
    console.error('Error playing speech:', error.message);
    console.log('Text that should have been spoken:', text);
  }
}

module.exports = { startConversation }; 