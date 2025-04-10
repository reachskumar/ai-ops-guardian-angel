
import React from "react";
import { useRoutes } from "react-router-dom";
import routes from "./routes.tsx"; // Update the import with explicit .tsx extension to fix casing issue

const Routes = () => {
  const routeElements = useRoutes(routes);
  return <>{routeElements}</>;
};

export default Routes;
