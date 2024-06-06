import { rule, shield, and, or } from 'graphql-shield';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
const prisma = new PrismaClient();

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'You must be logged in to access this route' });
  }
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await prisma.user.findUnique({ where: { id: decodedToken.userId } });
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  } catch (e) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

const authorize = (permission) => async (req, res, next) => {
  try {
    const allowed = await permission(req, res);
    if (allowed) {
      next();
    } else {
      return res.status(403).json({ message: "Unauthorized" });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

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

export default { authenticate, authorize, isAuthenticated, isAdmin, isOwner, isHost };
