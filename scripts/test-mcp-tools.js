#!/usr/bin/env node

/**
 * MCP ツールのテストスクリプト
 * 使い方: node scripts/test-mcp-tools.js
 */

import { spawn } from 'child_process';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// MCPサーバープロセスを起動
console.log('Starting MCP server...');
const mcpProcess = spawn('node', ['dist/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
});

// サーバーの出力を監視
mcpProcess.stdout.on('data', (data) => {
    console.log(`[MCP Server]: ${data.toString().trim()}`);
});

mcpProcess.stderr.on('data', (data) => {
    console.error(`[MCP Error]: ${data.toString().trim()}`);
});

// サーバーが準備できるまで待機
setTimeout(() => {
    console.log('\n=== MCP Test Tool ===');
    console.log('Commands:');
    console.log('1. Send text message');
    console.log('2. Send embed message');
    console.log('3. Test error handling');
    console.log('4. Exit');
    console.log('==================\n');
    
    promptUser();
}, 3000);

function promptUser() {
    rl.question('Select command (1-4): ', (answer) => {
        switch(answer.trim()) {
            case '1':
                testTextMessage();
                break;
            case '2':
                testEmbedMessage();
                break;
            case '3':
                testErrorHandling();
                break;
            case '4':
                console.log('Exiting...');
                mcpProcess.kill();
                rl.close();
                process.exit(0);
                break;
            default:
                console.log('Invalid option. Please try again.');
                promptUser();
        }
    });
}

function testTextMessage() {
    console.log('\nTesting text message...');
    // 実際のMCP通信をシミュレート
    const request = {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
            name: 'send_discord_message',
            arguments: {
                content: `Test message from MCP tools script - ${new Date().toISOString()}`
            }
        }
    };
    
    console.log('Request:', JSON.stringify(request, null, 2));
    console.log('Note: In real usage, this would be sent via stdio to the MCP server\n');
    
    setTimeout(promptUser, 1000);
}

function testEmbedMessage() {
    console.log('\nTesting embed message...');
    const request = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
            name: 'send_discord_embed',
            arguments: {
                title: 'Test Embed',
                description: 'This is a test embed from the MCP tools script',
                color: 0x00ff00,
                fields: [
                    {
                        name: 'Test Field 1',
                        value: 'Test Value 1',
                        inline: true
                    },
                    {
                        name: 'Timestamp',
                        value: new Date().toISOString(),
                        inline: true
                    }
                ]
            }
        }
    };
    
    console.log('Request:', JSON.stringify(request, null, 2));
    console.log('Note: In real usage, this would be sent via stdio to the MCP server\n');
    
    setTimeout(promptUser, 1000);
}

function testErrorHandling() {
    console.log('\nTesting error handling...');
    const request = {
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
            name: 'send_discord_message',
            arguments: {} // Missing required 'content' parameter
        }
    };
    
    console.log('Request (with missing parameter):', JSON.stringify(request, null, 2));
    console.log('Expected: Error response about missing content parameter\n');
    
    setTimeout(promptUser, 1000);
}

// プロセス終了時のクリーンアップ
process.on('SIGINT', () => {
    console.log('\nCleaning up...');
    mcpProcess.kill();
    rl.close();
    process.exit(0);
});