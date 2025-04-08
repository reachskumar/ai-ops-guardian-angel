
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CloudProvider } from "@/services/cloud";
import { RegionSelector } from "@/components/cloud/provisioning";

interface CreateClusterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateCluster: (clusterData: any) => void;
}

const CreateClusterDialog: React.FC<CreateClusterDialogProps> = ({
  open,
  onOpenChange,
  onCreateCluster,
}) => {
  const [name, setName] = useState("");
  const [provider, setProvider] = useState<string>("AWS EKS");
  const [region, setRegion] = useState("us-west-2");
  const [version, setVersion] = useState("1.26");
  const [nodeCount, setNodeCount] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Map the UI provider names to the CloudProvider type
  const getProviderType = (providerName: string): CloudProvider => {
    switch (providerName) {
      case "AWS EKS": return "aws";
      case "GCP GKE": return "gcp";
      case "Azure AKS": return "azure";
      case "DO DOKS": return "aws"; // Fallback to AWS regions for DigitalOcean as it's not supported in CloudProvider type
      default: return "aws";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name) {
      setError("Cluster name is required");
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real application, this would call your backend API
      // For demo purposes, we'll simulate a successful creation after a delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newCluster = {
        id: `cluster-${Date.now()}`,
        name,
        provider,
        region,
        version,
        status: "provisioning",
        nodes: nodeCount,
        cpu: `${nodeCount * 4} vCPU`,
        memory: `${nodeCount * 16} GiB`,
      };

      onCreateCluster(newCluster);
      setIsSubmitting(false);
      onOpenChange(false);
      resetForm();
    } catch (err) {
      setError("Failed to create cluster. Please try again.");
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName("");
    setProvider("AWS EKS");
    setRegion("us-west-2");
    setVersion("1.26");
    setNodeCount(3);
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Kubernetes Cluster</DialogTitle>
          <DialogDescription>
            Configure the settings for your new Kubernetes cluster.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Cluster Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="my-kubernetes-cluster"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="provider">Cloud Provider</Label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AWS EKS">AWS EKS</SelectItem>
                  <SelectItem value="GCP GKE">GCP GKE</SelectItem>
                  <SelectItem value="Azure AKS">Azure AKS</SelectItem>
                  <SelectItem value="DO DOKS">DigitalOcean DOKS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <RegionSelector
                provider={getProviderType(provider)}
                value={region}
                onChange={setRegion}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="version">K8s Version</Label>
              <Select value={version} onValueChange={setVersion}>
                <SelectTrigger>
                  <SelectValue placeholder="Select version" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1.26">1.26</SelectItem>
                  <SelectItem value="1.25">1.25</SelectItem>
                  <SelectItem value="1.24">1.24</SelectItem>
                  <SelectItem value="1.27">1.27</SelectItem>
                  <SelectItem value="1.28">1.28</SelectItem>
                  <SelectItem value="1.29">1.29</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="node-count">Node Count</Label>
              <Input
                id="node-count"
                type="number"
                min={1}
                max={20}
                value={nodeCount}
                onChange={(e) => setNodeCount(Number(e.target.value))}
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Cluster"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateClusterDialog;
