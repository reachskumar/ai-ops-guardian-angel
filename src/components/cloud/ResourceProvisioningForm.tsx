import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CloudProvider, provisionResource } from "@/services/cloud";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Import our new components
import {
  ResourceNameField,
  ResourceTypeSelector,
  SizeSelector,
  RegionSelector,
  TagsField
} from "./provisioning";

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
                    <ResourceNameField 
                      value={form.watch("name")} 
                      onChange={(e) => form.setValue("name", e.target.value)}
                      error={form.formState.errors.name?.message}
                    />
                    
                    <ResourceTypeSelector
                      provider={provider}
                      category={category}
                      value={form.watch("type")}
                      onChange={(value) => form.setValue("type", value)}
                      error={form.formState.errors.type?.message}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <SizeSelector
                      provider={provider}
                      resourceType={form.watch("type")}
                      value={form.watch("size")}
                      onChange={(value) => form.setValue("size", value)}
                      error={form.formState.errors.size?.message}
                    />
                    
                    <RegionSelector
                      provider={provider}
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
