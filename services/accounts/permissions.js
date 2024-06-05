import { rule, shield, and, or } from 'graphql-shield';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Rule to check if the user is authenticated
const isAuthenticated = rule()(async (parent, args, ctx, info) => {
  return ctx.user !== null;
});

// Rule to check if the user is an admin
const isAdmin = rule()(async (parent, args, ctx, info) => {
  const user = await prisma.user.findUnique({ where: { id: ctx.user.id } });
  return user && user.role === 'admin';
});

// Rule to check if the user is the owner of the booking
const isOwner = rule()(async (parent, args, ctx, info) => {
  const booking = await prisma.booking.findUnique({ where: { id: args.id } });
  return booking && booking.guestId === ctx.user.id;
});

// Rule to check if the user is a host
const isHost = rule()(async (parent, args, ctx, info) => {
  const user = await prisma.user.findUnique({ where: { id: ctx.user.id } });
  return user && user.role === 'HOST';
});

// Rule to
const isHostOfBooking = rule()(async (parent, args, ctx, info) => {
  const booking = await prisma.booking.findUnique({
    where: { id: args.id },
    include: { listing: true }
  });
  return booking && booking.listing.hostId === ctx.user.id;
});

// Rule to check if the user is a host for the listing
const isHostOfListing = rule()(async (parent, args, ctx, info) => {
  const listing = await prisma.listing.findUnique({
    where: { id: args.id }
  });
  return listing && listing.hostId === ctx.user.id;
});

// Permissions
const permissions = shield({
  Query: {
    bookingsWithPermission: or(isAdmin, isOwner, isHostOfBooking),
    listingsWithPermission: or(isHostOfListing, isAdmin)
  },
}, {
  fallbackRule: isAuthenticated,
});

export default { permissions };
