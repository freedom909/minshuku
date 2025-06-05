import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import GithubProvider from 'next-auth/providers/github';
import config from '@/config/config';
import oauthService from '@/userService/oauthService';
import localAuthService from '@/userService/localAuthService';

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                try {
                    console.log('🔐 Authorizing credentials...', credentials?.email);
                    
                    if (!credentials?.email || !credentials?.password) {
                        console.error('Missing credentials');
                        throw new Error('请输入邮箱和密码');
                    }

                    const result = await localAuthService.authenticate(
                        credentials.email,
                        credentials.password
                    );

                    console.log('Auth result:', JSON.stringify(result, null, 2));

                    if (!result.success) {
                        console.error('Authentication failed:', result.error || result.message);
                        throw new Error(result.error || result.message || '登录失败');
                    }

                    if (!result.user) {
                        console.error('No user data in result');
                        throw new Error('用户数据无效');
                    }

                    // Return the user object that will be saved in the session
                    return {
                        id: result.user.id,
                        email: result.user.email,
                        name: result.user.name,
                        image: result.user.picture,
                        role: result.user.role,
                        accessToken: result.token
                    };
                } catch (error) {
                    console.error('Authorization error:', error);
                    throw new Error(error.message || '登录失败');
                }
            }
        }),
        GoogleProvider({
            clientId: config.google.clientId,
            clientSecret: config.google.clientSecret,
            authorization: {
                params: {
                    prompt: "select_account"
                }
            }
        }),
        FacebookProvider({
            clientId: config.facebook.clientId,
            clientSecret: config.facebook.clientSecret
        }),
        GithubProvider({
            clientId: config.github.clientId,
            clientSecret: config.github.clientSecret
        })
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            try {
                console.log('🔄 Sign in callback');
                console.log('User:', JSON.stringify(user, null, 2)); //
                console.log('Account:', JSON.stringify(account, null, 2));
                console.log('Profile:', JSON.stringify(profile, null, 2));

                // For credentials provider, just return true as we've already validated in authorize
                if (account?.type === 'credentials') {
                    return true;
                }

                // For OAuth providers
                if (account?.type === 'oauth' && account?.access_token) {
                    try {
                        const result = await oauthService.sendOAuthRequestToSubgraph(
                            account.provider,
                            account.access_token
                        );

                        console.log('OAuth result:', JSON.stringify(result, null, 2));

                        if (!result.success) {
                            console.error('OAuth authentication failed:', result.error);
                            return false;
                        }

                        // Update user object with data from our backend
                        if (result.user) {
                            user.id = result.user.id;
                            user.role = result.user.role ||"GUEST"; // Default to GUEST if role is missing
                            user.name = result.user.name || result.user.email.split("@")[0];
                            user.image = result.user.picture;
                            user.email = result.user.email;
                            user.accessToken = result.token;
                        }

                        return true;
                    } catch (error) {
                        console.error('OAuth processing error:', error);
                        return false;
                    }
                }

                return false;
            } catch (error) {
                console.error('Sign in callback error:', error);
                return false;
            }
        },

        async jwt({ token, user, account }) {
            try {
                console.log('🔑 JWT Callback');
                console.log('Token:', JSON.stringify(token, null, 2));
                console.log('User:', JSON.stringify(user, null, 2));
                console.log('Account:', JSON.stringify(account, null, 2));

                // If user object is available, this is the initial sign in
                if (user) {
                    token.id = user.id;
                    token.email = user.email;
                    token.name = user.name;
                    token.picture = user.image;
                    token.role = user.role;
                    token.accessToken = user.accessToken;
                }

                return token;
            } catch (error) {
                console.error('JWT callback error:', error);
                return token;
            }
        },

        async session({ session, token }) {
            try {
                console.log('📅 Session Callback');
                console.log('Session:', JSON.stringify(session, null, 2));
                console.log('Token:', JSON.stringify(token, null, 2));

                if (token) {
                    session.user.id = token.id;
                    session.user.role = token.role;
                    session.user.accessToken = token.accessToken;
                }

                return session;
            } catch (error) {
                console.error('Session callback error:', error);
                return session;
            }
        }
    },
    pages: {
        signIn: '/auth/login',
        error: '/auth/error',
    },
    session: {
        strategy: 'jwt',
    },
    debug: process.env.NODE_ENV === 'development',
});

export { handler as GET, handler as POST };