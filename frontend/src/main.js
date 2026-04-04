import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import "./i18n/i18n";
import "leaflet/dist/leaflet.css";

if (typeof globalThis.global === "undefined") {
  globalThis.global = globalThis;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  React.createElement(
    BrowserRouter,
    null,
    React.createElement(App),
  ),
);
