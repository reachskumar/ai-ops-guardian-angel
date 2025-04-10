
import React from "react";
import AppProvider from "./AppProvider";
import Routes from "./Routes";

const App = () => {
  return (
    <AppProvider>
      <Routes />
    </AppProvider>
  );
};

export default App;
