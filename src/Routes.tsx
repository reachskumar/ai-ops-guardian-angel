
import React from "react";
import { useRoutes } from "react-router-dom";
import routes from "./Routes"; // Updated import to match the new filename

const Routes = () => {
  const routeElements = useRoutes(routes);
  return <>{routeElements}</>;
};

export default Routes;
