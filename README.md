# Aethera - AI-Powered CLI Assistant

![Aethera Banner](image.png)

Aethera is an intelligent CLI assistant powered by Google's Gemini AI that provides natural text-to-speech conversations right from your terminal.

## Features

- 🤖 Powered by Google's Gemini AI for intelligent responses
- 🗣️ Text-to-speech using Windows SAPI voices
- 🎭 Multiple voice options
- 🎨 Beautiful CLI interface with animations
- ⚡ Easy setup and configuration

## Installation

```bash
npm install -g aethera
```

## Prerequisites

1. Windows OS (for text-to-speech functionality)
2. Node.js v14 or higher
3. A Gemini API key from Google AI Studio

## Getting Started

1. Install the package globally:
```bash
npm install -g aethera
```

2. Run Aethera:
```bash
aethera
```

On first run, you'll be prompted to:
1. Enter your Gemini API key
2. Select your preferred voice from available system voices

## Configuration

The app creates a `.env` file to store your Gemini API key. You can modify this file manually if needed:

```env
GEMINI_API_KEY=your_api_key_here
```

## Usage


```128:133:src/conversation.js
  while (true) {
    const text = await new Promise(resolve => {
      process.stdout.write('\r' + chalk.cyan(LISTENING_ANIMATION[animationFrame] + ' Listening...'));
      animationFrame = (animationFrame + 1) % LISTENING_ANIMATION.length;
      
      readline.question('\n' + chalk.gr
```


- Type your message and press Enter to send
- Press Ctrl+C to exit the conversation

## Voice Selection

Aethera uses Windows SAPI voices for text-to-speech. Available voices typically include:
- Microsoft David (male voice)
- Microsoft Zira (female voice)
- Any other SAPI voices installed on your system

## Development

1. Clone the repository:
```bash
git clone https://github.com/onesmuskipchumba0/aethera.git
```

2. Install dependencies:
```bash
cd aethera
npm install
```

3. Create a `.env` file with your Gemini API key:
```env
GEMINI_API_KEY=your_api_key_here
```

4. Run in development mode:
```bash
node bin/aethera.js
```

## Project Structure

```
aethera/
├── bin/
│   └── aethera.js      # CLI entry point
├── src/
│   └── conversation.js  # Core functionality
├── .env                # Configuration file
├── .gitignore
└── package.json
```

## Dependencies


```15:22:package.json
  "dependencies": {
    "@google/generative-ai": "^0.21.0",
    "commander": "^13.1.0",
    "dotenv": "^16.4.7",
    "figlet": "^1.7.0",
    "chalk": "^4.1.2",
    "assemblyai": "^4.0.0"
  }
```


## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Acknowledgments

- Google Gemini AI for powering the conversations
- Windows SAPI for text-to-speech capabilities
- The Node.js community for amazing packages

---

Made with ❤️ by [Your Name]
