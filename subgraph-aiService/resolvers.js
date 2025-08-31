import fetch from "node-fetch";
import Listing from '../services/models/mysql/listing.js';
import dotenv from 'dotenv';
dotenv.config();
import { AuthenticationError, ForbiddenError } from '../infrastructure/utils/errors.js'
const resolvers = {
    // Debug logger setup
    debug: true,
    Mutation: {
        applyTitleSuggestion: async (_, { listingId }, { dataSources }) => {
            // Step 1. Get AI suggestion from Python
            const response = await fetch("http://localhost:8000/suggestTitleImprovements", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ listingId }),
            });
            const data = await response.json();

            // Step 2. Update MySQL Listing via your listingService (DI container)
            const updatedListing = await dataSources.listingService.updateListingTitle(
                listingId,
                data.suggestion
            );

            // Step 3. Return AIResult
            return { suggestion: updatedListing.title };
        },

          suggestTitleImprovements: async (_, { listingId }, context) => {
            // ✅ Logging context inside the resolver
            console.log('▶ Resolver context:', context);
            const aiService = context?.dataSources?.aiService;
            if (!aiService) {
                console.error('❌ AI service missing from context:', context);
                throw new Error('AI service is not available');
            }
            const response = await fetch(`${process.env.MACHINE_URL}/suggest-title`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ listingId }),
            });
            const data = await response.json();
            return data.suggestions;
        },
    },
    Query: {
        getSmartSuggestions: async (_, { userId }, { dataSources }) => {
            const { aiService, userService, listingService } = dataSources;
            const user = await userService.getUserById(userId);
            const listings = await listingService.getPopularListings();
            const message = `Based on user ${user.name}'s preferences, suggest some listings from ${listings.map(l => l.title).join(', ')}.`;
            const response = await aiService.getChatResponse(message);
            return { suggestions: response };
        },

        sendMessageToAI: async (_, { message }, context) => {
            console.log('▶ context:', context);
            const { aiService } = context?.dataSources || {};
            if (!aiService) {
                throw new Error('AI service is not available');
            }

            try {
                const reply = await aiService.getChatResponse(message);
                await aiService.saveConversation(context.userId || 'anonymous', message, reply);
                return { reply };
            } catch (error) {
                console.error(error);
                throw new Error("Error communicating with ChatGPT");
            }
        },

        getListingInfo: async (_, { listingTitle }, { dataSources = {}, userId = null }) => {
            const { aiService } = dataSources;
            const listingData = await Listing.findOne({ title: listingTitle }).exec();

            if (!listingData) throw new Error(`Listing with title "${listingTitle}" not found`);

            // Authorization check for sensitive fields
            const bookings = userId && listingData.bookings.some(b => b.guestId === userId)
                ? listingData.bookings
                : null;

            const currentlyBookedDates = userId && listingData.bookings.some(b => b.guestId === userId)
                ? listingData.currentlyBookedDates
                : null;

            const message = `What are the available dates for the listing: ${listingData.title}?`;

            // Send a refined question to ChatGPT with the filtered data
            const reply = await aiService.getChatResponse(message);
            await aiService.saveConversation(userId, message, reply);

            return {
                ...listingData.toObject(),
                bookings,
                currentlyBookedDates,
            };
        },
    },
}

export default resolvers