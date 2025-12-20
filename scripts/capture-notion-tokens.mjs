/**
 * Notion OAuth Token Capture Script
 * 
 * Purpose: Capture 2 OAuth tokens from 2 different Notion accounts
 *          for the rate limit test.
 * 
 * Usage:
 *   1. Set NOTION_CLIENT_ID and NOTION_CLIENT_SECRET as env vars
 *   2. Run: node scripts/capture-notion-tokens.mjs
 *   3. Open the URLs in browser, authorize with 2 different Notion accounts
 *   4. Script outputs the tokens for the rate limit test
 * 
 * Requirements:
 * - Node.js >= 18
 */

import http from 'http';
import { URL } from 'url';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Try to load .env manually (no dotenv dependency)
function loadEnvFile(envPath) {
  try {
    const content = fs.readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  } catch (e) {
    // File doesn't exist, that's OK
  }
}

// Try multiple .env locations
loadEnvFile(path.join(__dirname, '../backend/.env'));
loadEnvFile(path.join(__dirname, '../../NotionClipperWeb/backend/.env'));

// Load from env only - no hardcoded secrets
const NOTION_CLIENT_ID = process.env.NOTION_CLIENT_ID;
const NOTION_CLIENT_SECRET = process.env.NOTION_CLIENT_SECRET;
const PORT = 8080; // Must match Notion integration redirect URI
const REDIRECT_URI = `http://localhost:${PORT}/oauth/callback`;

if (!NOTION_CLIENT_ID || !NOTION_CLIENT_SECRET) {
  console.error(`
❌ Missing NOTION_CLIENT_ID or NOTION_CLIENT_SECRET

Please set them in NotionClipperWeb/backend/.env or as environment variables:
  NOTION_CLIENT_ID=xxx NOTION_CLIENT_SECRET=yyy node scripts/capture-notion-tokens.mjs
`);
  process.exit(1);
}

const capturedTokens = [];
let server;

async function exchangeCodeForToken(code) {
  const credentials = Buffer.from(`${NOTION_CLIENT_ID}:${NOTION_CLIENT_SECRET}`).toString('base64');
  
  const response = await fetch('https://api.notion.com/v1/oauth/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  return response.json();
}

function getAuthUrl(state) {
  const params = new URLSearchParams({
    client_id: NOTION_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    owner: 'user',
    state,
  });
  return `https://api.notion.com/v1/oauth/authorize?${params.toString()}`;
}

function startServer() {
  return new Promise((resolve) => {
    server = http.createServer(async (req, res) => {
      const url = new URL(req.url, `http://localhost:${PORT}`);
      
      if (url.pathname === '/oauth/callback') {
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state');
        const error = url.searchParams.get('error');
        
        if (error) {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end(`<h1>❌ Error: ${error}</h1><p>Please try again.</p>`);
          return;
        }
        
        if (!code) {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end('<h1>❌ No authorization code received</h1>');
          return;
        }
        
        try {
          console.log(`\n🔄 Exchanging code for token (${state})...`);
          const tokenData = await exchangeCodeForToken(code);
          
          capturedTokens.push({
            label: state,
            token: tokenData.access_token,
            workspace_id: tokenData.workspace_id,
            workspace_name: tokenData.workspace_name,
          });
          
          console.log(`✅ Token ${state} captured!`);
          console.log(`   Workspace: ${tokenData.workspace_name} (${tokenData.workspace_id})`);
          console.log(`   Token: ${tokenData.access_token.substring(0, 20)}...`);
          
          const remaining = 2 - capturedTokens.length;
          
          if (remaining > 0) {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
              <html>
              <head><title>Token ${state} Captured!</title></head>
              <body style="font-family: system-ui; padding: 40px; text-align: center;">
                <h1>✅ Token ${state} captured!</h1>
                <p>Workspace: <strong>${tokenData.workspace_name}</strong></p>
                <p style="color: #666;">Now authorize with a <strong>DIFFERENT</strong> Notion account.</p>
                <p style="margin-top: 30px;">
                  <a href="${getAuthUrl('TOKEN_B')}" 
                     style="background: #000; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 18px;">
                    🔐 Authorize Account B
                  </a>
                </p>
                <p style="color: #999; margin-top: 20px; font-size: 14px;">
                  ⚠️ Make sure to use a DIFFERENT Notion account (different email)
                </p>
              </body>
              </html>
            `);
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
              <html>
              <head><title>All Tokens Captured!</title></head>
              <body style="font-family: system-ui; padding: 40px; text-align: center;">
                <h1>🎉 All tokens captured!</h1>
                <p>You can close this window and check the terminal.</p>
              </body>
              </html>
            `);
            
            // Give time for response to be sent
            setTimeout(() => {
              printResults();
              server.close();
              resolve();
            }, 500);
          }
        } catch (err) {
          console.error('❌ Token exchange error:', err.message);
          res.writeHead(500, { 'Content-Type': 'text/html' });
          res.end(`<h1>❌ Error: ${err.message}</h1><p>Please try again.</p>`);
        }
      } else {
        res.writeHead(404);
        res.end('Not found');
      }
    });
    
    server.listen(PORT, () => {
      console.log(`\n🚀 OAuth callback server running on http://localhost:${PORT}`);
      resolve();
    });
  });
}

