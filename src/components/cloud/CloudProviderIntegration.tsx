import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { CloudProvider, connectCloudProvider } from "@/services/cloud";
import { Check, Key, AlertCircle, Loader2 } from "lucide-react";

interface CloudProviderIntegrationProps {
  onConnect?: (success: boolean, provider: CloudProvider) => void;
}

const CloudProviderIntegration: React.FC<CloudProviderIntegrationProps> = ({ onConnect }) => {
  const [selectedProvider, setSelectedProvider] = useState<CloudProvider>("aws");
  const [isConnecting, setIsConnecting] = useState(false);
  const [formState, setFormState] = useState({
    accountName: "",
    // AWS credentials
    awsAccessKey: "",
    awsSecretKey: "",
    awsRegion: "us-east-1",
    // Azure credentials
    azureTenantId: "",
    azureClientId: "",
    azureClientSecret: "",
    azureSubscriptionId: "",
    // GCP credentials
    gcpProjectId: "",
    gcpServiceAccountKey: "",
  });
  
  const { toast } = useToast();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };
  
  const handleConnect = async () => {
    if (!formState.accountName) {
      toast({
        title: "Account name required",
        description: "Please provide a name for this cloud account",
        variant: "destructive",
      });
      return;
    }
    
    setIsConnecting(true);
    
    let credentials: Record<string, string> = {};
    
    switch (selectedProvider) {
      case "aws":
        if (!formState.awsAccessKey || !formState.awsSecretKey) {
          toast({
            title: "Missing credentials",
            description: "Please provide both Access Key ID and Secret Access Key",
            variant: "destructive",
          });
          setIsConnecting(false);
          return;
        }
        credentials = {
          accessKey: formState.awsAccessKey,
          secretKey: formState.awsSecretKey,
          region: formState.awsRegion,
        };
        break;
        
      case "azure":
        if (!formState.azureTenantId || !formState.azureClientId || 
            !formState.azureClientSecret || !formState.azureSubscriptionId) {
          toast({
            title: "Missing credentials",
            description: "Please provide all required Azure credentials",
            variant: "destructive",
          });
          setIsConnecting(false);
          return;
        }
        credentials = {
          tenantId: formState.azureTenantId,
          clientId: formState.azureClientId,
          clientSecret: formState.azureClientSecret,
          subscriptionId: formState.azureSubscriptionId,
        };
        break;
        
      case "gcp":
        if (!formState.gcpProjectId || !formState.gcpServiceAccountKey) {
          toast({
            title: "Missing credentials",
            description: "Please provide all required GCP credentials",
            variant: "destructive",
          });
          setIsConnecting(false);
          return;
        }
        credentials = {
          projectId: formState.gcpProjectId,
          serviceAccountKey: formState.gcpServiceAccountKey,
        };
        break;
    }
    
    try {
      const result = await connectCloudProvider(
        formState.accountName,
        selectedProvider,
        credentials
      );
      
      if (result.success) {
        toast({
          title: "Connection successful",
          description: `Connected to ${selectedProvider.toUpperCase()} successfully`,
        });
        if (onConnect) {
          onConnect(true, selectedProvider);
        }
      } else {
        toast({
          title: "Connection failed",
          description: result.error || "Failed to connect to cloud provider",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error connecting to cloud provider:", error);
      toast({
        title: "Connection error",
        description: "An unexpected error occurred while connecting",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const renderProviderForm = () => {
    switch (selectedProvider) {
      case "aws":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="awsAccessKey">AWS Access Key ID</Label>
              <Input
                id="awsAccessKey"
                name="awsAccessKey"
                placeholder="AKIAIOSFODNN7EXAMPLE"
                value={formState.awsAccessKey}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="awsSecretKey">AWS Secret Access Key</Label>
              <Input
                id="awsSecretKey"
                name="awsSecretKey"
                type="password"
                placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                value={formState.awsSecretKey}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="awsRegion">Default Region</Label>
              <Input
                id="awsRegion"
                name="awsRegion"
                placeholder="us-east-1"
                value={formState.awsRegion}
                onChange={handleChange}
              />
              <p className="text-xs text-muted-foreground">
                Resources from all regions will be discovered, but this will be the default for new resources
              </p>
            </div>
          </div>
        );
        
      case "azure":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="azureTenantId">Azure Tenant ID</Label>
              <Input
                id="azureTenantId"
                name="azureTenantId"
                placeholder="00000000-0000-0000-0000-000000000000"
                value={formState.azureTenantId}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="azureClientId">Application (Client) ID</Label>
              <Input
                id="azureClientId"
                name="azureClientId"
                placeholder="00000000-0000-0000-0000-000000000000"
                value={formState.azureClientId}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="azureClientSecret">Client Secret</Label>
              <Input
                id="azureClientSecret"
                name="azureClientSecret"
                type="password"
                placeholder="Your client secret"
                value={formState.azureClientSecret}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="azureSubscriptionId">Subscription ID</Label>
              <Input
                id="azureSubscriptionId"
                name="azureSubscriptionId"
                placeholder="00000000-0000-0000-0000-000000000000"
                value={formState.azureSubscriptionId}
                onChange={handleChange}
              />
            </div>
          </div>
        );
        
      case "gcp":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gcpProjectId">GCP Project ID</Label>
              <Input
                id="gcpProjectId"
                name="gcpProjectId"
                placeholder="my-project-123456"
                value={formState.gcpProjectId}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gcpServiceAccountKey">Service Account Key (JSON)</Label>
              <Input
                id="gcpServiceAccountKey"
                name="gcpServiceAccountKey"
                type="password"
                placeholder="Paste your service account key JSON here"
                value={formState.gcpServiceAccountKey}
                onChange={handleChange}
              />
              <p className="text-xs text-muted-foreground">
                Paste the entire JSON key file content of your service account
              </p>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect Cloud Provider</CardTitle>
        <CardDescription>
          Integrate with your cloud provider to manage resources and monitor costs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="accountName">Account Name</Label>
            <Input
              id="accountName"
              name="accountName"
              placeholder="Production Account"
              value={formState.accountName}
              onChange={handleChange}
            />
          </div>
          
          <Tabs value={selectedProvider} onValueChange={(value) => setSelectedProvider(value as CloudProvider)}>
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="aws">
                <img src="/aws-logo.png" alt="AWS" className="h-5 w-5 mr-2" />
                AWS
              </TabsTrigger>
              <TabsTrigger value="azure">
                <img src="/azure-logo.png" alt="Azure" className="h-5 w-5 mr-2" />
                Azure
              </TabsTrigger>
              <TabsTrigger value="gcp">
                <img src="/gcp-logo.png" alt="GCP" className="h-5 w-5 mr-2" />
                Google Cloud
              </TabsTrigger>
            </TabsList>
            
            <div className="mt-6">
              <TabsContent value="aws">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline" className="font-normal">AWS</Badge>
                  <span className="text-sm">Amazon Web Services</span>
                </div>
                {renderProviderForm()}
              </TabsContent>
              
              <TabsContent value="azure">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline" className="font-normal">Azure</Badge>
                  <span className="text-sm">Microsoft Azure</span>
                </div>
                {renderProviderForm()}
              </TabsContent>
              
              <TabsContent value="gcp">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline" className="font-normal">GCP</Badge>
                  <span className="text-sm">Google Cloud Platform</span>
                </div>
                {renderProviderForm()}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleConnect} 
          disabled={isConnecting}
        >
          {isConnecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Key className="mr-2 h-4 w-4" />
              Connect {selectedProvider.toUpperCase()}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CloudProviderIntegration;
