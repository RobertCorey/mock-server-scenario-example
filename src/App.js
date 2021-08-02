import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import worker from "./mock-backend/browser";
import { happyPath } from "./mock-backend/mock-scenarios";

export default function App() {
  useEffect(() => {
    happyPath(worker);
    worker.start();
  }, []);
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
    post("/api/submit", data)
      .then((_) => setState("Success"))
      .catch(() => setState("Error"));
  };

  return (
    <>
      State: {state}
      <form onSubmit={handleSubmit(onSubmit)}>
        <input defaultValue="test" {...register("example")} />
        <br />
        <input type="submit" />
      </form>
    </>
  );
}
