import generateToken from './generateToken.js';

    const user=
      {
       _id:'6698fc0093a6635334487515',
      email:'ju345@gmail.com',
      role: 'HOST', 
      }
    const token = generateToken(user);  // Generate a token for the user
    console.log('Generated JWT token:', token)
    //host._id:'6698fc0093a6635334487515', "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Njk4ZmMwMDkzYTY2MzUzMzQ0ODc1MTUiLCJlbWFpbCI6Imp1MzQ1QGdtYWlsLmNvbSIsInJvbGUiOiJIT1NUIiwiaWF0IjoxNzIxODY3NDY1LCJleHAiOjE3MjE4NzEwNjV9.RRX213YbHayIB3-ocvoWCV3WKdIYK0MYPqnEDryRnMw"
    // You can save this token in the user's session or cookie for future authentication
    // Use the token in subsequent requests by sending it in the Authorization header with the Bearer scheme
