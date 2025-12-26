// resolvers/Mutation/oauthLogin.js
export default async (_, { provider, payload }, { container, res }) => {
  console.log("🚀 container:", container);
  const { user, accessToken, refreshToken } =
    await container.resolve("oauthService").login(
    provider,
    payload
    );

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/refresh",
    maxAge: 30 * 86400000,
  });

  return { user, accessToken, refreshToken };
};
