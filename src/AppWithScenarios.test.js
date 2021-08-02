import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { setupServer } from "msw/node";
import App from "./App";
import { errorPath, happyPath } from "./mock-backend/mock-scenarios";

const server = setupServer();
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
test("it submits the form and displays a success message", async () => {
  happyPath(server);
  render(<App />);
  screen.getByText("State: Pristine");
  userEvent.click(screen.getByText("submit"));
  await waitFor(() => screen.getByText("State: Success"));
});

test("it submits the form and displays an error message", async () => {
  errorPath(server);
  render(<App />);
  screen.getByText("State: Pristine");
  userEvent.click(screen.getByText("submit"));
  await waitFor(() => screen.getByText("State: Error"));
});
