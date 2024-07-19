import generateToken from './generateToken.js';

    const user=
      {
       _id:'6698fc0093a6635334487515',
      email:'ju345@gmail.com',
      role: 'HOST', 
      }
    const token = generateToken(user);  // Generate a token for the user
    console.log('Generated JWT token:', token)
    // You can save this token in the user's session or cookie for future authentication
    // Use the token in subsequent requests by sending it in the Authorization header with the Bearer scheme
