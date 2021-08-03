When writing an automated test with Jest for your React application, it's typical to mock the APIs your app communicates with to test how it handles different responses. Since you're already putting in the effort to create and maintain these mock api's wouldn't it be nice if you could use the same setup when running your App in Jest and in the browser? By using a test framework agnostic mock backend like
[MSW](https://mswjs.io/) you can. In the next section let's see what that means in practice

## Developing and testing a new feature

Let's say we have been asked to create a form that makes a POST request to a new endpoint `/api/submit` when it's submitted. Then the form shows a success message when the endpoint returns a 200, or an error message otherwise. Here's an example implementation of this feature:

```javascript
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function App() {
  const [state, setState] = useState("Pristine");
  // makes a post request to the url with the data
  function post(url, data) {
    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  }

  const { register, handleSubmit } = useForm();
  const onSubmit = (data) => {
    post("/api/submit", data).then((resp) => {
      resp.status === 200 ? setState("Success") : setState("Error");
    });
  };

  return (
    <>
      State: {state}
      <form onSubmit={handleSubmit(onSubmit)}>
        <input defaultValue="test" {...register("example")} />
        <br />
        <button type="submit">submit</button>
      </form>
    </>
  );
}
```

Great now let's write some tests for it:

```javascript
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
```

We implemented our feature then we wrote some tests to make sure it has the intended behavior. However, wouldn't it be nice to look at this feature in the browser to see how it actually looks? This is a user interface after all! The problem is how do we get our application in the same state in our browser as it is in our tests?

## Extracting setup so it can be used by Jest and the browser

One solution would be to extract our mock server setup to functions and share them across contexts. Let's create some mock server setup functions

```javascript
import { rest } from "msw";

export function happyPath(server) {
  server.use(
    rest.post("*/api/submit", (req, res, ctx) => {
      return res(ctx.status(200));
    })
  );
}

export function errorPath(server) {
  server.use(
    rest.post("*/api/submit", (req, res, ctx) => {
      return res(ctx.status(500));
    })
  );
}
```

now we can refactor our tests to use these new functions:

```javascript
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
```

Finally we can now temporarily setup a mock server in our App component and use one of the setup functions.

```javascript
import { setupWorker } from "msw";
import { happyPath } from "./mock-backend/mock-scenarios";

export default function App() {
  useEffect(() => {
    const worker = setupWorker();
      happyPath(worker);
      worker.start();
  }, []);
  const [state, setState] = useState("Pristine");
  // makes a post request to the url with the data
  function post(url, data) {
  //...rest of component
```

Now we can run our application in the browser, and it will be in the exact same state as it is at the beginning of our tests. We can do some manual QA and make sure we haven't made a mistake in our test.
![Success Path](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/s4rq3wb9c9f59mbih9ym.gif)
Looks good, now let's change our setup to the error scenario by editing the useEffect code:

```javascript
useEffect(() => {
  const worker = setupWorker();
  //change happyPath to errorPath
  errorPath(worker);
  worker.start();
}, []);
```

![Error Path](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/wzj40fleoiothaf6m0rc.gif)

That looks good as well. Now would be a good time to add some styling to these different states now that we're sure they will appear correctly.

## Example Workflows

- Jest tests run in the node, which makes them fast and reliable, but can make them difficult to create and debug. You can begin by writing a mock scenario, and using it to develop a feature in the browser. Then use that same mock scenario to write a test for the feature you just developed.

- Say you are having difficulty debugging a Jest test another developer wrote. You can use the mock scenario in the browser, then manually follow the steps of the test until you encounter unexpected behavior.

- Use a mock scenario to get your app into a difficult to reproduce state, then add styles.

## Conclusion

Decoupling your mock backend from your tests will help you write better tests and power up your development experience. As long as you've written a test for a behavior you will always be able to quickly replicate it in the browser. The best part? It takes very little additional developer effort. This allows you to derive a TON of extra value from resources you already have.
