
import { useState } from 'react';
import { z } from 'zod';
import { connectCloudProvider } from '@/services/cloud';
import { useToast } from '@/hooks/use-toast';

// Define the form schema with Zod
const formSchema = z.object({
  provider: z.enum(['aws', 'azure', 'gcp'] as const),
  name: z.string().min(3, "Name must be at least 3 characters"),
  credentials: z.record(z.string())
});

export const useCloudProvider = (onSuccess?: () => void) => {
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const { toast } = useToast();

  // Handle connecting a new cloud provider
  const handleConnectProvider = async (data: z.infer<typeof formSchema>) => {
    setConnecting(true);
    console.log("Connecting provider:", data.provider);
    
    try {
      const result = await connectCloudProvider(
        data.provider,
        data.credentials,
        data.name
      );
      
      if (result.success) {
        toast({
          title: "Provider Connected",
          description: `Successfully connected to ${data.name}`,
        });
        setConnectDialogOpen(false);
        // Call the success callback if provided
        if (onSuccess) onSuccess();
      } else {
        console.error("Connection failed:", result.error);
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error("Connection error:", error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to cloud provider",
        variant: "destructive"
      });
    } finally {
      setConnecting(false);
    }
  };

  return {
    connectDialogOpen,
    setConnectDialogOpen,
    connecting,
    handleConnectProvider,
    formSchema
  };
};
