/**
 * Start and verify auth services
 * Run with: node start-auth-services.js
 */

const { spawn } = require('child_process');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Configuration
const BACKEND_PORT = 4001;
const FRONTEND_PORT = 3000;
const REQUIRED_ENV_VARS = {
  frontend: ['NEXT_PUBLIC_GOOGLE_CLIENT_ID', 'NEXT_PUBLIC_API_URL'],
  backend: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'JWT_SECRET']
};

// Logger setup
const logger = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  error: (msg) => console.error(`[ERROR] ${msg}`),
  success: (msg) => console.log(`[SUCCESS] ${msg}`)
};

// Check environment variables
async function checkEnvironment() {
  logger.info('Checking environment configuration...');

  // Check frontend .env.local
  const frontendEnvPath = path.join(process.cwd(), 'frontend', '.env.local');
  if (!fs.existsSync(frontendEnvPath)) {
    logger.error('Frontend .env.local file not found!');
    process.exit(1);
  }

  // Check backend .env
  const backendEnvPath = path.join(process.cwd(), 'subgraph-auths', '.env');
  if (!fs.existsSync(backendEnvPath)) {
    logger.error('Backend .env file not found!');
    process.exit(1);
  }

  logger.success('Environment files found');
}

// Test backend connection
async function testBackendConnection() {
  logger.info('Testing backend connection...');
  
  try {
    const response = await fetch(`http://localhost:${BACKEND_PORT}/health`);
    if (response.ok) {
      logger.success('Backend is responding');
      return true;
    }
  } catch (error) {
    logger.error(`Backend connection failed: ${error.message}`);
    return false;
  }
}

// Start backend service
function startBackend() {
  logger.info('Starting backend service...');
  
  const backend = spawn('npm', ['start'], {
    cwd: path.join(process.cwd(), 'subgraph-auths'),
    stdio: 'inherit'
  });

  backend.on('error', (error) => {
    logger.error(`Backend failed to start: ${error.message}`);
    process.exit(1);
  });

  return backend;
}

// Start frontend service
function startFrontend() {
  logger.info('Starting frontend service...');
  
  const frontend = spawn('npm', ['run', 'dev'], {
    cwd: path.join(process.cwd(), 'frontend'),
    stdio: 'inherit'
  });

  frontend.on('error', (error) => {
    logger.error(`Frontend failed to start: ${error.message}`);
    process.exit(1);
  });

  return frontend;
}

// Main execution
async function main() {
  try {
    // Check environment setup
    await checkEnvironment();

    // Start services
    const backend = startBackend();
    
    // Wait for backend to be ready
    logger.info('Waiting for backend to start...');
    let backendReady = false;
    for (let i = 0; i < 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (await testBackendConnection()) {
        backendReady = true;
        break;
      }
    }

    if (!backendReady) {
      logger.error('Backend failed to start within timeout');
      process.exit(1);
    }

    // Start frontend after backend is ready
    const frontend = startFrontend();

    // Log success
    logger.success(`
Services started successfully!
- Backend: http://localhost:${BACKEND_PORT}/graphql
- Frontend: http://localhost:${FRONTEND_PORT}
    `);

    // Handle process termination
    process.on('SIGINT', () => {
      logger.info('Shutting down services...');
      backend.kill();
      frontend.kill();
      process.exit(0);
    });

  } catch (error) {
    logger.error(`Failed to start services: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  logger.error(`Unexpected error: ${error.message}`);
  process.exit(1);
});