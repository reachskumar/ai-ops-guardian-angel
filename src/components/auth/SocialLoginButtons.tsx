
import React from 'react';
import { Button } from '@/components/ui/button';
import { Github, Mail } from 'lucide-react';
import { enhancedAuthService } from '@/services/enhancedAuthService';
import { useToast } from '@/hooks/use-toast';

const SocialLoginButtons: React.FC = () => {
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    const result = await enhancedAuthService.signInWithGoogle();
    if (!result.success) {
      toast({
        title: "Google Sign In Failed",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const handleGitHubSignIn = async () => {
    const result = await enhancedAuthService.signInWithGitHub();
    if (!result.success) {
      toast({
        title: "GitHub Sign In Failed",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={handleGoogleSignIn}
          className="w-full"
        >
          <Mail className="mr-2 h-4 w-4" />
          Google
        </Button>
        <Button
          variant="outline"
          onClick={handleGitHubSignIn}
          className="w-full"
        >
          <Github className="mr-2 h-4 w-4" />
          GitHub
        </Button>
      </div>
    </div>
  );
};

export default SocialLoginButtons;
