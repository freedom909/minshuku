import User from "../../services/models/user.js";
import { addVerificationJob } from "../mq/verificationQueue.js";
import { GraphQLError } from "graphql";

const identityResolvers = {
  Mutation: {
    becomeHost: async (_, { input }, { userId }) => {
      if (!userId) {
        throw new GraphQLError("Unauthorized", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const { frontKey, backKey, selfieKey } = input;

      if (!frontKey || !backKey || !selfieKey) {
        throw new GraphQLError(
          "frontKey, backKey, and selfieKey are required.",
          { extensions: { code: "BAD_USER_INPUT" } }
        );
      }

      const user = await User.findById(userId);

      if (!user) {
        return { success: false, message: "User not found" };
      }

      // Must be guest
      if (user.role !== "guest") {
        return {
          success: false,
          message: "Only guests can apply to become hosts.",
        };
      }

      // Prevent double submission
      if (user.hostStatus === "pending") {
        return {
          success: false,
          message: "Your verification is already submitted and pending review.",
        };
      }

      // Save verification
      user.hostVerification = {
        frontKey,
        backKey,
        selfieKey,
        submittedAt: new Date(),
      };

      user.hostStatus = "pending"; // consistent state
      await user.save();

      // Add verification job to queue
      await addVerificationJob({
        userId,
        frontKey,
        backKey,
        selfieKey,
      });

      return {
        success: true,
        message: "Verification submitted. We'll notify you upon completion.",
      };
    },
  },
};

export default identityResolvers;
