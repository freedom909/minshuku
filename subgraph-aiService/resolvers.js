import fetch from "node-fetch";
import { createLogger, transports, format } from "winston";
import Listing from "../services/models/mysql/listing.js"; // Example MySQL model
import dotenv from "dotenv";
dotenv.config();
import fs from "fs";

// -----------------------------
// Logger setup
// -----------------------------
const logger = createLogger({
  transports: [
    new transports.Console(),
    new transports.File({ filename: "combined.log" }),
  ],
  format: format.combine(format.timestamp(), format.json()),
});

// -----------------------------
// Helper to call Python REST endpoints
// -----------------------------
async function callPython(endpoint, body) {
  const machineUrl = process.env.MACHINE_URL || "http://localhost:8000";
  const url = `${machineUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  console.log(`Calling ${url} with body ${JSON.stringify(body)}`);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      logger.error(`Request to ${url} failed with status ${response.status}`);
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    logger.info(`Python response from ${url}: ${JSON.stringify(data)}`);
    return data;
  } catch (error) {
    logger.error(`Error calling ${url}: ${error.message}`);
    throw error; // 抛出错误，而不是返回默认值
  }
}


// -----------------------------
// Resolvers
// -----------------------------
const resolvers = {
  Query: {
    // Minimal subgraph queries
    getSmartSuggestions: async (_, { userId }, { dataSources }) => {
      const { aiService, userService, listingService } = dataSources;
      const user = await userService.getUserById(userId);
      const listings = await listingService.getPopularListings();
      const message = `Based on user ${user.name}'s preferences, suggest some listings from ${listings
        .map((l) => l.title)
        .join(", ")}.`;
      const response = await aiService.getChatResponse(message);
      return { suggestions: response };
    },

    sendMessageToAI: async (_, { message }, { dataSources, userId }) => {
      const { aiService } = dataSources;
      if (!aiService) throw new Error("AI service is not available");

      const reply = await aiService.getChatResponse(message);
      await aiService.saveConversation(userId || "anonymous", message, reply);
      return { reply };
    },

    getListingInfo: async (_, { listingTitle }, { dataSources, userId }) => {
      const listingData = await Listing.findOne({ title: listingTitle }).exec();
      if (!listingData) throw new Error(`Listing "${listingTitle}" not found`);

      const bookings =
        userId && listingData.bookings.some((b) => b.guestId === userId)
          ? listingData.bookings
          : null;
      const currentlyBookedDates =
        userId && listingData.bookings.some((b) => b.guestId === userId)
          ? listingData.currentlyBookedDates
          : null;

      return {
        ...listingData.toObject(),
        bookings,
        currentlyBookedDates,
      };
    },

    // AIService-specific queries
    suggestTitleImprovements: async (_, { listingId }) => {
      return callPython("/api/listing/suggest", { listingId });
    },

    generateDescriptionSuggestions: async (_, { listingId }) => {
      return callPython("/api/description/suggest", { listingId });
    },

    getPerformanceTips: async (_, { bookingId }) => {
      return callPython("/api/performance/tips", { bookingId });
    },
  },

  Mutation: {
    // Minimal subgraph mutations
    applyTitleSuggestion: async (_, { listingId }, { dataSources }) => {
      const data = await callPython("/api/listing/suggest", { listingId });
      const updatedListing = await dataSources.listingService.updateListingTitle(
        listingId,
        data.suggestion
      );
      return { suggestion: updatedListing.title };
    },

  applyDescriptionSuggestion: async (_, { listingId }, { dataSources }) => {
      console.log(`Sending request to Python with listingId: ${listingId}`);
  try {
    const data = await callPython("/api/description/suggest", { listingId });
      console.log(`Python response for listingId ${listingId}: ${JSON.stringify(data)}`);

    if (!data?.suggestion || data.suggestion === 'Default suggestion') {
      throw new Error('Invalid suggestion from Python service');
    }

    const updatedListing = await dataSources.listingService.updateListingDescription(
      listingId,
      data.suggestion
    );
    return { suggestion: updatedListing.description };
  } catch (error) {
    logger.error(`Error in applyDescriptionSuggestion: ${error.message}`);
    throw new Error('Failed to apply description suggestion');
  }
},


    replyToReview: async (_, { reviewId, reviewText }) => {
      return callPython("/review/reply", { reviewId, reviewText });
    },

    // AIService-specific mutations
    generateReplyToReview: async (_, { reviewId }) => {
      return callPython("/review/reply", { reviewId });
    },

    suggestTitleImprovements: async (_, { listingId }) => {
      console.log(`Sending request to Python with listingId: ${listingId}`);
        const data = await callPython("/listing/suggest", {  listingId });

  // Wrap single suggestion into an array for GraphQL
  return {
    suggestions: [data.suggestion], 
  };
    },

    applyTitleSuggestionWithReview: async (_, { listingId, reviewId }) => {
      console.log(`Sending request to Python with listingId: ${listingId}`);
      console.log(`Sending request to Python with reviewId: ${reviewId}`);
      return callPython("/listing/suggest", { listingId, reviewId });
    },

    saveDescriptionSuggestions: async (_, { listingId }) => {
      console.log(`Sending request to Python with listingId: ${listingId}`);
      return callPython("/description/suggest", { listingId });
    },

    draftReplyToReview: async (_, { reviewId, suggestion }) => {
      console.log(`Sending request to Python with reviewId: ${reviewId}`);

      console.log(`Sending request to Python with suggestion: ${suggestion}`);
      const data = await callPython("/review/reply", {
        reviewId,
        reviewText: suggestion,
      });
      return !!data.reply;
    },
  },
};

export default resolvers;