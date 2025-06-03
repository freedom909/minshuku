import { GraphQLError } from "graphql";
import validateInviteCode from "./validateInvitecode.js";   
  const validateHostInviteCode = async (inviteCode) => {
    if (!inviteCode) {
      throw new GraphQLError("Invite code is required for HOST role", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }
    const isValid = await validateInviteCode(inviteCode);
    if (!isValid) {
      throw new GraphQLError("Invalid invite code", {
        extensions: { code: "INVALID_INVITE_CODE", inviteCode },
      });
    }
  };
  
 export default validateHostInviteCode;
  