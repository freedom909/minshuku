import initAccountContainer from './initAccountContainer.js';

(async () => {
  try {
    const container = await initAccountContainer();
    console.log('✅ Container initialized successfully.');

    // Check what services are available
    console.log('Registered services:');
    console.log(Object.keys(container._registry || container._services || {}));

    // Optional: test one service
    if (container.resolve('accountService')) {
      console.log('✅ accountService is ready');
    } else {
      console.log('❌ accountService not found');
    }

    // Close database connections if needed
    if (container.resolve('mongodb')) {
      await container.resolve('mongodb').end();
      console.log('✅ MongoDB connection closed');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error initializing container:', err);
    process.exit(1);
  }
})();
