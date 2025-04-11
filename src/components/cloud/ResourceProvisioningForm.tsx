
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CloudProvider, CloudAccount, provisionResource } from "@/services/cloud";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertTriangle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getAccountCredentials } from "@/services/cloud/accountService";

// Import our components
import {
  ResourceNameField,
  ResourceTypeSelector,
  SizeSelector,
  RegionSelector,
  TagsField,
  AccountSelector
} from "./provisioning";

// Define the schema for the form
const resourceSchema = z.object({
  accountId: z.string().min(1, "Please select an account"),
  name: z.string().min(3, "Resource name must be at least 3 characters"),
  type: z.string().min(1, "Please select a resource type"),
  size: z.string().min(1, "Please select a size"),
  region: z.string().min(1, "Please select a region"),
  tags: z.string().optional(),
});

type ResourceFormValues = z.infer<typeof resourceSchema>;

interface ResourceProvisioningFormProps {
  accounts: CloudAccount[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ResourceProvisioningForm: React.FC<ResourceProvisioningFormProps> = ({
  accounts,
  onSuccess,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("compute");
  const [selectedProvider, setSelectedProvider] = useState<CloudProvider>("aws");
  const [provisioningError, setProvisioningError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const form = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      accountId: "",
      name: "",
      type: "",
      size: "",
      region: "",
      tags: "",
    },
  });

  // Reset error when form values change
  useEffect(() => {
    setProvisioningError(null);
  }, [form.watch()]);
  
  // Update provider when account changes
  useEffect(() => {
    const accountId = form.watch("accountId");
    if (accountId) {
      const account = accounts.find(acc => acc.id === accountId);
      if (account) {
        setSelectedProvider(account.provider);
        
        // Reset type, size, and region when provider changes
        form.setValue("type", "");
        form.setValue("size", "");
        form.setValue("region", "");
      }
    }
  }, [form.watch("accountId"), accounts]);

  const handleSubmit = async (data: ResourceFormValues) => {
    setIsSubmitting(true);
    setProvisioningError(null);
    
    try {
      // Parse tags string into an object
      const tagsObj: Record<string, string> = {};
      if (data.tags) {
        data.tags.split(",").forEach(tag => {
          const [key, value] = tag.trim().split("=");
          if (key && value) {
            tagsObj[key] = value;
          }
        });
      }
      
      // Prepare config for the resource
      const resourceConfig = {
        name: data.name,
        size: data.size,
        region: data.region,
        tags: tagsObj,
      };
      
      console.log(`Provisioning resource on account ${data.accountId}`);
      console.log("Resource type:", data.type);
      console.log("Resource config:", resourceConfig);
      
      // Get account credentials
      const credentials = getAccountCredentials(data.accountId);
      
      if (!credentials && selectedProvider === 'gcp') {
        throw new Error("No GCP credentials found for this account. Please verify your account configuration.");
      }
      
      // Call the provisioning API with credentials
      const result = await provisionResource(data.accountId, data.type, resourceConfig, credentials);
      
      if (result.success) {
        toast({
          title: "Resource provisioning initiated",
          description: `${data.type} resource "${data.name}" is being created.`,
        });
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        console.error("Provisioning failed:", result.error);
        setProvisioningError(result.error || "Failed to provision resource");
        
        toast({
          title: "Provisioning failed",
          description: result.error || "Failed to provision resource",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Resource provisioning error:", error);
      setProvisioningError(error.message || "There was an error provisioning your resource");
      
      toast({
        title: "Provisioning failed",
        description: error.message || "There was an error provisioning your resource",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show message if no accounts available
  if (accounts.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Provision New Resource</CardTitle>
          <CardDescription>
            You need to connect a cloud provider account first
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-muted-foreground">
            Please connect a cloud provider account to provision resources
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={onCancel} className="w-full">Close</Button>
        </CardFooter>
      </Card>
    );
  }

  // Filter accounts to only show those with the provider we support
  const availableAccounts = accounts.filter(account => 
    ['aws', 'azure', 'gcp'].includes(account.provider)
  );

  // Helper function to check if an account has credentials for GCP
  const hasGcpCredentials = (accountId: string) => {
    const credentials = getAccountCredentials(accountId);
    return !!credentials?.serviceAccountKey;
  };

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="compute">Compute</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
        </TabsList>
        
        {["compute", "storage", "database", "network"].map((category) => (
          <TabsContent key={category} value={category}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {provisioningError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Provisioning Failed</AlertTitle>
                  <AlertDescription>
                    {provisioningError}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-4">
                <AccountSelector
                  accounts={availableAccounts}
                  value={form.watch("accountId")}
                  onChange={(value) => form.setValue("accountId", value)}
                  error={form.formState.errors.accountId?.message}
                />
                
                {selectedProvider === 'gcp' && form.watch("accountId") && !hasGcpCredentials(form.watch("accountId")) && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>GCP Credentials Required</AlertTitle>
                    <AlertDescription>
                      This account needs a GCP service account key for provisioning. 
                      Please ensure you've uploaded a valid service account key during account setup.
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <ResourceNameField 
                    value={form.watch("name")} 
                    onChange={(e) => form.setValue("name", e.target.value)}
                    error={form.formState.errors.name?.message}
                  />
                  
                  <ResourceTypeSelector
                    provider={selectedProvider}
                    category={category}
                    value={form.watch("type")}
                    onChange={(value) => form.setValue("type", value)}
                    error={form.formState.errors.type?.message}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <SizeSelector
                    provider={selectedProvider}
                    resourceType={form.watch("type")}
                    value={form.watch("size")}
                    onChange={(value) => form.setValue("size", value)}
                    error={form.formState.errors.size?.message}
                  />
                  
                  <RegionSelector
                    provider={selectedProvider}
                    value={form.watch("region")}
                    onChange={(value) => form.setValue("region", value)}
                    error={form.formState.errors.region?.message}
                  />
                </div>
                
                <TagsField
                  value={form.watch("tags") || ""}
                  onChange={(e) => form.setValue("tags", e.target.value)}
                />
              </div>
              
              <div className="flex justify-between pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !form.formState.isValid}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Provisioning...
                    </>
                  ) : (
                    "Provision Resource"
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ResourceProvisioningForm;
