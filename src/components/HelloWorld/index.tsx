import { CHAIN_NAME, PRETTY_NAME } from "@/constants";
import "./HelloWorld.css";
import { Component } from "solid-js";

export const HelloWorld: Component<{ msg: string }> = ({ msg }) => {
  return (
    <>
      <div class="greetings">
        <h1 class="green">{msg}</h1>
        <h3>
          You’ve successfully created a project with
          {" "}
          <a href="https://vitejs.dev/" target="_blank" rel="noopener">
            Vite
          </a>{" "}
          + {" "}
          <a href="https://vuejs.org/" target="_blank" rel="noopener">
            Solid
          </a>{" "}
          on the{" "}
          <span id="chain-name">
            {PRETTY_NAME} {CHAIN_NAME}
          </span>{" "}
          network. What's next?
        </h3>
      </div>
    </>
  );
};
