// container.js (示例)
import IdentityService from "./infra/identity/identityService.js";

container.register("identityService", {
  useFactory: (c) =>
    new IdentityService(
      c.resolve("storageService"),
      c.resolve("faceService"),
      c.resolve("accountService")
    ),
});
