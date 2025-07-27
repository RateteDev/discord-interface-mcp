#!/usr/bin/env node

/**
 * Enhanced MCP Tools Test Script
 * Tests all available tools with comprehensive examples including multilingual support
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test environment variables
const testEnv = {
    NODE_ENV: 'test',
    DISCORD_BOT_TOKEN: 'test-token-for-mcp-inspector',
    DISCORD_GUILD_ID: 'test-guild-123456',
    DISCORD_TEXT_CHANNEL_ID: 'test-channel-789012'
};

// MCP requests to test
const testRequests = [
    {
        name: "Initialize MCP Server",
        request: {
            jsonrpc: "2.0",
            id: 1,
            method: "initialize",
            params: {
                protocolVersion: "2024-11-05",
                capabilities: {
                    tools: {}
                },
                clientInfo: {
                    name: "mcp-inspector-test",
                    version: "1.0.0"
                }
            }
        }
    },
    {
        name: "List Available Tools",
        request: {
            jsonrpc: "2.0",
            id: 2,
            method: "tools/list"
        }
    },
    {
        name: "Test send_discord_embed with CSS Colors",
        request: {
            jsonrpc: "2.0",
            id: 3,
            method: "tools/call",
            params: {
                name: "send_discord_embed",
                arguments: {
                    title: "Color Test",
                    description: "Testing CSS basic 16 colors",
                    color: "red",
                    fields: [
                        { name: "Color", value: "red", inline: true },
                        { name: "Hex Value", value: "#FF0000", inline: true }
                    ]
                }
            }
        }
    },
    {
        name: "Test send_discord_embed_with_feedback - Default Buttons",
        request: {
            jsonrpc: "2.0",
            id: 4,
            method: "tools/call",
            params: {
                name: "send_discord_embed_with_feedback",
                arguments: {
                    title: "Default Feedback Test",
                    description: "Testing default Yes/No buttons",
                    color: "blue",
                    feedbackPrompt: "Do you agree with this test?"
                }
            }
        }
    },
    {
        name: "Test send_discord_embed_with_feedback - Custom English Buttons",
        request: {
            jsonrpc: "2.0",
            id: 5,
            method: "tools/call",
            params: {
                name: "send_discord_embed_with_feedback",
                arguments: {
                    title: "Custom Feedback Test",
                    description: "Testing custom buttons",
                    color: "green",
                    feedbackPrompt: "How would you rate this service?",
                    feedbackButtons: [
                        { label: "Excellent", value: "excellent" },
                        { label: "Good", value: "good" },
                        { label: "Average", value: "average" },
                        { label: "Poor", value: "poor" }
                    ]
                }
            }
        }
    },
    {
        name: "Test send_discord_embed_with_feedback - Multilingual Japanese",
        request: {
            jsonrpc: "2.0",
            id: 6,
            method: "tools/call",
            params: {
                name: "send_discord_embed_with_feedback",
                arguments: {
                    title: "多言語テスト",
                    description: "日本語のフィードバックボタンをテストします",
                    color: "purple",
                    feedbackPrompt: "満足度をお聞かせください",
                    feedbackButtons: [
                        { label: "とても満足", value: "とても満足" },
                        { label: "満足", value: "満足" },
                        { label: "普通", value: "普通" },
                        { label: "不満", value: "不満" }
                    ]
                }
            }
        }
    },
    {
        name: "Test send_discord_embed_with_feedback - Emoji Buttons",
        request: {
            jsonrpc: "2.0",
            id: 7,
            method: "tools/call",
            params: {
                name: "send_discord_embed_with_feedback",
                arguments: {
                    title: "Emoji Feedback Test",
                    description: "Testing emoji buttons",
                    color: "yellow",
                    feedbackPrompt: "How do you feel about this?",
                    feedbackButtons: [
                        { label: "😍 Love it!", value: "love" },
                        { label: "👍 Like it", value: "like" },
                        { label: "😐 Neutral", value: "neutral" },
                        { label: "👎 Dislike", value: "dislike" },
                        { label: "😢 Hate it", value: "hate" }
                    ]
                }
            }
        }
    },
    {
        name: "Test Invalid Color (Should Fail)",
        request: {
            jsonrpc: "2.0",
            id: 8,
            method: "tools/call",
            params: {
                name: "send_discord_embed",
                arguments: {
                    title: "Invalid Color Test",
                    color: "orange" // Invalid CSS basic 16 color
                }
            }
        }
    },
    {
        name: "Test Too Many Buttons (Should Fail)",
        request: {
            jsonrpc: "2.0",
            id: 9,
            method: "tools/call",
            params: {
                name: "send_discord_embed_with_feedback",
                arguments: {
                    title: "Too Many Buttons Test",
                    feedbackButtons: [
                        { label: "1", value: "one" },
                        { label: "2", value: "two" },
                        { label: "3", value: "three" },
                        { label: "4", value: "four" },
                        { label: "5", value: "five" },
                        { label: "6", value: "six" } // 6th button should fail
                    ]
                }
            }
        }
    }
];

async function testMCPServer() {
    console.log('🧪 Enhanced MCP Server Testing with MCP Inspector Compatibility');
    console.log('======================================================\n');

    const serverPath = path.join(__dirname, '..', 'dist', 'index.js');
    
    console.log(`📁 Server Path: ${serverPath}`);
    console.log(`🌍 Environment Variables:`);
    Object.entries(testEnv).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
    });
    console.log('');

    for (const test of testRequests) {
        console.log(`🔍 Testing: ${test.name}`);
        console.log(`📝 Request: ${JSON.stringify(test.request, null, 2)}`);
        
        try {
            const result = await sendMCPRequest(serverPath, test.request, testEnv);
            console.log(`✅ Response: ${JSON.stringify(result, null, 2)}`);
        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
        }
        
        console.log('─'.repeat(80));
        console.log('');
    }
}

function sendMCPRequest(serverPath, request, env) {
    return new Promise((resolve, reject) => {
        const child = spawn('node', [serverPath], {
            env: { ...process.env, ...env },
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let stdout = '';
        let stderr = '';
        let responseReceived = false;

        const timeout = setTimeout(() => {
            if (!responseReceived) {
                child.kill();
                reject(new Error('Request timeout'));
            }
        }, 5000);

        child.stdout.on('data', (data) => {
            stdout += data.toString();
            
            // Try to parse JSON response
            const lines = stdout.split('\n');
            for (const line of lines) {
                if (line.trim()) {
                    try {
                        const response = JSON.parse(line);
                        if (response.jsonrpc === "2.0" && response.id === request.id) {
                            clearTimeout(timeout);
                            responseReceived = true;
                            child.kill();
                            resolve(response);
                            return;
                        }
                    } catch (e) {
                        // Not JSON, continue
                    }
                }
            }
        });

        child.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        child.on('error', (error) => {
            clearTimeout(timeout);
            reject(error);
        });

        child.on('close', (code) => {
            clearTimeout(timeout);
            if (!responseReceived) {
                reject(new Error(`Server closed with code ${code}. stderr: ${stderr}`));
            }
        });

        // Send the request
        child.stdin.write(JSON.stringify(request) + '\n');
    });
}

// Run the tests
testMCPServer().catch(console.error);