import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CloudProvider, CloudAccount, provisionResource } from "@/services/cloud";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getAccountCredentials } from "@/services/cloud/accountService";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Import our components
import {
  GcpCredentialStatus
} from "./provisioning";
import { getRegions, getInstanceSizes, getResourceTypes } from "@/services/cloud/providerFactory";

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
  const [gcpCredentialStatus, setGcpCredentialStatus] = useState<'valid' | 'invalid' | 'missing' | 'unknown' | 'loading'>('unknown');
  const [gcpErrorMessage, setGcpErrorMessage] = useState<string | undefined>(undefined);
  const [accountCredentials, setAccountCredentials] = useState<Record<string, Record<string, string> | null>>({});
  const { toast } = useToast();
  
  const form = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceSchema),
    mode: "onChange",
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
        form.setValue("type", "", { shouldValidate: true });
        form.setValue("size", "", { shouldValidate: true });
        form.setValue("region", "", { shouldValidate: true });
        
        // Clear all errors and force revalidation
        form.clearErrors();
        setTimeout(() => {
          form.trigger();
        }, 100);
        
        // Check GCP credentials if applicable
        if (account.provider === 'gcp') {
          validateGcpCredentials(accountId);
        } else {
          setGcpCredentialStatus('unknown');
          setGcpErrorMessage(undefined);
        }
      }
    }
  }, [form.watch("accountId"), accounts, form]);

  // Load credentials for the selected account
  useEffect(() => {
    const accountId = form.watch("accountId");
    if (accountId && !accountCredentials[accountId]) {
      setGcpCredentialStatus('loading');
      getAccountCredentials(accountId)
        .then(credentials => {
          setAccountCredentials(prev => ({
            ...prev,
            [accountId]: credentials
          }));
          
          if (selectedProvider === 'gcp') {
            validateGcpCredentialsSync(credentials);
          }
        })
        .catch(error => {
          console.error("Error loading credentials:", error);
          setGcpCredentialStatus('invalid');
          setGcpErrorMessage("Failed to load credentials");
        });
    }
  }, [form.watch("accountId")]);

  // Validate GCP credentials
  const validateGcpCredentials = async (accountId: string) => {
    try {
      setGcpCredentialStatus('loading');
      
      // If we already have credentials for this account, use them
      if (accountCredentials[accountId]) {
        validateGcpCredentialsSync(accountCredentials[accountId]);
        return;
      }
      
      // Otherwise fetch them
      const credentials = await getAccountCredentials(accountId);
      setAccountCredentials(prev => ({
        ...prev,
        [accountId]: credentials
      }));
      
      validateGcpCredentialsSync(credentials);
    } catch (error) {
      console.error("Error validating GCP credentials:", error);
      setGcpCredentialStatus('invalid');
      setGcpErrorMessage("Error validating GCP credentials");
    }
  };
  
  // Synchronous validation logic for GCP credentials
  const validateGcpCredentialsSync = (credentials: Record<string, string> | null) => {
    if (!credentials || !credentials.serviceAccountKey) {
      setGcpCredentialStatus('missing');
      return false;
    }
    
    // Validate the service account key format
    try {
      const keyData = typeof credentials.serviceAccountKey === 'string' 
        ? JSON.parse(credentials.serviceAccountKey)
        : credentials.serviceAccountKey;
      
      // Check for required fields
      const requiredFields = ['type', 'project_id', 'private_key_id', 'private_key', 'client_email', 'client_id'];
      const missingFields = requiredFields.filter(field => !keyData[field]);
      
      if (missingFields.length > 0) {
        setGcpCredentialStatus('invalid');
        setGcpErrorMessage(`Invalid service account key: missing ${missingFields.join(', ')}`);
        return false;
      }
      
      if (keyData.type !== 'service_account') {
        setGcpCredentialStatus('invalid');
        setGcpErrorMessage("Invalid credential type: must be a service account key");
        return false;
      }
      
      // Credentials look valid
      setGcpCredentialStatus('valid');
      setGcpErrorMessage(undefined);
      return true;
    } catch (parseError) {
      setGcpCredentialStatus('invalid');
      setGcpErrorMessage("Invalid service account key format. Please ensure it's valid JSON");
      return false;
    }
  };

  const handleSubmit = async (data: ResourceFormValues) => {
    setIsSubmitting(true);
    setProvisioningError(null);
    
    try {
      const accountId = data.accountId;
      let credentials = accountCredentials[accountId];
      
      // If credentials are not loaded yet, fetch them
      if (!credentials) {
        credentials = await getAccountCredentials(accountId);
        setAccountCredentials(prev => ({
          ...prev,
          [accountId]: credentials
        }));
      }
      
      // Check if GCP account has credentials first
      if (selectedProvider === 'gcp') {
        const isValid = validateGcpCredentialsSync(credentials);
        if (!isValid) {
          throw new Error(gcpErrorMessage || "Missing or invalid GCP service account key");
        }
      }
      
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
        type: data.type,
        size: data.size,
        region: data.region,
        tags: tagsObj,
      };
      
      console.log(`Provisioning resource on account ${data.accountId}`);
      console.log("Resource type:", data.type);
      console.log("Resource config:", resourceConfig);
      
      // Call the provisioning API with only accountId and resourceConfig (2 arguments)
      const result = await provisionResource(data.accountId, resourceConfig);
      
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

  // Helper function to check if an account has credentials for GCP
  const hasGcpCredentials = (accountId: string) => {
    return !!accountCredentials[accountId]?.serviceAccountKey;
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
            <Form {...form}>
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
                  {/* Account Selector */}
                  <FormField
                    control={form.control}
                    name="accountId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cloud Account</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select cloud account" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableAccounts.map((account) => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.name} ({account.provider.toUpperCase()})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {selectedProvider === 'gcp' && form.watch("accountId") && (
                    <GcpCredentialStatus
                      hasCredentials={hasGcpCredentials(form.watch("accountId"))}
                      accountId={form.watch("accountId")}
                      credentialStatus={gcpCredentialStatus}
                      errorMessage={gcpErrorMessage}
                    />
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Resource Name */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Resource Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter resource name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Resource Type */}
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => {
                        const resourceTypesData = getResourceTypes(selectedProvider, category);
                        const resourceTypes = resourceTypesData.length > 0 ? resourceTypesData[0]?.types || [] : [];
                        
                        return (
                          <FormItem>
                            <FormLabel>Resource Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {resourceTypes.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Size Selector */}
                    <FormField
                      control={form.control}
                      name="size"
                      render={({ field }) => {
                        const sizes = form.watch("type") ? getInstanceSizes(selectedProvider, form.watch("type")) : [];
                        
                        return (
                          <FormItem>
                            <FormLabel>Size/Tier</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              value={field.value}
                              disabled={!form.watch("type") || sizes.length === 0}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select size" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {sizes.map((size) => (
                                  <SelectItem key={size.id} value={size.id}>
                                    {size.name} ({size.vcpus} vCPUs, {size.memory} GB RAM)
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                    
                    {/* Region Selector */}
                    <FormField
                      control={form.control}
                      name="region"
                      render={({ field }) => {
                        const regions = getRegions(selectedProvider);
                        
                        return (
                          <FormItem>
                            <FormLabel>Region</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select region" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {regions.map((region) => (
                                  <SelectItem key={region.id} value={region.id}>
                                    {region.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  </div>
                  
                  {/* Tags Field */}
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="key1=value1,key2=value2" 
                            {...field} 
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
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
                    disabled={isSubmitting || !form.formState.isValid || (selectedProvider === 'gcp' && gcpCredentialStatus !== 'valid')}
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
            </Form>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ResourceProvisioningForm;
