
import React from "react";
import AppProvider from "./AppProvider";
import { useRoutes } from "react-router-dom";
import routes from "./routes";

const App = () => {
  const routeElements = useRoutes(routes);
  
  return (
    <AppProvider>
      {routeElements}
    </AppProvider>
  );
};

export default App;
