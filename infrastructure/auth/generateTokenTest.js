import getToken from "./getToken.js";
(async () => {
    try {
        const code = 'authorization_code'; // This should be the code received from Google's authorization endpoint
        const token = await getToken(code);
        console.log('Generated Token:', token);
    } catch (error) {
        console.error('Error generating token:', error.message);
    }
})();