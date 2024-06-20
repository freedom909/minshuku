import { rule, shield, and, or } from 'graphql-shield';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import Booking from '../models/booking.js';
import Listing from '../models/listing.js';

// Rule to check if the user is authenticated
const isAuthenticated = rule()(async (parent, args, ctx, info) => {
  return ctx.user !== null;
});

// Rule to check if the user is an admin
const isAdmin = rule()(async (parent, args, ctx, info) => {
  const user = await User.findOne({ where: { id: ctx.user.id } });
  return user && user.role === 'ADMIN';
});

// Rule to check if the user is the owner of the booking
const isOwner = rule()(async (parent, args, ctx, info) => {
  const booking = await Booking.findOne({ where: { id: args.id } });
  return booking && booking.guestId === ctx.user.id;
});

// Rule to check if the user is a host
const isHost = rule()(async (parent, args, ctx, info) => {
  const user = await User.findOne({ where: { id: ctx.user.id } });
  return user && user.role === 'HOST';
});

const isHostOfListing=rule()(async (_,__,ctx,info)=>{
  const listing =await Listing.findOne({where:{id:__.id}})
  return listing && listing.hostId===ctx.user.id
})

const isGuest=rule()(async (_,__,ctx, info)=>{
  const user= await User.findOne({where: { id:ctx.user.id}})
  return user && user.role ==='GUEST'
})
// Permissions
const permissions = shield({
  Query: {
    bookingsWithPermission: or(isAdmin, isOwner),
    listingsWithPermission: or(isHost, isAdmin),
    getUser: or(and(isAuthenticated, isOwner), isAdmin),
    me:isAuthenticated,
  },
  Mutation: {
    createUserOK: isAdmin,
    createAuthorOK:isAuthenticated,
    updateAuthorOK:isAdmin,
    updateUserOK:isAuthenticated,
    deleteAuthorOK:isAdmin,
    deleteUserOK:isAdmin,
    updateListingOK:(isAdmin,and(isHost,isHostOfListing)),
    deleteListingOK:(isAdmin,and(isHost,isHostOfListing))
  }
}, {
  fallbackRule: isAuthenticated,
  fallbackError: new Error('Not authorized!'),
});

export { permissions };
