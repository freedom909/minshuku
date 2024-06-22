// import {AuthenticationError} from '../../infrastructure/utils/errors.js';
// import { ApolloServerErrorCode } from '@apollo/server/errors';
// import { GraphQLError } from 'graphql';
// import AccountsAPI from './datasources/accountsApi.js'
// import { validateInviteCode } from '../../infrastructure/helpers/validateInvitecode.js';
// import DateTimeType from '../../infrastructure/scalar/DateTimeType.js';
// import { authenticateJWT,checkPermissions } from '../../infrastructure/auth/auth.js'
// import { permissions} from '../../infrastructure/auth/permission.js';
// import UserService from '../users/datasources/userService.js';
// import UserRepository from '../../infrastructure/userRepository.js';
// import { connectToDatabase } from '../../infrastructure/DB/connectDB.js'; // Your database connection

// async function InitializeServices() {
//   const db = await connectToDatabase();
//   const userService=new UserService(new UserRepository(db));
//   return userService;
// }

// const {isAdmin,isHost} =permissions
// const resolvers = {
//   DateTime: DateTimeType,

//   Account: {
//     __resolveReference(reference, { dataSources, user }) {
//       if (user?.sub) {
//         return dataSources.accountsAPI.getAccountById(reference.id);
//       }
//       throw new GraphQLError("Not authorized!",{extensions:{
//         code:'Unauthorizated',
//       }});
//     },
//     id(account) {
//       return account.user_id;
//     },
//     createdAt(account) {
//       return account.created_at;
//     },
//     email(account) {
//       return account.email;
//     }
//   },

//   Query: {
//     user: async (_, { id }, { dataSources }) => {
//       const user = await dataSources.accountsAPI.getUser(id);
//       if (!user) {
//         throw new GraphQLError('No user found', { extensions: { code: 'NO_USER_FOUND' } });
//       }
//       return user;
//     },
//     getUserByEmail: async (_, { email }, { dataSources }) => {
//       return dataSources.accountsAPI.getUserByEmail({ email });
//     },
//     me: async (_, __, { dataSources, userId }) => {
//       if (!userId) throw new ApolloServerErrorCode.BAD_REQUEST_ERROR;
//       const user = await dataSources.accountsAPI.getUser(userId);
//       return user;
//     },
//     account: async (_, { id }, { dataSources }) => {
//       return dataSources.accountsAPI.getAccountById(id);
//     },
//     accounts: async (_, __, { dataSources }) => {
//       return dataSources.accountsAPI.getAccounts();
//     },
//     viewer: async (_, __, { dataSources, user }) => {
//       if (user?.sub) {
//         return dataSources.accountsAPI.getAccountById(user.sub);
//       }
//       return null;
//     },
//     bookings: async (_, __, { ctx, dataSources }) => {
//       const { user } = ctx;
//       if (!user) {
//         throw new GraphQLError('No user found', { extensions: { code: 'NO_USER_FOUND' } });
//       }
//       const bookings = await dataSources.bookingsAPI.getBookingsForUser(user);
//       return bookings;
//     },
//     bookingsByUser: async (_, { userId }, { dataSources }) => {
//       return dataSources.bookingsAPI.getBookingsByUserId(userId);
//     },
//     bookingById: async (_, { id }, { dataSources }) => {
//       return dataSources.bookingsAPI.getBookingById(id);
//     },
//     listings: async (_, __, { ctx, dataSources }) => {
//       const { user } = ctx;
//       if (!user) throw new AuthenticationError('You must be logged in to view your listing');

//       if (user.role === 'HOST') {
//         const listings = await dataSources.listingsAPI.getListingsForHost(user.id);
//         if (listings) {
//           return listings;
//         }
//         throw new Error('No listings found for this host');
//       } else {
//         throw new GraphQLError('You are not authorized to view listings',{extensions:{
//           code:'Unauthorizated'
//         }});
//       }
//     },
//   },

//   Mutation: {
//     createUser: async (_, { CreateUserInput }, { dataSources, userId }) => {
//       try {
//         const user = await dataSources.accountsAPI.getUser(userId);
//         if (user.role !== 'Admin') {
//           throw new AuthenticationError('Only admin can create a user');
//         }
//         const { name, password, email } = CreateUserInput;
//         const newUser = await dataSources.accountsAPI.createUser({
//           name,
//           email,
//           password,
//         });
//         return {
//           code: 200,
//           success: true,
//           message: 'A user successfully created',
//           user: newUser,
//         };
//       } catch (error) {
//         return {
//           code: 400,
//           success: false,
//           message: error.message,
//         };
//       }
//     },


//     createListing: async (_, { CreateListingInput }, { dataSources, hostId, locationId }) => {
//       const { title, description, price } = CreateListingInput;
//       try {
//         if (!hostId) {
//           throw new AuthenticationError('You do not have the right to create a listing');
//         }
//         if (!locationId) {
//           throw new AuthenticationError('You must select a location');
//         }
//         const newListing = await dataSources.listingsAPI.createListing({
//           title,
//           description,
//           price,
//           locationId,
//         });
//         return {
//           code: 200,
//           success: true,
//           message: 'A listing successfully created',
//           listing: newListing,
//         };
//       } catch (error) {
//         return {
//           code: 400,
//           success: false,
//           message: error.message,
//         };
//       }
//     },
  
