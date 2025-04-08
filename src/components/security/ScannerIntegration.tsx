import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { PlusCircle, RefreshCcw, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Define the Scanner type with literal status types
export type Scanner = {
  id: string;
  name: string;
  type: string;
  url: string;
  status: "connected" | "disconnected" | "error";
  lastSyncTime: string;
};

const ScannerIntegration: React.FC = () => {
  const [scanners, setScanners] = useState<Scanner[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newScanner, setNewScanner] = useState({
    name: "",
    type: "",
    url: "",
  });
  const [loading, setLoading] = useState(true);
  const [addingScanner, setAddingScanner] = useState(false);

  useEffect(() => {
    fetchScanners();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    setNewScanner(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSelectChange = (value: string) => {
    setNewScanner(prev => ({ ...prev, type: value }));
  };

  // Ensure that when adding a new scanner, we properly set the status to one of the literal types
  const handleAddScanner = async () => {
    if (!newScanner.name || !newScanner.url || !newScanner.type) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }
    
    setAddingScanner(true);
    
    try {
      // Create a scanner with proper type for status
      const scanner: Scanner = {
        id: `scanner-${Date.now()}`,
        name: newScanner.name,
        type: newScanner.type,
        url: newScanner.url,
        status: "connected" as const,
        lastSyncTime: new Date().toISOString()
      };
      
      // Add to database
      const { error } = await supabase
        .from('security_scan_configurations')
        .insert({
          name: scanner.name,
          description: `${scanner.type} scanner`,
          scan_type: 'vulnerability',
          target_type: 'infrastructure',
          target_identifier: '*',
          scan_engine: scanner.type,
          scan_parameters: { url: scanner.url }
        });
      
      if (error) throw error;
      
      setScanners(prev => [...prev, scanner]);
      setShowAddDialog(false);
      
      toast({
        title: "Scanner Added",
        description: `${scanner.name} has been successfully connected.`
      });
    } catch (error) {
      console.error("Error adding scanner:", error);
      toast({
        title: "Error",
        description: "Failed to add scanner. Please try again.",
        variant: "destructive"
      });
    } finally {
      setAddingScanner(false);
    }
  };

  // When fetching scanners from API, ensure we map them to the correct type
  const fetchScanners = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('security_scan_configurations')
        .select('*');
      
      if (error) throw error;
      
      if (data) {
        // Properly map data to Scanner type with correct status literals
        const formattedScanners: Scanner[] = data.map(item => {
          // Safely access the URL from scan_parameters, which could be JSON or string
          let url = '';
          if (item.scan_parameters) {
            if (typeof item.scan_parameters === 'string') {
              try {
                const params = JSON.parse(item.scan_parameters);
                url = params.url || '';
              } catch {
                url = '';
              }
            } else {
              // It's already an object
              url = (item.scan_parameters as any).url || '';
            }
          }
          
          return {
            id: item.id,
            name: item.name,
            type: item.scan_engine,
            url: url,
            // Convert string status to our literal type
            status: (item.is_active ? "connected" : "disconnected") as "connected" | "disconnected" | "error",
            lastSyncTime: item.updated_at
          };
        });
        
        setScanners(formattedScanners);
      }
    } catch (error) {
      console.error("Error fetching scanners:", error);
      toast({
        title: "Error",
        description: "Failed to load scanners. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-md font-medium">Scanner Integration</CardTitle>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Scanner
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Scanner</DialogTitle>
              <DialogDescription>
                Connect a new security scanner to your system.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" value={newScanner.name} onChange={(e) => handleInputChange(e, 'name')} className="col-span-3" type="text" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select onValueChange={handleSelectChange}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nessus">Nessus</SelectItem>
                    <SelectItem value="openvas">OpenVAS</SelectItem>
                    <SelectItem value="qualys">Qualys</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="url" className="text-right">
                  URL
                </Label>
                <Input id="url" value={newScanner.url} onChange={(e) => handleInputChange(e, 'url')} className="col-span-3" type="url" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" onClick={handleAddScanner} disabled={addingScanner}>
                {addingScanner ? "Adding..." : "Add Scanner"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-24">
            <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
            Loading scanners...
          </div>
        ) : scanners.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-muted-foreground">
            <AlertCircle className="mr-2 h-4 w-4" />
            No scanners connected. Add one to get started.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {scanners.map((scanner) => (
              <div key={scanner.id} className="py-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{scanner.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {scanner.type} - {scanner.url}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {scanner.status === "connected" && (
                    <>
                      <CheckCircle2 className="text-green-500 h-4 w-4" />
                      <span className="text-xs text-green-500">Connected</span>
                    </>
                  )}
                  {scanner.status === "disconnected" && (
                    <>
                      <XCircle className="text-yellow-500 h-4 w-4" />
                      <span className="text-xs text-yellow-500">Disconnected</span>
                    </>
                  )}
                  {scanner.status === "error" && (
                    <>
                      <AlertCircle className="text-red-500 h-4 w-4" />
                      <span className="text-xs text-red-500">Error</span>
                    </>
                  )}
                  <span className="text-xs text-muted-foreground">
                    Last Sync: {new Date(scanner.lastSyncTime).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScannerIntegration;
