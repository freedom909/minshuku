import { exec } from 'child_process';
import { resolve as _resolve,dirname } from 'path';
import { fileURLToPath } from "url";

async function installService(command, name, cwd, prefixColor) {
  return new Promise((resolve, reject) => {
    const childProcess = exec(command, { cwd });

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
const __dirname = dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT;
async function main() {
  try {
    const reviews = installService('npm install', 'reviews', _resolve(__dirname,  '../services/reviews'), 'yellow');
    const accounts = installService('npm install', 'accounts', _resolve(__dirname, '../services/accounts'), 'blue');
   const listings = installService('npm install', 'listings', _resolve(__dirname, '../services/listings'), 'magenta');
    const bookings = installService('npm install', 'bookings', _resolve(__dirname, '../services/bookings'), 'green');


    await Promise.all([accounts, listings, bookings, reviews]);

    console.log('All services installed successfully.');
  } catch (error) {
    console.error('Error in installing dependencies', error);
    throw new Error('Cannot install dependencies.');
  }
}

main();
