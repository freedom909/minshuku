
import Listing from '../services/models/mysql/listing.js';
import dotenv from 'dotenv';
dotenv.config();

const resolvers = {
    // Debug logger setup
    debug: true,
    Mutation: {

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

        suggestTitleImprovements: async (_, { listingId }, context) => {
            // ✅ Logging context inside the resolver
            console.log('▶ Resolver context:', context);
            const aiService = context?.dataSources?.aiService;
            if (!aiService) {
                console.error('❌ AI service missing from context:', context);
                throw new Error('AI service is not available');
            }
            return {
                suggestions: ['Better title 1', 'More attractive title 2']
            };
            // return await aiService.suggestTitleImprovements(listingId);
        }
    },

    Query: {
        Listing: {
            bookings: async (listing, _, { userId }) => {
                if (!userId || !listing.bookings.some(b => b.guestId === userId)) {
                    throw new AuthenticationError("Access denied to booking details");
                }
                return listing.bookings;
            },
            currentlyBookedDates: async (listing, _, { userId }) => {
                if (!userId || !listing.bookings.some(b => b.guestId === userId)) {
                    throw new AuthenticationError("Access denied to booked dates");
                }
                return listing.currentlyBookedDates;
            },
        },

        getUser: (_, __, { user = {}, dataSources = {} }) => {
            // Access userId here  

            // Implement logic to fetch user data from the database or other sources
            // Example usage  
            if (user.role === 'GUEST') {
                return dataSources.userService.getGuestUser();
            }
            return dataSources.userService.getUser(user.id);
        }
    },
}

export default resolvers