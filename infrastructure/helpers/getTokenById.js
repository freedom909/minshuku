import jwt from "jsonwebtoken";

async function getTokenById(userId) {
  const user = await this.model.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const payload = {
    id: user._id,
    email: user.email,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  return token;
}

export default getTokenById;