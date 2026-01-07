import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import styles from "./index.css?inline";

class MyWidget extends HTMLElement {
  connectedCallback() {
    console.log("🔥 widget.js loaded");
    const shadow = this.attachShadow({ mode: "open" });

    // Inject Tailwind CSS into shadow root
    const style = document.createElement("style");
    style.textContent = styles;
    shadow.appendChild(style);

    const mount = document.createElement("div");
    shadow.appendChild(mount);

    ReactDOM.createRoot(mount).render(
      <App apiKey={this.getAttribute("api-key")} />
    );
  }
}

customElements.define("my-widget", MyWidget);
