
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Loader2, Plus, Check, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Scanner {
  id: string;
  name: string;
  type: string;
  url: string;
  status: "connected" | "disconnected" | "error";
  lastSyncTime?: string;
}

const SCANNER_TYPES = [
  { id: "trivy", name: "Trivy Container Scanner", description: "Vulnerability scanner for containers and filesystems" },
  { id: "owasp-zap", name: "OWASP ZAP", description: "Web application vulnerability scanner" },
  { id: "openvas", name: "OpenVAS", description: "Open vulnerability assessment scanner" },
  { id: "nmap", name: "Nmap Security Scanner", description: "Network security scanner" },
  { id: "grype", name: "Grype", description: "Vulnerability scanner for container images and filesystems" }
];

export const ScannerIntegration: React.FC = () => {
  const [scanners, setScanners] = useState<Scanner[]>([
    { id: "1", name: "Trivy", type: "trivy", url: "http://trivy-server:8080", status: "connected", lastSyncTime: "2025-04-08T10:30:00Z" },
    { id: "2", name: "OWASP ZAP", type: "owasp-zap", url: "http://zap-proxy:8090", status: "disconnected" }
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newScanner, setNewScanner] = useState<{name: string; type: string; url: string}>({
    name: "",
    type: "trivy",
    url: ""
  });
  const [isConnecting, setIsConnecting] = useState(false);

  const handleAddScanner = async () => {
    if (!newScanner.name || !newScanner.url) {
      toast({
        title: "Error",
        description: "Name and URL are required",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);

    try {
      // In a real implementation, we would make an API call to our backend to register the scanner
      // For this demo, we'll simulate the connection with a timeout
      
      const { data, error } = await supabase.functions.invoke("security-scan", {
        body: {
          action: "connect-scanner",
          scanner: newScanner
        }
      });

      if (error) throw error;

      // Simulate successful connection
      setTimeout(() => {
        const newId = Date.now().toString();
        setScanners([...scanners, { 
          ...newScanner, 
          id: newId, 
          status: "connected",
          lastSyncTime: new Date().toISOString()
        }]);
        
        setNewScanner({
          name: "",
          type: "trivy",
          url: ""
        });
        
        setShowAddForm(false);
        setIsConnecting(false);
        
        toast({
          title: "Scanner connected",
          description: `Successfully connected to ${newScanner.name}`,
        });
      }, 2000);
    } catch (error) {
      console.error("Error connecting scanner:", error);
      setIsConnecting(false);
      toast({
        title: "Connection failed",
        description: error instanceof Error ? error.message : "Could not connect to scanner",
        variant: "destructive"
      });
    }
  };

  const handleTestConnection = async (scannerId: string) => {
    const scanner = scanners.find(s => s.id === scannerId);
    if (!scanner) return;

    try {
      toast({
        title: "Testing connection",
        description: `Connecting to ${scanner.name}...`,
      });

      // In a real implementation, we would test the connection to the scanner
      // For this demo, we'll simulate the test with a timeout
      setTimeout(() => {
        const updatedScanners = scanners.map(s => 
          s.id === scannerId 
            ? { ...s, status: "connected", lastSyncTime: new Date().toISOString() } 
            : s
        );
        setScanners(updatedScanners);

        toast({
          title: "Connection successful",
          description: `Successfully connected to ${scanner.name}`,
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "Connection failed",
        description: error instanceof Error ? error.message : "Could not connect to scanner",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <Check className="h-5 w-5 text-success" />;
      case "disconnected":
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case "error":
        return <AlertTriangle className="h-5 w-5 text-critical" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Vulnerability Scanners</CardTitle>
          <CardDescription>Connect and manage vulnerability scanning tools</CardDescription>
        </div>
        {!showAddForm && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Scanner
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {showAddForm && (
          <div className="border rounded-md p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scanner-name">Scanner Name</Label>
                <Input 
                  id="scanner-name"
                  value={newScanner.name}
                  onChange={(e) => setNewScanner({...newScanner, name: e.target.value})}
                  placeholder="My Trivy Scanner"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scanner-type">Scanner Type</Label>
                <Select 
                  value={newScanner.type}
                  onValueChange={(value) => setNewScanner({...newScanner, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select scanner type" />
                  </SelectTrigger>
                  <SelectContent>
                    {SCANNER_TYPES.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="scanner-url">Scanner URL</Label>
              <Input 
                id="scanner-url"
                value={newScanner.url}
                onChange={(e) => setNewScanner({...newScanner, url: e.target.value})}
                placeholder="http://scanner-address:port"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
              <Button 
                disabled={isConnecting} 
                onClick={handleAddScanner}
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Connect Scanner"
                )}
              </Button>
            </div>
          </div>
        )}
        
        {scanners.length > 0 ? (
          <div className="space-y-4">
            {scanners.map((scanner) => (
              <div 
                key={scanner.id}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(scanner.status)}
                    <h4 className="font-medium">{scanner.name}</h4>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {SCANNER_TYPES.find(t => t.id === scanner.type)?.description || scanner.type}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {scanner.url}
                    {scanner.lastSyncTime && (
                      <span className="ml-2">
                        • Last sync: {new Date(scanner.lastSyncTime).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleTestConnection(scanner.id)}
                >
                  Test Connection
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center border rounded-md">
            <h4 className="font-medium mb-2">No scanners connected</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Connect a vulnerability scanner to automatically detect security issues
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScannerIntegration;