function printResults() {
  if (capturedTokens.length < 2) {
    console.log('\n⚠️  Not enough tokens captured. Need 2 tokens from 2 different accounts.');
    return;
  }
  
  const tokenA = capturedTokens[0];
  const tokenB = capturedTokens[1];
  
  if (tokenA.workspace_id === tokenB.workspace_id) {
    console.log('\n⚠️  WARNING: Both tokens are from the SAME workspace!');
    console.log('   For accurate testing, use tokens from DIFFERENT Notion accounts.');
  }
  
  console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                        🎉 TOKENS CAPTURED SUCCESSFULLY                        ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  Token A: ${tokenA.workspace_name.padEnd(60)}║
║  Workspace ID: ${tokenA.workspace_id.padEnd(55)}║
║                                                                               ║
║  Token B: ${tokenB.workspace_name.padEnd(60)}║
║  Workspace ID: ${tokenB.workspace_id.padEnd(55)}║
║                                                                               ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║  Run the rate limit test with:                                                ║
╚═══════════════════════════════════════════════════════════════════════════════╝

NOTION_TOKEN_A="${tokenA.token}" \\
NOTION_TOKEN_B="${tokenB.token}" \\
node scripts/notion-rate-limit-test.mjs
`);

  // Also save to a temp file for convenience
  const envContent = `# Notion Rate Limit Test Tokens
# Generated: ${new Date().toISOString()}
# Token A: ${tokenA.workspace_name} (${tokenA.workspace_id})
# Token B: ${tokenB.workspace_name} (${tokenB.workspace_id})

NOTION_TOKEN_A=${tokenA.token}
NOTION_TOKEN_B=${tokenB.token}
`;
  
  console.log('💾 Tokens also saved to: scripts/.notion-test-tokens.env');
  console.log('   You can run: source scripts/.notion-test-tokens.env && node scripts/notion-rate-limit-test.mjs\n');
  
  // Write to file
  fs.writeFileSync(path.join(__dirname, '.notion-test-tokens.env'), envContent);
}

async function main() {
  console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║              NOTION OAUTH TOKEN CAPTURE FOR RATE LIMIT TEST                   ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  This script will help you capture 2 OAuth tokens from 2 different           ║
║  Notion accounts to test if rate limits are per-integration or per-token.    ║
║                                                                               ║
║  IMPORTANT: Use 2 DIFFERENT Notion accounts (different emails)               ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
`);

  await startServer();
  
  const authUrlA = getAuthUrl('TOKEN_A');
  
  console.log(`
📋 STEP 1: Open this URL in your browser and authorize with your FIRST Notion account:

${authUrlA}

Or click here if your terminal supports it.
`);

  // Try to open browser automatically
  const openCommand = process.platform === 'win32' ? 'start' : 
                      process.platform === 'darwin' ? 'open' : 'xdg-open';
  
  exec(`${openCommand} "${authUrlA}"`, (err) => {
    if (err) {
      console.log('(Could not open browser automatically, please copy the URL above)');
    }
  });
  
  console.log('⏳ Waiting for OAuth callbacks...\n');
}

main().catch(console.error);
