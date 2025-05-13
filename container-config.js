// ... existing code ...

// Register other services
container.register({
    // ... existing service registrations ...
    expiresIn: asValue('1h') // Add this line
});