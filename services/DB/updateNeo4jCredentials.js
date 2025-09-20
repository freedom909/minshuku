import fs from 'fs/promises';
import path from 'path';
import readline from 'readline';
import { stdin as input, stdout as output } from 'process';

// Create readline interface for user input
const rl = readline.createInterface({ input, output });

// Function to prompt for input
const prompt = (question) => new Promise((resolve) => rl.question(question, resolve));

async function updateNeo4jCredentials() {
  try {
    // Path to .env file
    const envPath = path.resolve('../../.env');
    
    // Read the current .env file
    let envContent = await fs.readFile(envPath, 'utf8');
    
    // Extract current values
    const currentUri = envContent.match(/NEO4J_URI=(.+)/)?.[1] || '';
    const currentUsername = envContent.match(/NEO4J_USERNAME=(.+)/)?.[1] || '';
    const currentPassword = envContent.match(/NEO4J_PASSWORD=(.+)/)?.[1] || '';
    
    console.log('Current Neo4j Configuration:');
    console.log(`URI: ${currentUri}`);
    console.log(`Username: ${currentUsername}`);
    console.log(`Password: ${currentPassword ? '******' : 'Not set'}`);
    console.log('\n');
    
    // Prompt for new values
    console.log('Enter new Neo4j credentials (press Enter to keep current value):');
    const newUri = await prompt(`URI [${currentUri}]: `);
    const newUsername = await prompt(`Username [${currentUsername}]: `);
    const newPassword = await prompt('Password: ');
    
    // Update only provided values
    const updatedUri = newUri || currentUri;
    const updatedUsername = newUsername || currentUsername;
    const updatedPassword = newPassword || currentPassword;
    
    // Update .env content
    let updatedEnvContent = envContent;
    
    if (updatedUri !== currentUri) {
      updatedEnvContent = updatedEnvContent.replace(/NEO4J_URI=(.+)/, `NEO4J_URI=${updatedUri}`);
    }
    
    if (updatedUsername !== currentUsername) {
      updatedEnvContent = updatedEnvContent.replace(/NEO4J_USERNAME=(.+)/, `NEO4J_USERNAME=${updatedUsername}`);
    }
    
    if (updatedPassword !== currentPassword) {
      updatedEnvContent = updatedEnvContent.replace(/NEO4J_PASSWORD=(.+)/, `NEO4J_PASSWORD=${updatedPassword}`);
    }
    
    // Write updated content back to .env file
    await fs.writeFile(envPath, updatedEnvContent, 'utf8');
    
    console.log('\nNeo4j credentials updated successfully!');
    console.log('Run the verification script to test the connection.');
    
  } catch (error) {
    console.error('Error updating Neo4j credentials:', error.message);
  } finally {
    rl.close();
  }
}

// Run the update function
updateNeo4jCredentials();