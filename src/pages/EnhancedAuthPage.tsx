
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader, AlertTriangle, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { enhancedAuthService } from "@/services/enhancedAuthService";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";
import PasswordResetForm from "@/components/auth/PasswordResetForm";

const EnhancedAuthPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // Check for existing session on mount and redirect if found
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/", { replace: true });
      }
    };
    
    checkSession();
  }, [navigate]);

  // Handle OAuth callback
  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data.session) {
        toast({
          title: "Welcome!",
          description: "You have successfully signed in.",
        });
        navigate("/", { replace: true });
      } else if (error) {
        toast({
          title: "Authentication Error",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    // Check if this is an OAuth callback
    if (searchParams.get('code')) {
      handleAuthCallback();
    }
  }, [searchParams, navigate, toast]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/`
        },
      });

      if (error) throw error;
      
      toast({
        title: "Account created successfully!",
        description: "Please check your email to verify your account.",
      });
      
      // If auto-confirm is enabled, this will contain a session
      if (data.session) {
        navigate("/", { replace: true });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    try {
      const result = await enhancedAuthService.signInWithEmail(email, password);
      
      if (result.success) {
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
        navigate("/", { replace: true });
      } else {
        toast({
          title: "Sign In Failed",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (showResetForm) {
    return <PasswordResetForm />;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">AI DevOps Guardian</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleSignIn} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
                </Button>

                <Button
                  type="button"
                  variant="link"
                  onClick={() => setShowResetForm(true)}
                  className="w-full text-sm"
                >
                  <LinkIcon className="mr-1 h-3 w-3" />
                  Forgot your password?
                </Button>
              </form>

              <div className="mt-6">
                <SocialLoginButtons />
              </div>

              <Alert className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Your account will be temporarily locked after 5 failed login attempts for security.
                </AlertDescription>
              </Alert>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleSignUp} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="johndoe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
                </Button>
              </form>

              <div className="mt-6">
                <SocialLoginButtons />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default React.memo(EnhancedAuthPage);
