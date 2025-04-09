
import React from "react";
import AppProvider from "./AppProvider";
import AppRoutes from "./routes";

const App = () => (
  <AppProvider>
    <AppRoutes />
  </AppProvider>
);

export default App;
