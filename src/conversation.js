const { exec } = require('child_process');
const util = require('util');
const fs = require('fs').promises;
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const figlet = require('figlet');
const chalk = require('chalk');
require('dotenv').config();

const execPromise = util.promisify(exec);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const LISTENING_ANIMATION = ['◜', '◠', '◝', '◞', '◡', '◟'];
let animationFrame = 0;

async function startConversation() {
  // Clear screen
  console.clear();
  
  // Generate ASCII art using figlet
  console.log(chalk.cyan(
    figlet.textSync('AETHERA', {
      font: 'Big',
      horizontalLayout: 'default',
      verticalLayout: 'default'
    })
  ));
  
  console.log(chalk.yellow('Welcome to Aethera - Your AI Assistant'));
  console.log(chalk.gray('Press Ctrl+C to exit\n'));
  
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  while (true) {
    const text = await new Promise(resolve => {
      process.stdout.write('\r' + chalk.cyan(LISTENING_ANIMATION[animationFrame] + ' Listening...'));
      animationFrame = (animationFrame + 1) % LISTENING_ANIMATION.length;
      
      readline.question('\n' + chalk.green('You: '), resolve);
    });
    
    // Clear the animation line
    process.stdout.write('\r' + ' '.repeat(20) + '\r');
    
    console.log(chalk.gray('⋮ Thinking...'));
    const response = await getAIResponse(text);
    
    // Format the response with a nice border
    console.log(chalk.magenta('┌─ Aethera ───────────────────'));
    console.log(chalk.magenta('│') + ' ' + response.split('\n').join('\n' + chalk.magenta('│') + ' '));
    console.log(chalk.magenta('└────────────────────────────\n'));
    
    await textToSpeechAndPlay(response);
  }
}

async function getAIResponse(text) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const result = await model.generateContent(text);
  const response = await result.response;
  return stripMarkdown(response.text());
}

function stripMarkdown(text) {
  return text
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code
    .replace(/`[^`]*`/g, '')
    // Remove bold/italic
    .replace(/\*\*?(.*?)\*\*?/g, '$1')
    // Remove links
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    // Remove headers
    .replace(/#{1,6}\s/g, '')
    // Remove bullet points
    .replace(/^\s*[-*+]\s/gm, '')
    // Remove numbered lists
    .replace(/^\s*\d+\.\s/gm, '')
    // Remove blockquotes
    .replace(/^\s*>\s/gm, '')
    // Remove horizontal rules
    .replace(/^\s*[-*_]{3,}\s*$/gm, '')
    // Clean up extra whitespace
    .replace(/\n\s*\n/g, '\n')
    .trim();
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