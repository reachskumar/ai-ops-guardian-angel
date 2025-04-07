
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Server, Check, AlertTriangle } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface SecurityRule {
  id: string;
  name: string;
  description: string;
  impact: "low" | "medium" | "high";
  standard: string;
  alreadyApplied?: boolean;
}

interface ServerHardeningProps {
  servers: {
    id: string;
    name: string;
    os: string;
    status: string;
  }[];
  onApplyHardening?: (serverId: string, ruleIds: string[]) => Promise<void>;
}

const ServerHardening: React.FC<ServerHardeningProps> = ({ 
  servers,
  onApplyHardening 
}) => {
  const [selectedServer, setSelectedServer] = useState<string>("");
  const [isHardening, setIsHardening] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedRules, setSelectedRules] = useState<string[]>([]);
  
  // Mock security rules for different standards
  const securityRules: SecurityRule[] = [
    {
      id: "rule-1",
      name: "Disable unnecessary services",
      description: "Disable or remove unnecessary services and daemons",
      impact: "low",
      standard: "PCI DSS",
    },
    {
      id: "rule-2",
      name: "Configure firewall rules",
      description: "Set up proper firewall rules to restrict network traffic",
      impact: "medium",
      standard: "PCI DSS",
    },
    {
      id: "rule-3",
      name: "Enable audit logging",
      description: "Configure comprehensive audit logging for security events",
      impact: "medium",
      standard: "HIPAA",
    },
    {
      id: "rule-4",
      name: "Set file permissions",
      description: "Apply proper file ownership and permissions",
      impact: "high",
      standard: "PCI DSS",
    },
    {
      id: "rule-5",
      name: "Implement MFA",
      description: "Enable multi-factor authentication for all access",
      impact: "high",
      standard: "NIST",
      alreadyApplied: true
    },
    {
      id: "rule-6",
      name: "Encrypt sensitive data",
      description: "Ensure all sensitive data is encrypted at rest",
      impact: "high",
      standard: "HIPAA",
    },
    {
      id: "rule-7",
      name: "Disable root login",
      description: "Disable direct root login via SSH",
      impact: "medium",
      standard: "NIST",
    },
    {
      id: "rule-8",
      name: "Password policy",
      description: "Implement strong password policy",
      impact: "medium",
      standard: "SOC 2",
    }
  ];

  const handleSelectServer = (value: string) => {
    setSelectedServer(value);
    // Reset selected rules when changing server
    setSelectedRules([]);
  };

  const handleToggleRule = (ruleId: string) => {
    setSelectedRules(prev => 
      prev.includes(ruleId)
        ? prev.filter(id => id !== ruleId)
        : [...prev, ruleId]
    );
  };

  const handleSelectAll = () => {
    const availableRules = securityRules
      .filter(rule => !rule.alreadyApplied)
      .map(rule => rule.id);
    setSelectedRules(availableRules);
  };

  const handleApplyHardening = async () => {
    if (!selectedServer || selectedRules.length === 0) return;

    setIsHardening(true);
    setProgress(0);

    try {
      // Simulate progress updates
      const updateInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 10;
          if (newProgress >= 100) {
            clearInterval(updateInterval);
            return 100;
          }
          return newProgress;
        });
      }, 500);

      // If an actual API call is provided
      if (onApplyHardening) {
        await onApplyHardening(selectedServer, selectedRules);
      } else {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 5000));
      }

      // Clear the interval just in case
      clearInterval(updateInterval);
      setProgress(100);
      
      toast({
        title: "Hardening complete",
        description: "Security rules have been applied successfully",
      });
      
      // Reset selections after successful hardening
      setSelectedRules([]);
    } catch (error) {
      toast({
        title: "Hardening failed",
        description: "There was an error applying security rules",
        variant: "destructive"
      });
    } finally {
      setIsHardening(false);
    }
  };

  const getServer = (id: string) => {
    return servers.find(server => server.id === id);
  };

  const getImpactBadge = (impact: string) => {
    switch(impact) {
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "medium":
        return <Badge variant="default">Medium</Badge>;
      case "low":
        return <Badge variant="outline">Low</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" /> 
          Server Hardening
        </CardTitle>
        <CardDescription>
          Apply security hardening rules to your servers based on compliance standards
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Select Server</label>
          <Select value={selectedServer} onValueChange={handleSelectServer}>
            <SelectTrigger>
              <SelectValue placeholder="Select a server..." />
            </SelectTrigger>
            <SelectContent>
              {servers.map(server => (
                <SelectItem key={server.id} value={server.id}>
                  <div className="flex items-center">
                    <Server className="h-4 w-4 mr-2 text-muted-foreground" />
                    {server.name} ({server.os})
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedServer && (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Security Rules</h3>
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                Select All Available
              </Button>
            </div>
            
            <div className="border rounded-md divide-y">
              {securityRules.map(rule => (
                <div key={rule.id} className="p-4 flex items-start gap-3">
                  <Checkbox
                    id={rule.id}
                    checked={selectedRules.includes(rule.id) || rule.alreadyApplied}
                    onCheckedChange={() => !rule.alreadyApplied && handleToggleRule(rule.id)}
                    disabled={rule.alreadyApplied}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor={rule.id}
                        className="font-medium cursor-pointer"
                      >
                        {rule.name}
                      </label>
                      <div className="flex items-center gap-2">
                        {rule.alreadyApplied ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            <Check className="h-3 w-3 mr-1" /> Applied
                          </Badge>
                        ) : (
                          getImpactBadge(rule.impact)
                        )}
                        <Badge variant="outline">{rule.standard}</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {rule.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {isHardening && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Applying security rules...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            <Separator />
            
            <div className="flex justify-end">
              <Button
                onClick={handleApplyHardening}
                disabled={isHardening || selectedRules.length === 0}
              >
                {isHardening ? (
                  <>
                    <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                    Applying...
                  </>
                ) : (
                  "Apply Hardening Rules"
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ServerHardening;
