import { GraphQLError } from 'graphql';
import { ApolloServerErrorCode } from '@apollo/server/errors';
import DateTimeType from '../infrastructure/scalar/dateTime.js';

const resolvers = {
    DateTime: DateTimeType,
    Date: {
        serialize: (value) => value,
        parseValue: (value) => value,
        parseLiteral: (ast) => ast.value,
    },
    Query: {
        async profile(root, { username }, { dataSources }) {
            const { profileService } = dataSources;
            const profile = await profileService.getProfile({ username });
            if (!profile) {
                throw new GraphQLError("Profile not available.", {
                    extensions: {
                        code: ApolloServerErrorCode.BAD_USER_INPUT,
                    },
                });
            }
            return profile;
        },
        
        async profiles(root, { page = 1, limit = 20, search, role, status }, { dataSources }) {
            const { profileService } = dataSources;
            const result = await profileService.getProfiles({ page, limit, search, role, status });
            return result;
        },

        async getProfileByToken(root, { token }, { dataSources }) {
            const { profileService, tokenService } = dataSources;
            try {
                const decoded = tokenService.verifyToken(token);
                const profile = await profileService.getProfileById(decoded.userId);
                if (!profile) {
                    throw new GraphQLError('Profile not found', {
                        extensions: {
                            code: ApolloServerErrorCode.BAD_USER_INPUT
                        }
                    });
                }
                return profile;
            } catch (error) {
                throw new GraphQLError('Invalid token', {
                    extensions: {
                        code: 'INVALID_TOKEN'
                    }
                });
            }
        },
        
        async searchProfiles(root, { query, page = 1, limit = 20 }, { dataSources }) {
            const { profileService } = dataSources;
            return await profileService.searchProfiles({ query, page, limit });
        },
        
        async networkProfiles(root, { accountId, page = 1, limit = 20 }, { dataSources }) {
            const { profileService } = dataSources;
            return await profileService.getNetworkProfiles({ accountId, page, limit });
        },
        
        async profileStats(root, { accountId }, { dataSources }) {
            const { profileService } = dataSources;
            return await profileService.getProfileStats(accountId);
        }
    },
    
    Profile: {
        __resolveReference(reference, context) {
            const { dataSources, user } = context;
            const { profileService } = dataSources;
            if (user?.sub && reference?.id) {
                return profileService.getProfileById(reference.id);
            }
            throw new GraphQLError("Not authorized!", {
                extensions: {
                    code: "UNAUTHORIZED",
                },
            });
        },
        
        account(profile) {
            return { id: profile.accountId };
        },
        
        id(profile) {
            return profile._id;
        },
        
        network(profile, _, { dataSources }) {
            const { profileService } = dataSources;
            return profileService.getNetworkProfilesList(profile.network);
        },
        
        isInNetwork(profile, _, { dataSources, user }) {
            const { profileService } = dataSources;
            return profileService.checkViewerHasInNetwork(user.sub, profile.accountId);
        },
        
        networkCount(profile) {
            return profile.network ? profile.network.length : 0;
        },
        
        stats(profile, _, { dataSources }) {
            const { profileService } = dataSources;
            return profileService.getProfileStats(profile.accountId);
        },
        
        fullName(profile) {
            return profile.fullname || '';
        },
        
        updatedAt(profile) {
            return profile.updatedAt || profile.createdAt;
        },
        
        isVerified(profile) {
            return profile.status === 'VERIFIED';
        },
        
        privacySettings(profile) {
            return profile.privacySettings || {
                profileVisibility: 'PUBLIC',
                emailVisibility: 'NETWORK_ONLY',
                networkVisibility: 'PUBLIC',
                activityVisibility: 'PUBLIC'
            };
        },
        
        notificationPreferences(profile) {
            return profile.notificationPreferences || {
                emailNotifications: true,
                pushNotifications: true,
                smsNotifications: false,
                networkInvitations: true,
                bookingUpdates: true,
                reviewNotifications: true
            };
        }
    },
    
    Account: {
        profile(account, _, { dataSources }) {
            const { profileService } = dataSources;
            return profileService.getProfile({ accountId: account.id });
        }
    },
    
    Mutation: {
        createProfile(_, { input }, { dataSources }) {
            const { profileService } = dataSources;
            return profileService.createProfile(input);
        },
        
        updateProfileDetails(_, { input }, { dataSources }) {
            const { profileService } = dataSources;
            return profileService.updateProfile(input.accountId, input);
        },
        
        deleteProfile(_, { accountId }, { dataSources }) {
            const { profileService } = dataSources;
            return profileService.deleteProfile(accountId);
        },
        
        updatePrivacySettings(_, { accountId, settings }, { dataSources }) {
            const { profileService } = dataSources;
            return profileService.updatePrivacySettings(accountId, settings);
        },
        
        updateNotificationPreferences(_, { accountId, preferences }, { dataSources }) {
            const { profileService } = dataSources;
            return profileService.updateNotificationPreferences(accountId, preferences);
        },
        
        verifyProfile(_, { accountId }, { dataSources }) {
            const { profileService } = dataSources;
            return profileService.verifyProfile(accountId);
        },
        
        suspendProfile(_, { accountId }, { dataSources }) {
            const { profileService } = dataSources;
            return profileService.suspendProfile(accountId);
        },
        
        activateProfile(_, { accountId }, { dataSources }) {
            const { profileService } = dataSources;
            return profileService.activateProfile(accountId);
        },
        
        addToNetwork(_, { input: { accountId, networkMemberId } }, { dataSources }) {
            const { profileService } = dataSources;
            return profileService.addToNetwork(accountId, networkMemberId);
        },
        
        removeFromNetwork(_, { input: { accountId, networkMemberId } }, { dataSources }) {
            const { profileService } = dataSources;
            return profileService.removeFromNetwork(accountId, networkMemberId);
        },
        
        followUser(_, { followerId, followingId }, { dataSources }) {
            const { profileService } = dataSources;
            return profileService.followUser(followerId, followingId);
        },
        
        unfollowUser(_, { followerId, followingId }, { dataSources }) {
            const { profileService } = dataSources;
            return profileService.unfollowUser(followerId, followingId);
        }
    }
};

export default resolvers;
