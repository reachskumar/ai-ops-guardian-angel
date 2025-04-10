
import React from "react";
import AppProvider from "./AppProvider";
import Routes from "./Routes"; // This matches the case of the file

const App = () => {
  return (
    <AppProvider>
      <Routes />
    </AppProvider>
  );
};

export default App;
