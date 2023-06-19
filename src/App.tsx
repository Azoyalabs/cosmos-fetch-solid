import type { Component } from "solid-js";

import logo from "./logo.svg";
import { Router, Route, Routes, A } from "@solidjs/router";
import { HelloWorld } from "./components/HelloWorld";

import "./App.css";
import { HomeView } from "./views/HomeView/HomeView";
import { AboutView } from "./views/AboutView/AboutView";
const App: Component = () => {
  return (
    <>
      <Router>
        <header>
          <img
            alt="Solid logo"
            class="logo"
            src={logo}
            width="120"
            height="120"
          />

          <div class="wrapper">
            <HelloWorld msg="Welcome to Web3!"></HelloWorld>
            <nav>
              <A href={"/"}>Home</A>
              <A href={"/about"}>About</A>
            </nav>
          </div>
        </header>
        <Routes>
          <Route path="/" component={HomeView}></Route>
          <Route path="/about" component={AboutView}></Route>
        </Routes>
      </Router>
    </>
  );
};

export default App;
