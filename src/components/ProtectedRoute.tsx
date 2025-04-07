
import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@/services/authService";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, loading, profile } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  
  // Check user role against required role
  const hasRequiredRole = () => {
    if (!requiredRole) return true; // No specific role required
    
    const roleHierarchy = ['viewer', 'operator', 'developer', 'admin'];
    
    if (!profile?.role) {
      return false;
    }
    
    const userRoleIndex = roleHierarchy.indexOf(profile.role);
    const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);
    
    return userRoleIndex >= requiredRoleIndex;
  };
  
  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access this page",
        variant: "destructive",
      });
    } else if (!loading && user && requiredRole && !hasRequiredRole()) {
      toast({
        title: "Permission Denied",
        description: `You need ${requiredRole} access to view this page`,
        variant: "destructive",
      });
    }
  }, [loading, user, requiredRole, toast]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Save the attempted location for redirect after login
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  if (requiredRole && !hasRequiredRole()) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default React.memo(ProtectedRoute);
