const { exec } = require('child_process');
const util = require('util');
const fs = require('fs').promises;
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const figlet = require('figlet');
const chalk = require('chalk');
require('dotenv').config();

const execPromise = util.promisify(exec);
let genAI;

const LISTENING_ANIMATION = ['◜', '◠', '◝', '◞', '◡', '◟'];
let animationFrame = 0;

async function checkAndSetupEnv() {
  try {
    await fs.access('.env');
    require('dotenv').config();
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  } catch (error) {
    console.clear();
    console.log(chalk.cyan(
      figlet.textSync('AETHERA', {
        font: 'Big',
        horizontalLayout: 'default',
        verticalLayout: 'default'
      })
    ));
    
    console.log(chalk.yellow('\nWelcome to Aethera! Let\'s set up your configuration.'));
    
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const apiKey = await new Promise(resolve => {
      readline.question(chalk.green('\nPlease enter your Gemini API key: '), resolve);
    });

    const envContent = `GEMINI_API_KEY=${apiKey}`;
    await fs.writeFile('.env', envContent);
    
    console.log(chalk.green('\nConfiguration saved successfully!'));
    readline.close();
    
    require('dotenv').config();
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
}

async function listVoices() {
  const tempDir = path.join(process.env.TEMP || process.env.TMP || '.');
  const vbsPath = path.join(tempDir, 'listVoices.vbs');
  
  const vbsContent = `
    Set speech = CreateObject("SAPI.SpVoice")
    For Each voice in speech.GetVoices
      WScript.Echo voice.GetDescription
    Next
  `;

  await fs.writeFile(vbsPath, vbsContent);
  const { stdout } = await execPromise(`cscript //nologo "${vbsPath}"`);
  await fs.unlink(vbsPath);
  return stdout.split('\n').filter(Boolean);
}

async function textToSpeech(text, voiceIndex = 0) {
  try {
    const tempDir = path.join(process.env.TEMP || process.env.TMP || '.');
    const vbsPath = path.join(tempDir, 'speak.vbs');
    
    const cleanText = text
      .replace(/\n/g, ' ')
      .replace(/"/g, '""')
      .replace(/[^\x20-\x7E]/g, '');
    
    const vbsContent = `
      Set speech = CreateObject("SAPI.SpVoice")
      Set speech.Voice = speech.GetVoices.Item(${voiceIndex})
      speech.Rate = 1
      speech.Volume = 100
      speech.Speak "${cleanText}"
    `;

    await fs.writeFile(vbsPath, vbsContent);
    await execPromise(`cscript //nologo "${vbsPath}"`);
    await fs.unlink(vbsPath);
  } catch (error) {
    console.error('Text-to-speech error:', error);
    console.log('Text that should have been spoken:', text);
  }
}

async function startConversation() {
  await checkAndSetupEnv();
  
  console.clear();
  console.log(chalk.cyan(
    figlet.textSync('AETHERA', {
      font: 'Big',
      horizontalLayout: 'default',
      verticalLayout: 'default'
    })
  ));
  
  // List available voices
  const voices = await listVoices();
  console.log(chalk.yellow('\nAvailable voices:'));
  voices.forEach((voice, index) => {
    console.log(chalk.gray(`${index}: ${voice}`));
  });
  
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const voiceIndex = await new Promise(resolve => {
    readline.question(chalk.yellow('\nSelect a voice number (0-' + (voices.length-1) + '): '), resolve);
  });

  console.log(chalk.yellow('\nWelcome to Aethera - Your AI Assistant'));
  console.log(chalk.gray('Press Ctrl+C to exit\n'));

  while (true) {
    const text = await new Promise(resolve => {
      process.stdout.write('\r' + chalk.cyan(LISTENING_ANIMATION[animationFrame] + ' Listening...'));
      animationFrame = (animationFrame + 1) % LISTENING_ANIMATION.length;
      
      readline.question('\n' + chalk.green('You: '), resolve);
    });
    
    process.stdout.write('\r' + ' '.repeat(20) + '\r');
    
    console.log(chalk.gray('⋮ Thinking...'));
    const response = await getAIResponse(text);
    
    console.log(chalk.magenta('┌─ Aethera ───────────────────'));
    console.log(chalk.magenta('│') + ' ' + response.split('\n').join('\n' + chalk.magenta('│') + ' '));
    console.log(chalk.magenta('└────────────────────────────\n'));
    
    await textToSpeech(response, voiceIndex);
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
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, '')
    .replace(/\*\*?(.*?)\*\*?/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .replace(/^\s*[-*+]\s/gm, '')
    .replace(/^\s*\d+\.\s/gm, '')
    .replace(/^\s*>\s/gm, '')
    .replace(/^\s*[-*_]{3,}\s*$/gm, '')
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

module.exports = { startConversation }; 