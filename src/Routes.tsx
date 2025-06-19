
import React from "react";
import { useRoutes } from "react-router-dom";
import routes from "./routeConfig";

const Routes = () => {
  const routeElements = useRoutes(routes);
  return <>{routeElements}</>;
};

export default Routes;
