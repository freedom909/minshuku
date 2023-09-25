import { spawn } from 'child_process';
import { resolve } from 'path';

const accounts = spawn('npm', ['run', 'db:reset'], { cwd: resolve(__dirname, '../services/accounts') });
const listings = spawn('npm', ['run', 'db:reset'], { cwd: resolve(__dirname, '../services/listings') });
const bookings = spawn('npm', ['run', 'db:reset'], { cwd: resolve(__dirname, '../services/bookings') });
const reviews = spawn('npm', ['run', 'db:reset'], { cwd: resolve(__dirname, '../services/reviews') });

accounts.stdout.on('data', (data) => {
  console.log(`accounts stdout:\n${data}`);
});

accounts.stderr.on('data', (data) => {
  console.error(`accounts stderr:\n${data}`);
});

accounts.on('close', (code) => {
  console.log(`accounts child process exited with code ${code}`);
});

listings.stdout.on('data', (data) => {
  console.log(`listings stdout:\n${data}`);
});

listings.stderr.on('data', (data) => {
  console.error(`listings stderr:\n${data}`);
});

listings.on('close', (code) => {
  console.log(`listings child process exited with code ${code}`);
});

bookings.stdout.on('data', (data) => {
  console.log(`bookings stdout:\n${data}`);
});

bookings.stderr.on('data', (data) => {
  console.error(`bookings stderr:\n${data}`);
});

bookings.on('close', (code) => {
  console.log(`bookings child process exited with code ${code}`);
});

reviews.stdout.on('data', (data) => {
  console.log(`reviews stdout:\n${data}`);
});

reviews.stderr.on('data', (data) => {
  console.error(`reviews stderr:\n${data}`);
});

reviews.on('close', (code) => {
  console.log(`reviews child process exited with code ${code}`);
});
