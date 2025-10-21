// passwordHasher.js
import bcrypt from "bcrypt";

export default {
  hash: (password) => bcrypt.hash(password, 10),
  compare: (password, hash) => bcrypt.compare(password, hash),
};
