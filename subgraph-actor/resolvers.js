import {GraphQLError} from 'graphql';
import { passwordValidate } from '../infrastructure/helpers/RegPassValidator.js';
import bcrypt from 'bcrypt';


const resolvers={
   Mutation:{
    updatePassword: async (_, {input}, { dataSources}) => { 
      const { userId, password, newPassword } = input;
    //retrieve the user from the db
    if (!userId) {
      return new GraphQLError("User ID is required", { extensions: { code: "USER_ID_REQUIRED" } });
    }
      
       const { userService } = dataSources;
       console.log('Received userId:', userId);
       console.log('Received input:', input);
        const user = await userService.findById(userId);// "message": "User not found",
        console.log('User retrieved from DB:', user);
        if (!user) {
          throw new GraphQLError("User not found", {
            extensions: { code: "USER_NOT_FOUND" },
          });
        }
        //validate the password
     
        await passwordValidate(newPassword);
        await passwordValidate(password);

          const hashedNewPassword = await bcrypt.hash(newPassword, 10);
          const updatedUser = await userService.editPassword(userId, hashedNewPassword);
        console.log('User after password update:', updatedUser);
        return updatedUser;

      },

      researchListing: async (_, { hostId }, { dataSources: { listingService } }) => {
        return listingService.getListingsByHost(hostId);
      },
      researchBooking: async (_, { guestId }, { dataSources: { bookingService } }) => {
        return bookingService.getBookingsByGuest(guestId);
      },
      confirmBooking: async (_, { id }, { dataSources: { bookingService } }) => {
        return bookingService.updateBookingStatus(id, 'CONFIRMED');
      },
      cancelBooking: async (_, { id }, { dataSources: { bookingService } }) => {
        return bookingService.updateBookingStatus(id, 'CANCELLED');
      },
      confirmListing: async (_, { id }, { dataSources: { listingService } }) => {
        return listingService.updateListingStatus(id, 'CONFIRMED');
      },
      cancelListing: async (_, { id }, { dataSources: { listingService } }) => {
        return listingService.updateListingStatus(id, 'CANCELLED');
      },
      updateUser: async (_, { id, input }, { dataSources: { userService } }) => {
        return userService.updateUser(id, input);
      },
      deleteUser: async (_, { id }, { dataSources: { userService } }) => {
        return userService.deleteUser(id);
      },
    }
}

export default resolvers;