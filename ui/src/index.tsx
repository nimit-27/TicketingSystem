import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import "./fci-index.scss";
// import './index.scss';
import "bootstrap/dist/css/bootstrap.min.css";
import "antd/dist/reset.css"; // for antd v5+
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { SnackbarProvider } from "./context/SnackbarContext";
import CustomThemeProvider from "./context/ThemeContext";
import LanguageProvider from "./context/LanguageContext";
import "./i18n";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <CustomThemeProvider>
          <SnackbarProvider>
            <App />
          </SnackbarProvider>
        </CustomThemeProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

reportWebVitals();
