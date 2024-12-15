import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // Import Tailwind CSS
import { ApolloProvider } from "@apollo/client";
import client from "./apolloClient";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
    ,
  </React.StrictMode>
);
