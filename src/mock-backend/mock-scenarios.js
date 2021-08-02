import { rest } from "msw";

export function happyPath(server) {
  server.use(
    rest.post("*/api/submit", (req, res, ctx) => {
      return res(ctx.status(200));
    })
  );
}
