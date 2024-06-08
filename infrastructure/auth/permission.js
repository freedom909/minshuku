import { rule, shield, or} from 'graphql-shield';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Booking from '../models/booking.js';

// Rule to check if the user is authenticated
const isAuthenticated = rule()(async (parent, args, ctx, info) => {
  return ctx.user !== null;
});

// Rule to check if the user is an admin
const isAdmin = rule()(async (parent, args, ctx, info) => {
  const user = await User.findOne({ where: { id: ctx.user.id } });
  return user && user.role === 'admin';
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

// Permissions
const permissions = shield({
  Query: {
    bookingsWithPermission: or(isAdmin, isOwner),
    listingsWithPermission: or(isHost, isAdmin)
  },
}, {
  fallbackRule: isAuthenticated,
});

export { permissions, isAdmin, isOwner, isHost, isAuthenticated };
