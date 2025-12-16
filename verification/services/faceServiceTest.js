import { compareFaces } from "./face.service.mjs";

const result = await compareFaces(
  "front.jpg",
  "selfie.jpg"
);

console.log("Match:", result);
