import initUserContainer from './services/DB/initUserContainer.js';

(async () => {
    try {
        const container = await initUserContainer();
        console.log('Container initialized successfully:', container);
    } catch (error) {
        console.error('Failed to initialize container:', error);
    }
})();