import { GraphQLError } from 'graphql';
import { ApolloServerErrorCode } from '@apollo/server/errors';
import DateTimeType from "../../../shared/scalars/DateTimeType.js";

const resolvers = {
    DateTime: DateTimeType,
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
        async profiles(root, args, { dataSources }) {
            const { profileService } = dataSources;
            const profiles = await profileService.getProfiles();
            if (!profiles) {
                throw new GraphQLError("Profiles not available.", {
                    extensions: {
                        code: ApolloServerErrorCode.BAD_USER_INPUT,
                    },
                });
            }
            return profiles;
        },
    },
    Profile: {
        __resolveReference(reference, { dataSources, user }) {
            const { profileService } = dataSources;
            if (user?.sub) {
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
            return profileService.getNetworkProfiles(profile.network);
        },
        isInNetwork(profile, _, { dataSources, user }) {
            const { profileService } = dataSources;
            return profileService.checkViewerHasInNetwork(user.sub, profile.accountId);
        }
    },
    Account: {
        profile(account, _, { dataSources }) {
            const { profileService } = dataSources;
            return profileService.getProfile({ accountId: account.id });
        }
    },
    Mutation: {
        createProfile(root, { input }, { dataSources }) {
            const { profileService } = dataSources;
            return profileService.createProfile(input);
        },
        updateProfile(root, { input: { accountId, ...rest } }, { dataSources }) {
            const { profileService } = dataSources;
            return profileService.updateProfile(accountId, rest);
        },
        deleteProfile(_, { accountId }, { dataSources }) {
            const { profileService } = dataSources;
            return profileService.deleteProfile(accountId);
        },
        addToNetwork(_, { input: { accountId, networkMemberId } }, { dataSources }) {
            const { profileService } = dataSources;
            return profileService.addToNetwork(accountId, networkMemberId);
        },
        removeFromNetwork(_, { input: { accountId, networkMemberId } }, { dataSources }) {
            const { profileService } = dataSources;
            return profileService.removeFromNetwork(accountId, networkMemberId);
        }
    }
};

export default resolvers;
