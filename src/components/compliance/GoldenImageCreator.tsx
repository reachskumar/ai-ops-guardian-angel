
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { FileCode, Server, Shield, Clock, HardDrive } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface HardeningRule {
  id: string;
  name: string;
  description: string;
  category: string;
  standard: string;
  enabled: boolean;
}

interface GoldenImageCreatorProps {
  baseImages: {
    id: string;
    name: string;
    os: string;
    version: string;
    description: string;
  }[];
  hardeningRules: HardeningRule[];
  complianceStandards: {
    id: string;
    name: string;
    description: string;
  }[];
  onCreateImage: (data: any) => Promise<void>;
}

const GoldenImageCreator: React.FC<GoldenImageCreatorProps> = ({
  baseImages,
  hardeningRules,
  complianceStandards,
  onCreateImage
}) => {
  const [selectedBaseImage, setSelectedBaseImage] = useState<string>("");
  const [imageName, setImageName] = useState<string>("");
  const [selectedStandards, setSelectedStandards] = useState<string[]>([]);
  const [selectedRules, setSelectedRules] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>("base-selection");
  const [isCreating, setIsCreating] = useState<boolean>(false);
  
  const filteredRules = selectedStandards.length > 0
    ? hardeningRules.filter(rule => selectedStandards.includes(rule.standard))
    : hardeningRules;

  const handleStandardToggle = (standardId: string) => {
    setSelectedStandards(prev => 
      prev.includes(standardId)
        ? prev.filter(id => id !== standardId)
        : [...prev, standardId]
    );
  };
  
  const handleRuleToggle = (ruleId: string) => {
    setSelectedRules(prev => 
      prev.includes(ruleId)
        ? prev.filter(id => id !== ruleId)
        : [...prev, ruleId]
    );
  };
  
  const handleSelectAllRules = () => {
    setSelectedRules(filteredRules.map(rule => rule.id));
  };
  
  const handleDeselectAllRules = () => {
    setSelectedRules([]);
  };
  
  const handleSubmit = async () => {
    if (!imageName || !selectedBaseImage) return;
    
    setIsCreating(true);
    
    const imageConfig = {
      name: imageName,
      baseImageId: selectedBaseImage,
      appliedStandards: selectedStandards,
      appliedRules: selectedRules,
    };
    
    try {
      await onCreateImage(imageConfig);
      // Reset form after successful creation
      setImageName("");
      setSelectedBaseImage("");
      setSelectedStandards([]);
      setSelectedRules([]);
      setActiveTab("base-selection");
    } finally {
      setIsCreating(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Create Hardened Golden Image
        </CardTitle>
        <CardDescription>
          Create a compliant golden image with security hardening for deployment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="base-selection">1. Base Image</TabsTrigger>
            <TabsTrigger 
              value="hardening-rules" 
              disabled={!selectedBaseImage}
            >
              2. Hardening Rules
            </TabsTrigger>
            <TabsTrigger 
              value="review" 
              disabled={!selectedBaseImage || selectedRules.length === 0}
            >
              3. Review & Create
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="base-selection" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="image-name">Golden Image Name</Label>
                <Input
                  id="image-name"
                  placeholder="Enter a name for your golden image"
                  value={imageName}
                  onChange={e => setImageName(e.target.value)}
                />
              </div>
              
              <div>
                <Label>Select Base Image</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {baseImages.map(image => (
                    <div
                      key={image.id}
                      className={`border rounded-md p-4 cursor-pointer transition-colors ${
                        selectedBaseImage === image.id 
                          ? "border-primary bg-primary/5" 
                          : "hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedBaseImage(image.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Server className="h-5 w-5 text-primary" />
                          <h3 className="font-medium">{image.name}</h3>
                        </div>
                        <Badge variant="outline">{image.os}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {image.description}
                      </p>
                      <div className="text-xs text-muted-foreground mt-2">
                        Version: {image.version}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end mt-4">
                <Button
                  onClick={() => setActiveTab("hardening-rules")}
                  disabled={!selectedBaseImage || !imageName}
                >
                  Next: Select Hardening Rules
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="hardening-rules" className="space-y-6 mt-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Compliance Standards</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select the compliance standards to apply hardening rules from
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {complianceStandards.map(standard => (
                  <div
                    key={standard.id}
                    className={`border rounded-md p-3 cursor-pointer transition-colors ${
                      selectedStandards.includes(standard.id) 
                        ? "border-primary bg-primary/5" 
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => handleStandardToggle(standard.id)}
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedStandards.includes(standard.id)}
                        onCheckedChange={() => handleStandardToggle(standard.id)}
                      />
                      <Label className="cursor-pointer">{standard.name}</Label>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 ml-6">
                      {standard.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium">Hardening Rules</h3>
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSelectAllRules}
                  >
                    Select All
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDeselectAllRules}
                  >
                    Deselect All
                  </Button>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                Select the specific hardening rules to apply to your golden image
              </p>
              
              <div className="border rounded-md divide-y max-h-[400px] overflow-y-auto">
                {filteredRules.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    {selectedStandards.length > 0 
                      ? "No rules found for the selected standards"
                      : "Select a compliance standard to view hardening rules"
                    }
                  </div>
                ) : (
                  filteredRules.map(rule => (
                    <div
                      key={rule.id}
                      className="p-3 hover:bg-muted/50"
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id={`rule-${rule.id}`}
                          checked={selectedRules.includes(rule.id)}
                          onCheckedChange={() => handleRuleToggle(rule.id)}
                          className="mt-1"
                        />
                        <div>
                          <Label 
                            htmlFor={`rule-${rule.id}`}
                            className="font-medium cursor-pointer"
                          >
                            {rule.name}
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {rule.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{rule.category}</Badge>
                            <Badge variant="outline">{rule.standard}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="flex justify-between mt-4">
              <Button
                variant="outline"
                onClick={() => setActiveTab("base-selection")}
              >
                Back: Base Image
              </Button>
              <Button
                onClick={() => setActiveTab("review")}
                disabled={selectedRules.length === 0}
              >
                Next: Review
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="review" className="space-y-6 mt-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Review Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4 text-primary" />
                        <CardTitle className="text-base">Base Image</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium">
                        {baseImages.find(img => img.id === selectedBaseImage)?.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {baseImages.find(img => img.id === selectedBaseImage)?.os} {baseImages.find(img => img.id === selectedBaseImage)?.version}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        <CardTitle className="text-base">Hardening</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium">
                        {selectedRules.length} Rules Selected
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Across {selectedStandards.length} compliance standards
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertTitle>Image Creation Time</AlertTitle>
                <AlertDescription>
                  Creating a hardened golden image may take up to 30 minutes depending on the number of rules applied.
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("hardening-rules")}
                >
                  Back: Hardening Rules
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                      Creating...
                    </>
                  ) : (
                    "Create Golden Image"
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default GoldenImageCreator;
