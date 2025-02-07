#!/usr/bin/env node

const { program } = require('commander');
const { startConversation } = require('../src/conversation');

program
  .name('aethera')
  .description('AI-powered voice conversation CLI tool')
  .version('1.0.0')
  .action(startConversation);

program.parse(process.argv); 