// Define the GraphQL endpoint URL - use a default value if config is not available
const SUBGRAPH_USER_URL = 'http://localhost:4010/graphql';

class OAuthService {
    constructor() {
        this.token = null;
        if (typeof window !== 'undefined') {
            this.token = localStorage.getItem('jwt_token');
        }
    }

    async sendOAuthRequestToSubgraph(provider, token) {
        console.log("🔄 Sending OAuth request to subgraph...");
        console.log("Provider:", provider);
        console.log("Token:", token ? `${token.substring(0, 10)}...` : 'No token');

        if (!provider || !token) {
            console.error('Missing provider or token');
            return { 
                success: false, 
                error: 'Missing provider or token' 
            };
        }

        try {
            console.log(`Sending request to ${SUBGRAPH_USER_URL}`);
            const response = await fetch(SUBGRAPH_USER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: `
                        mutation OAuthSignIn($input: OAuthSignInInput!) {
                            oauthSignIn(input: $input) {
                                success
                                userId
                                role
                                code
                                message
                                user {
                                    id
                                    email
                                    name
                                    nickname
                                    role
                                    picture
                                }
                                token {
                                    accessToken {
                                        token
                                        expiresAt
                                    }
                                }
                            }
                        }
                    `,
                    variables: {
                        input: {
                            provider: provider.toUpperCase(),
                            token
                        }
                    }
                })
            });

            const text = await response.text();
            console.log('Raw response:', text);

            let data;
            try {
                data = JSON.parse(text);
            } catch (err) {
                console.error('Failed to parse JSON response:', err);
                return { 
                    success: false, 
                    error: 'Invalid JSON response from server' 
                };
            }

            console.log('Parsed OAuth response:', data);

            if (data.errors) {
                const errorMessage = data.errors[0]?.message || 'GraphQL error occurred';
                console.error('GraphQL errors:', data.errors);
                return { 
                    success: false, 
                    error: errorMessage 
                };
            }

            const signInResult = data.data?.oauthSignIn;
            if (!signInResult?.success) {
                return { 
                    success: false, 
                    error: signInResult?.message || 'OAuth login failed' 
                };
            }

            // Store the JWT token if provided
            if (signInResult.token?.accessToken?.token) {
                if (typeof window !== 'undefined') {
                    localStorage.setItem('jwt_token', signInResult.token.accessToken.token);
                    this.token = signInResult.token.accessToken.token;
                }
            }

            return { 
                success: true, 
                user: signInResult.user,
                token: signInResult.token?.accessToken?.token,
                expiresAt: signInResult.token?.accessToken?.expiresAt
            };
        } catch (err) {
            console.error('OAuth request failed:', err);
            return { 
                success: false, 
                error: err.message || 'OAuth request failed' 
            };
        }
    }

    logout() {
        if (typeof window === 'undefined') return;

        // Clear stored token
        localStorage.removeItem('jwt_token');
        this.token = null;

        console.log('User logged out');
    }

    async registerUser(userData) {
        try {
            // Set default avatar if not provided
            if (!userData.picture) {
                userData.picture = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`;
            }

            const query = `
                mutation Mutation($input: SignUpInput!) {
                    signUp(input: $input) {
                        role
                        userId
                        code
                        message
                        refreshToken
                        success
                        auth {
                            token
                        }
                    }
                }
            `;

            const response = await fetch(SUBGRAPH_USER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query,
                    variables: {
                        input: userData
                    }
                }),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.errors) {
                console.error('GraphQL errors:', result.errors);
                throw new Error(result.errors[0].message);
            }

            const registerResult = result.data.signUp;

            if (!registerResult.success) {
                throw new Error(registerResult.message || '注册失败');
            }

            // Store JWT token
            if (registerResult.auth?.token) {
                if (typeof window !== 'undefined') {
                    localStorage.setItem('jwt_token', registerResult.auth.token);
                    this.token = registerResult.auth.token;
                }
            }

            return {
                success: true,
                user: registerResult,
                token: registerResult.auth?.token,
                message: registerResult.message
            };
        } catch (error) {
            console.error('Registration failed:', error);
            return {
                success: false,
                error: error.message || 'Registration process failed'
            };
        }
    }

    getToken() {
        return this.token;
    }
}

// Create and export a singleton instance
const oauthService = new OAuthService();
export default oauthService;