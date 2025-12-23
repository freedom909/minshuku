

import { GraphQLError } from "graphql";

const logger = {
  info: (message, data) => {
    console.log(`[INFO] ${message}`, data || "");
  },
  error: (message, error) => {
    console.error(`[ERROR] ${message}`, error);
  },
  debug: (message, data) => {
    console.log(`[DEBUG] ${message}`, data || "");
  },
};



/**
 * =========================
 * Entity Resolvers
 * =========================
 */
const resolveUserEntity = async (ref, container, roleFallback) => {
  const userService = container.resolve("userService");
  const u = await userService.localAuthService.getUserById(ref.id);
  if (!u) return null;

  const id = u._id?.toString?.() ?? u.id ?? ref.id;
  const name = u.fullName || u.name || "";
  const firstName = u.firstName || name.split(" ")[0] || "";
  const lastName = u.lastName || name.split(" ").slice(1).join(" ") || "";
  const nickname = u.nickname || name || "User";

  return {
    __typename: roleFallback,
    id,
    email: u.email,
    fullName: name,
    firstName,
    lastName,
    nickname,
    picture: u.picture || "",
    role: u.role || roleFallback,
    provider: u.provider || null,
    oauthId: u.oauthId || null,
    description: u.description || "",
  };
};

const resolvers = {
  /**
   * =========================
   * Federation
   * =========================
   */
  User: {
    __resolveType(obj) {
      if (!obj?.role) return null;
      if (obj.role === "HOST") return "Host";
      if (obj.role === "GUEST") return "Guest";
      return null;
    },
  },

  Host: {
    __resolveReference(ref, { container }) {
      return resolveUserEntity(ref, container, "Host");
    },
  },

  Guest: {
    __resolveReference(ref, { container }) {
      return resolveUserEntity(ref, container, "Guest");
    },
  },

  /**
   * =========================
   * Queries
   * =========================
   */
  Query: {
    _health: () => "ok",
  },

  /**
   * =========================
   * Mutations
   * =========================
   */
  Mutation: {
    /**
     * 🔥 OAuth 登录（NextAuth 专用）
     * - 前端永远不知道 JWT
     * - accessToken 只存在于 backend
     */
    oauthLogin: async (_, { input }, context) => {
      const { container, accessToken } = context;

      if (!accessToken) {
        throw new GraphQLError("Missing OAuth access token", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      return container.resolve("oauthLoginAdapter").login({ // "TypeError: Cannot read properties of undefined (reading 'resolve')",
        provider: input.provider,
        providerAccountId: input.providerAccountId,
        accessToken,
      });
    },

    /**
     * 本地账号登录（email / password）
     */
    signIn: async (_, { input }, { container }) => {
      const { email, password } = input;

      if (!email || !password) {
        throw new GraphQLError("Invalid credentials", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const userService = container.resolve("userService");

      try {
        const result = await userService.localAuthService.login(
          email,
          password
        );

        return {
          success: true,
          message: "Login success",
          auth: {
            token: result.token,
            userId: result.userId,
            role: result.role,
          },
          refreshToken: result.refreshToken,
          userId: result.userId,
          role: result.role,
        };
      } catch (err) {
        throw new GraphQLError("Invalid email or password", {
          extensions: { code: "INVALID_CREDENTIALS" },
        });
      }
    },

    /**
     * 注册
     */
    signUp: async (_, { input }, { container }) => {
      const { email, password, name, nickname, role, picture } = input;

      const userService = container.resolve("userService");

      try {
        const result = await userService.localAuthService.register(
          email,
          password,
          name,
          nickname,
          role,
          picture
        );

        return {
          success: true,
          message: "Registration successful",
          userId: result.user.id,
          role: result.user.role,
        };
      } catch (err) {
        throw new GraphQLError(err.message || "Registration failed", {
          extensions: { code: "SIGNUP_FAILED" },
        });
      }
    },
  },
};

export default resolvers;
