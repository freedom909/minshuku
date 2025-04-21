import getToken from "./getToken.js";
async function generateToken(code) {
    try {
        const token = await getToken(code);
        console.log('Token generated successfully:', token);
        return token;
    } catch (error) {
        console.error('Failed to generate token:', error.message);
        throw error; // Re-throw the error to handle it further up the call stack if needed
    }
}

export default generateToken;