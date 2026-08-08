import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

import {
  AuthProvider
} from "./context/AuthContext";

import {
  NotificationProvider
} from "./context/NotificationContext";

import {
  SearchProvider
} from "./context/SearchContext";

import "./styles/global.css";



ReactDOM.createRoot(

  document.getElementById("root")

).render(


  <React.StrictMode>


    <AuthProvider>


      <NotificationProvider>


        <SearchProvider>


          <App />


        </SearchProvider>


      </NotificationProvider>


    </AuthProvider>


  </React.StrictMode>


);