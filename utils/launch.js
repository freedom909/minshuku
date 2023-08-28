
const { spawn } = require('child_process');
const path = require('path');

async function startService(command, name, cwd, prefixColor) {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(command, [], { cwd, shell: true });

    childProcess.stdout.on('data', data => {
      console.log(`[${name}] \x1b[${prefixColor}m${data.toString().trim()}\x1b[0m`);
    });

    childProcess.stderr.on('data', data => {
      console.error(`[${name}] \x1b[31m${data.toString().trim()}\x1b[0m`);
    });

    childProcess.on('close', code => {
      if (code !== 0) {
        reject(new Error(`[${name}] exited with code ${code}`));
      } else {
        resolve();
      }
    });
  });
}

async function main() {
  try {
    const accounts = startService('npm start', 'accounts', path.resolve(__dirname, '../services/accounts'), 'blue');
    const listings = startService('npm start', 'listings', path.resolve(__dirname, '../services/listings'), 'magenta');
    const bookings = startService('npm run booking:update', 'bookings', path.resolve(__dirname, '../services/bookings'), 'green');

    await Promise.all([accounts, listings, bookings]);

    console.log('All services started successfully.');
  } catch (error) {
    console.error(error);
  }
}

main();
