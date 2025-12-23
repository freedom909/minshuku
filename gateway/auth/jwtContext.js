// gateway/auth/jwtContext.js
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

const client = jwksClient({
  jwksUri: "http://subgraph-auth/.well-known/jwks.json",
  cache: true,
  rateLimit: true,
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
      return;
    }
    callback(null, key.getPublicKey());
  });
}

export async function buildContext({ req }) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return { user: null };
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, getKey, {
      algorithms: ["RS256"],
    });

    if (decoded.typ !== "access") {
      throw new Error("Invalid token type");
    }

    return {
      user: {
        userId: decoded.sub,
        role: decoded.role,
      },
    };
  } catch (err) {
    return { user: null };
  }
}
