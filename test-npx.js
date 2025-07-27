#!/usr/bin/env node
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Testing local execution...');
const localTest = spawn('node', [join(__dirname, 'dist', 'index.js')], {
  stdio: 'inherit',
  env: { ...process.env }
});

localTest.on('error', (err) => {
  console.error('Local execution error:', err);
});

localTest.on('close', (code) => {
  console.log(`Local execution exited with code ${code}`);
  
  if (code === 0 || code === null) {
    console.log('\nTesting npx execution...');
    const npxTest = spawn('npx', ['discord-interface-mcp'], {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env }
    });
    
    npxTest.on('error', (err) => {
      console.error('NPX execution error:', err);
    });
    
    npxTest.on('close', (npxCode) => {
      console.log(`NPX execution exited with code ${npxCode}`);
    });
  }
});