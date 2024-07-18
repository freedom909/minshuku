import { GraphQLError } from 'graphql';
import DateTimeType from '../../infrastructure/scalar/DateTimeType.js';
import AccountsAPI from './datasources/accountsApi.js';
import AccountService from '../../infrastructure/services/accountService.js';
import AccountRepository from '../../infrastructure/repositories/accountRepository.js';
import {connectToDatabase } from '../../infrastructure/DB/connectDB.js';


async function initializeRepositories() {
    const db = await connectToDatabase();
    const accountRepository = new AccountRepository(db);
    return { accountRepository };
  }

  const resolvers = {
    DateTime: DateTimeType,
    Account: {
        __resolveReference(reference, { dataSources, user }) {
          if (user?.sub) {
            return dataSources.accountRepository.getAccountById(reference.id);
          }
          throw new GraphQLError("Not authorized!", {
            extensions: {
              code: "UNAUTHORIZED",
            },
          });
        },
        id(account) {
          return account._id;
        },
        createdAt(account) {
          return account.createdAt;
        },
      },
  
    Query: {
        account: async (_, { id }, { dataSources }) => {
          const { accountRepository } = await initializeRepositories();
          return accountRepository.getAccountById(id);
        },
        accounts: async (_, __, { dataSources }) => {
          const { accountRepository } = await initializeRepositories();
          return accountRepository.getAccounts();
        },
        viewer: async (_, __, { dataSources, user }) => {
          if (user?.sub) {
            const { accountRepository } = await initializeRepositories();
            return accountRepository.getAccountById(user.sub);
          }
          return null;
        },
      },
  
    Mutation: {
        createAccount: async (
            _,
            { input: { email, password } },
            { dataSources }
          ) => {
            const { accountRepository } = await initializeRepositories();
            const account = {
              email,
              password,
              createdAt: new Date(),
            };
            return accountRepository.createAccount(account);
          },
          deleteAccount: async (_, { id }, { dataSources }) => {
            const { accountRepository } = await initializeRepositories();
            return accountRepository.deleteAccount(id);
          },
          updateAccountEmail: async (
            _,
            { input: { id, email } },
            { dataSources }
          ) => {
            const { accountRepository } = await initializeRepositories();
            return accountRepository.updateAccountEmail(id, email);
          },
          updateAccountPassword: async (
            _,
            { input: { 
                id,
                 newPassword,
                 password 
                } },
            { dataSources }
          ) => {
            const { accountRepository } = await initializeRepositories();
            // Ensure password is hashed before updating
            return accountRepository.updateAccountPassword(id, newPassword);
          },
    },
  };

  export default resolvers;