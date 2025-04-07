
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CloudProvider, provisionResource } from "@/services/cloudProviderService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Define the schema for the form
const resourceSchema = z.object({
  name: z.string().min(3, "Resource name must be at least 3 characters"),
  type: z.string().min(1, "Please select a resource type"),
  size: z.string().min(1, "Please select a size"),
  region: z.string().min(1, "Please select a region"),
  tags: z.string().optional(),
});

type ResourceFormValues = z.infer<typeof resourceSchema>;

interface ResourceProvisioningFormProps {
  accountId: string;
  provider: CloudProvider;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ResourceProvisioningForm: React.FC<ResourceProvisioningFormProps> = ({
  accountId,
  provider,
  onSuccess,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("compute");
  const { toast } = useToast();
  
  const form = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      name: "",
      type: "",
      size: "",
      region: "",
      tags: "",
    },
  });

  // Resource options based on provider and type
  const getResourceTypes = (provider: CloudProvider, category: string) => {
    switch (provider) {
      case "aws":
        if (category === "compute") return ["EC2", "Lambda"];
        if (category === "storage") return ["S3", "EBS"];
        if (category === "database") return ["RDS", "DynamoDB"];
        if (category === "network") return ["VPC", "ELB"];
        return [];
      case "azure":
        if (category === "compute") return ["Virtual Machine", "Functions"];
        if (category === "storage") return ["Blob Storage", "Disk Storage"];
        if (category === "database") return ["SQL Database", "Cosmos DB"];
        if (category === "network") return ["Virtual Network", "Load Balancer"];
        return [];
      case "gcp":
        if (category === "compute") return ["Compute Engine", "Cloud Functions"];
        if (category === "storage") return ["Cloud Storage", "Persistent Disk"];
        if (category === "database") return ["Cloud SQL", "Firestore"];
        if (category === "network") return ["VPC", "Cloud Load Balancing"];
        return [];
      default:
        return [];
    }
  };
  
  // Size options based on provider and resource type
  const getSizeOptions = (provider: CloudProvider, type: string) => {
    if (type.includes("EC2") || type.includes("Virtual Machine") || type.includes("Compute Engine")) {
      return ["t2.micro", "t2.small", "t2.medium", "t2.large", "t2.xlarge"];
    }
    if (type.includes("RDS") || type.includes("SQL")) {
      return ["db.t3.micro", "db.t3.small", "db.t3.medium", "db.t3.large"];
    }
    if (type.includes("S3") || type.includes("Blob") || type.includes("Storage")) {
      return ["Standard", "Infrequent Access", "Archive"];
    }
    return ["Small", "Medium", "Large"];
  };
  
  // Region options based on provider
  const getRegionOptions = (provider: CloudProvider) => {
    switch (provider) {
      case "aws":
        return ["us-east-1", "us-west-1", "eu-west-1", "ap-southeast-1"];
      case "azure":
        return ["East US", "West US", "North Europe", "Southeast Asia"];
      case "gcp":
        return ["us-central1", "us-west1", "europe-west1", "asia-east1"];
      default:
        return [];
    }
  };

  const handleSubmit = async (data: ResourceFormValues) => {
    setIsSubmitting(true);
    
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
      
      // Call the provisioning API
      const result = await provisionResource(accountId, data.type, resourceConfig);
      
      if (result.success) {
        toast({
          title: "Resource provisioning initiated",
          description: `${data.type} resource "${data.name}" is being created.`,
        });
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast({
          title: "Provisioning failed",
          description: result.error || "Failed to provision resource",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Resource provisioning error:", error);
      toast({
        title: "Provisioning failed",
        description: "There was an error provisioning your resource",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Provision New Resource</CardTitle>
        <CardDescription>
          Create and deploy a new {provider.toUpperCase()} cloud resource
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Resource Name</Label>
                      <Input 
                        id="name"
                        placeholder="Enter resource name"
                        {...form.register("name")}
                      />
                      {form.formState.errors.name && (
                        <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="type">Resource Type</Label>
                      <Select 
                        onValueChange={(value) => form.setValue("type", value)}
                        defaultValue={form.getValues("type")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select resource type" />
                        </SelectTrigger>
                        <SelectContent>
                          {getResourceTypes(provider, category).map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.type && (
                        <p className="text-sm text-red-500">{form.formState.errors.type.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="size">Size / Tier</Label>
                      <Select 
                        onValueChange={(value) => form.setValue("size", value)}
                        defaultValue={form.getValues("size")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          {getSizeOptions(provider, form.getValues("type")).map((size) => (
                            <SelectItem key={size} value={size}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.size && (
                        <p className="text-sm text-red-500">{form.formState.errors.size.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="region">Region</Label>
                      <Select 
                        onValueChange={(value) => form.setValue("region", value)}
                        defaultValue={form.getValues("region")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                        <SelectContent>
                          {getRegionOptions(provider).map((region) => (
                            <SelectItem key={region} value={region}>
                              {region}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.region && (
                        <p className="text-sm text-red-500">{form.formState.errors.region.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (key=value,key=value)</Label>
                    <Input
                      id="tags"
                      placeholder="env=prod,project=web,owner=devops"
                      {...form.register("tags")}
                    />
                    <p className="text-xs text-muted-foreground">
                      Separate multiple tags with commas, format as key=value
                    </p>
                  </div>
                </div>
                
                <CardFooter className="px-0 pt-4">
                  <div className="flex justify-between w-full">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={onCancel}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
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
                </CardFooter>
              </form>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ResourceProvisioningForm;
