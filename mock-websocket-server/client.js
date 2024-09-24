// client.js  
import io from 'socket.io-client'
// Connect to the Socket.IO server  
const socket = io('http://localhost:3000');

// Event listener for connection establishment  
socket.on('connect', () => {
    console.log('Connected to the server');
});

// Listen for messages from the server  
socket.on('message', (message) => {
    console.log(`Message from server: ${message}`);
});

// Example function to send a message to the server  
function sendMessage(message) {
    console.log(`Sending: ${message}`);
    socket.send(message);
}

// Send a message every 5 seconds for demonstration  
setInterval(() => {
    sendMessage('Hello, server!');
}, 5000);

// Handle disconnection  
socket.on('disconnect', () => {
    console.log('Disconnected from the server');
});