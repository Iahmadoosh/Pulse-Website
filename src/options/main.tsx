import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { OptionsTrainerApp } from "./OptionsTrainerApp";
import "./options.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <OptionsTrainerApp />
  </StrictMode>,
);
