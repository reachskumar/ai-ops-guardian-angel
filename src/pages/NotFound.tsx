
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Construction, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  // Check if this is a known route under construction
  const knownRoutes = [
    { path: "/monitoring", name: "Monitoring" },
    { path: "/iam", name: "Identity and Access Management" },
    { path: "/settings", name: "Settings" },
    { path: "/databases", name: "Databases" },
    // Removed Cost Analysis from the under construction routes
  ];

  const currentRoute = knownRoutes.find(route => route.path === location.pathname);
  const isUnderConstruction = !!currentRoute;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md px-4">
        {isUnderConstruction ? (
          <>
            <Construction className="h-16 w-16 mx-auto text-amber-500 mb-4" />
            <h1 className="text-4xl font-bold mb-2">Coming Soon</h1>
            <p className="text-xl text-muted-foreground mb-6">
              The {currentRoute.name} page is currently under construction and will be available soon.
            </p>
          </>
        ) : (
          <>
            <AlertTriangle className="h-16 w-16 mx-auto text-red-500 mb-4" />
            <h1 className="text-4xl font-bold mb-2">404</h1>
            <p className="text-xl text-muted-foreground mb-6">
              Oops! The page you're looking for doesn't exist.
            </p>
          </>
        )}
        
        <Button asChild>
          <Link to="/" className="inline-flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" /> Return to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
