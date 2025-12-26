// services/auth/oauth/providers/mock.provider.js
export default {
  async verify(payload) {
    console.log("🧪 Mock verify payload:", payload);

    return {
      provider: "GOOGLE",
      providerAccountId: "mock-google-123",
      email: "mockuser@gmail.com",
      name: "Mock User",
      picture: "https://example.com/avatar.png",
    };
  },
};