//     updateProfile: async (_, { updateProfileInput }, { dataSources, userId }) => {
//       if (!userId) throw new AuthenticationError();
//       try {
//         const updatedUser = await dataSources.accountsAPI.updateUser({
//           userId,
//           userInfo: updateProfileInput,
//         });
//         return {
//           code: 200,
//           success: true,
//           message: 'Profile successfully updated!',
//           user: updatedUser,
//         };
//       } catch (err) {
//         return {
//           code: 400,
//           success: false,
//           message: err.message,
//         };
//       }
//     },

//     logout: (_, __, context) => {
//       if (context.session) {
//         context.session.destroy(err => {
//           if (err) {
//             throw new GraphQLError('Failed to terminate the session', { extensions: { code: 'FAILED_TO_TERMINATE_SESSION' } });
//           }
//         });
//       }
//       return true;
//     },

//     signIn: async (_, { input: { email, password } }, { dataSources }) => {
//       if (email && password) {
//         return dataSources.accountsAPI.login(email, password);
//       }
//       throw new GraphQLError('Email and password must be provided', { extensions: { code: 'EMAIL_PASSWORD_REQUIRED' } });
//     },

//     sendInviteCode: async (_, { email }, { dataSources }) => {
//       const user = await dataSources.accountsAPI.getUserByEmail({ email });
//       if (!user) {
//         throw new GraphQLError('User not found', {
//           extensions: { code: 'BAD_USER_INPUT' }
//         });
//       }
//       const inviteCode = await validateInviteCode(user.invite_code);
//       if (!inviteCode) {
//         throw new GraphQLError('Invalid invite code', {
//           extensions: { code: 'BAD_USER_INPUT' }
//         });
//       }
//       return {
//         code: 200,
//         success: true,
//         message: 'Invite code sent successfully!',
//         user: user,
//       };
//     },
//     updatePassword: async (_, { input: { id, newPassword, password } }, { dataSources }) => {
//       const user = await dataSources.accountsAPI.getUser(id);
//       if (!user) {
//         throw new UserInputError('User not found', {
//           extensions: { code: 'BAD_USER_INPUT' }
//         });
//       }
//       const isValidPassword = await validatePassword(password, user.password);
//       if (!isValidPassword) {
//         throw new UserInputError('Invalid password', {
//           extensions: { code: 'BAD_USER_INPUT' }
//         });
//       }
//       return dataSources.accountsAPI.updatePassword(id, newPassword);
//     },

//     requestResetPassword: async (_, { email }, { dataSources }) => {
//       const user = await dataSources.accountsAPI.getUserByEmail({ email });
//       if (!user) {
//         throw new UserInputError('User not found', {
//           extensions: { code: 'BAD_USER_INPUT' }
//         });
//       }
//       const token = await createResetPasswordToken(user.id);
//       await sendResetPasswordEmail(user.email, token);
//       return {
//         code: 200,
//         success: true,
//         message: 'Reset password email sent successfully!',
//       };
//     },

//     async register(_,args){
//       const userRepository = await initializeRepositories();
//       const { email, password, name, nickname, role, picture } = args.input;
//       console.log('Received input:', input);  // Add this line for debugging
//       const {userService } = await InitializeServices()
//       const response = await userService.register(email, password, name, nickname, role,  picture);
//           return response;
//     },
//     signUp: async (_, { input }, { dataSources }) => {
//       const { email, password, name, nickname, role, inviteCode, picture } = input;
//       console.log('Received input:', input);  // Add this line for debugging
//       if (role === 'HOST') {
//         const isValidInviteCode = await validateInviteCode(inviteCode);
//         if (!isValidInviteCode) {
//           throw new UserInputError('Invalid invite code', {
//             extensions: { code: 'BAD_USER_INPUT' }
//           });
//         }
//         return dataSources.accountsAPI.register({ email, password, name, nickname, role: 'HOST', picture });
//       } else {
//         return dataSources.accountsAPI.register({ email, password, name, nickname, role: 'GUEST', picture });
//       }
//     },
//     createAccount: async (_, { input: { email, password } }, { dataSources }) => {
//       return dataSources.accountsAPI.createAccount(email, password);
//     },
//     deleteAccount: async (_, { id }, { dataSources }) => {
//       return dataSources.accountsAPI.deleteAccount(id);
//     },
//     updateAccountEmail: async (_, { input: { id, email } }, { dataSources }) => {
//       return dataSources.accountsAPI.updateAccountEmail(id, email);
//     },
//     updateAccountPassword: async (_, { input: { id, newPassword, password } }, { dataSources }) => {
//       return dataSources.accountsAPI.updateAccountPassword(id, newPassword, password);
//     },
//   },
//   User: {
//     __resolveType(user) {
//       if (user.role === 'HOST') {
//         return 'Host';
//       } else if (user.role === 'GUEST') {
//         return 'Guest';
//       }
//       return null;
//     },
//   },

//   Host: {
//     __resolveReference: (user, { dataSources }) => {
//       return dataSources.accountsAPI.getUser(user.id);
//     }
//   },

//   Guest: {
//     __resolveReference: (user, { dataSources }) => {
//       return dataSources.accountsAPI.getUser(user.id);
//     }
//   }
// };

// export default resolvers;