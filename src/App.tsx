
import React, { Suspense } from "react";
import AppProvider from "./AppProvider";
import AppRoutes from "./routes";

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

const App = () => (
  <AppProvider>
    <Suspense fallback={<LoadingFallback />}>
      <AppRoutes />
    </Suspense>
  </AppProvider>
);

export default App;
