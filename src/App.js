import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import worker from "./mock-backend/browser";
import { happyPath, errorPath } from "./mock-backend/mock-scenarios";

export default function App() {
  useEffect(() => {
    if (worker) {
      errorPath(worker);
      worker.start();
    }
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
