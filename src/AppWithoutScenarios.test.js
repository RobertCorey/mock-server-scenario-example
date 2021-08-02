import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { setupServer } from "msw/node";
import { rest } from "msw";
import App from "./App";

const server = setupServer();
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
test("it submits the form and displays a success message", async () => {
  server.use(
    rest.post("*/api/submit", (req, res, ctx) => {
      return res(ctx.status(200));
    })
  );
  render(<App />);
  screen.getByText("State: Pristine");
  userEvent.click(screen.getByText("submit"));
  await waitFor(() => screen.getByText("State: Success"));
});

test("it submits the form and displays an error message", async () => {
  server.use(
    rest.post("*/api/submit", (req, res, ctx) => {
      return res(ctx.status(500));
    })
  );
  render(<App />);
  screen.getByText("State: Pristine");
  userEvent.click(screen.getByText("submit"));
  await waitFor(() => screen.getByText("State: Error"));
});
