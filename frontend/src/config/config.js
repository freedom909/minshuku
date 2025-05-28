const config = {
    google: {
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
      redirectUri: 'http://localhost:3000/auth/callback'
    },
    // Uncomment later if needed:
    // facebook: {
    //   clientId: process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID,
    //   clientSecret: process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_SECRET,
    //   redirectUri: 'http://localhost:3000/auth/callback'
    // },
    // github: {
    //   clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
    //   clientSecret: process.env.NEXT_PUBLIC_GITHUB_CLIENT_SECRET,
    //   redirectUri: 'http://localhost:3000/auth/callback'
    // },
    subgraphAuthUrl: process.env.NEXT_PUBLIC_SUBGRAPH_AUTH_URL
  };
  
  const validateEnvVariables = () => {
    const required = [
      'google.clientId',
      'google.clientSecret',
      'subgraphAuthUrl'
    ];
  
    const missing = required.filter(key => {
      const parts = key.split('.');
      let value = config;
      for (const part of parts) {
        if (value && part in value) {
          value = value[part];
        } else {
          return true;
        }
      }
      return !value;
    });
  
    if (missing.length > 0) {
      console.error('❌ 缺少环境变量:', missing.join(', '));
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  };
  
  if (process.env.NODE_ENV === 'development') {
    validateEnvVariables();
  }
  
  export default config;
  