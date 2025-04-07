
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComplianceStandards, GoldenImageCreator } from "@/components/compliance";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Shield, FileBadge } from "lucide-react";

const ComplianceTab: React.FC = () => {
  const [scanningStatus, setScanningStatus] = useState<"idle" | "scanning" | "complete">("idle");
  const [activeTab, setActiveTab] = useState<string>("standards");
  
  const pciStandard = {
    name: "PCI DSS",
    description: "Payment Card Industry Data Security Standard ensures that companies that process, store or transmit credit card information maintain a secure environment.",
    level: "2",
    score: 86,
    status: "passing" as const,
    controls: [
      {
        id: "pci-1.1",
        name: "Install and maintain a firewall",
        status: "passed" as const,
        description: "Install and maintain a firewall configuration to protect cardholder data"
      },
      {
        id: "pci-1.2",
        name: "Change default passwords",
        status: "passed" as const,
        description: "Do not use vendor-supplied defaults for system passwords and other security parameters"
      },
      {
        id: "pci-2.1",
        name: "Protect stored cardholder data",
        status: "warning" as const,
        description: "Protect stored cardholder data"
      },
      {
        id: "pci-2.2",
        name: "Encrypt transmission of data",
        status: "passed" as const,
        description: "Encrypt transmission of cardholder data across open, public networks"
      },
      {
        id: "pci-3.1",
        name: "Anti-virus software",
        status: "passed" as const,
        description: "Use and regularly update anti-virus software or programs"
      },
      {
        id: "pci-3.2",
        name: "Secure systems and applications",
        status: "passed" as const,
        description: "Develop and maintain secure systems and applications"
      },
    ]
  };
  
  const hipaaStandard = {
    name: "HIPAA",
    description: "Health Insurance Portability and Accountability Act requires safeguards to protect the privacy of personal health information.",
    score: 79,
    status: "warning" as const,
    controls: [
      {
        id: "hipaa-1.1",
        name: "Access Control",
        status: "passed" as const,
        description: "Implement technical policies and procedures for electronic information systems"
      },
      {
        id: "hipaa-1.2",
        name: "Audit Controls",
        status: "warning" as const,
        description: "Implement hardware, software, and procedures that record and examine activity"
      },
      {
        id: "hipaa-2.1",
        name: "Integrity Controls",
        status: "passed" as const,
        description: "Implement policies and procedures to protect from improper alteration or destruction"
      },
      {
        id: "hipaa-2.2",
        name: "Person or Entity Authentication",
        status: "warning" as const,
        description: "Implement procedures to verify that a person or entity seeking access is the one claimed"
      }
    ]
  };
  
  const nistStandard = {
    name: "NIST 800-53",
    description: "NIST Special Publication 800-53 provides a catalog of security and privacy controls for federal information systems.",
    score: 72,
    status: "warning" as const,
    controls: [
      {
        id: "nist-1.1",
        name: "Access Control",
        status: "warning" as const,
        description: "Limit system access to authorized users and devices"
      },
      {
        id: "nist-1.2",
        name: "Awareness and Training",
        status: "passed" as const,
        description: "Ensure that personnel are trained to carry out their duties"
      },
      {
        id: "nist-2.1",
        name: "Configuration Management",
        status: "failed" as const,
        description: "Establish baseline configurations and inventories of systems"
      },
      {
        id: "nist-2.2",
        name: "Contingency Planning",
        status: "warning" as const,
        description: "Establish plans for emergency response and backup operations"
      }
    ]
  };
  
  const soc2Standard = {
    name: "SOC 2",
    description: "Service Organization Control 2 focuses on a business's non-financial reporting controls as they relate to security, availability, processing integrity, confidentiality, and privacy.",
    score: 81,
    status: "passing" as const,
    controls: [
      {
        id: "soc2-1.1",
        name: "Security Monitoring",
        status: "passed" as const,
        description: "The system is protected against unauthorized access"
      },
      {
        id: "soc2-1.2",
        name: "Change Management",
        status: "passed" as const,
        description: "Changes to the system are documented, authorized, and tested"
      },
      {
        id: "soc2-2.1",
        name: "Risk Management",
        status: "warning" as const,
        description: "Risks are identified and risk mitigation activities are implemented"
      },
      {
        id: "soc2-2.2",
        name: "Vendor Management",
        status: "passed" as const,
        description: "Vendors and business partners are subject to monitoring"
      }
    ]
  };
  
  const standards = [
    pciStandard,
    hipaaStandard,
    nistStandard,
    soc2Standard
  ];
  
  const baseImages = [
    {
      id: "base-1",
      name: "Ubuntu Server 22.04 LTS",
      os: "Ubuntu",
      version: "22.04 LTS",
      description: "Long-term support version of Ubuntu Server with 5 years of updates"
    },
    {
      id: "base-2",
      name: "Windows Server 2022",
      os: "Windows",
      version: "Server 2022",
      description: "Latest Windows Server operating system with enhanced security features"
    },
    {
      id: "base-3",
      name: "Amazon Linux 2",
      os: "Amazon Linux",
      version: "2",
      description: "AWS-optimized Linux distribution for cloud workloads"
    },
    {
      id: "base-4",
      name: "Red Hat Enterprise Linux 9",
      os: "RHEL",
      version: "9",
      description: "Enterprise-grade Linux platform for mission-critical workloads"
    }
  ];
  
  const hardeningRules = [
    {
      id: "rule-1",
      name: "Disable Unnecessary Services",
      description: "Disable or remove unnecessary services, protocols, and daemons to reduce the attack surface",
      category: "System Hardening",
      standard: "pci",
      enabled: true
    },
    {
      id: "rule-2",
      name: "Strong Password Policy",
      description: "Enforce strong password complexity and rotation policies",
      category: "Authentication",
      standard: "pci",
      enabled: true
    },
    {
      id: "rule-3",
      name: "Secure File Permissions",
      description: "Set appropriate file and directory permissions to prevent unauthorized access",
      category: "File System",
      standard: "pci",
      enabled: true
    },
    {
      id: "rule-4",
      name: "Enable Audit Logging",
      description: "Configure comprehensive audit logging for security events",
      category: "Logging",
      standard: "hipaa",
      enabled: true
    },
    {
      id: "rule-5",
      name: "Network Segmentation",
      description: "Implement proper network segmentation to isolate critical systems",
      category: "Network Security",
      standard: "hipaa",
      enabled: true
    },
    {
      id: "rule-6",
      name: "Encrypt Sensitive Data",
      description: "Enable encryption for sensitive data at rest",
      category: "Encryption",
      standard: "pci",
      enabled: true
    },
    {
      id: "rule-7",
      name: "Secure Boot Configuration",
      description: "Configure secure boot process to prevent unauthorized boot code",
      category: "Boot Security",
      standard: "nist",
      enabled: true
    },
    {
      id: "rule-8",
      name: "Disable Remote Root Login",
      description: "Disable direct root login via SSH to prevent brute force attacks",
      category: "Remote Access",
      standard: "nist",
      enabled: true
    },
    {
      id: "rule-9",
      name: "Implement MFA",
      description: "Configure multi-factor authentication for privileged access",
      category: "Authentication",
      standard: "soc2",
      enabled: true
    },
    {
      id: "rule-10",
      name: "Regular Security Updates",
      description: "Configure automatic security updates and patches",
      category: "Patch Management",
      standard: "soc2",
      enabled: true
    }
  ];
  
  const complianceStandards = [
    {
      id: "pci",
      name: "PCI DSS",
      description: "Payment Card Industry Data Security Standard"
    },
    {
      id: "hipaa",
      name: "HIPAA",
      description: "Health Insurance Portability and Accountability Act"
    },
    {
      id: "nist",
      name: "NIST 800-53",
      description: "National Institute of Standards and Technology"
    },
    {
      id: "soc2",
      name: "SOC 2",
      description: "Service Organization Control 2"
    }
  ];
  
  const handleRunScan = () => {
    setScanningStatus("scanning");
    
    // Simulate a scan with a delay
    setTimeout(() => {
      setScanningStatus("complete");
    }, 3000);
  };
  
  const handleViewDetails = (standardName: string) => {
    console.log(`Viewing details for ${standardName}`);
    // This would navigate to a detailed view in a real application
  };
  
  const handleCreateImage = async (imageConfig: any) => {
    // This would call an API to create a golden image in a real application
    console.log("Creating golden image with config:", imageConfig);
    
    // Simulate API call delay
    return new Promise<void>(resolve => {
      setTimeout(() => {
        console.log("Golden image created successfully");
        resolve();
      }, 2000);
    });
  };
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="standards" className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              <span>Compliance Standards</span>
            </TabsTrigger>
            <TabsTrigger value="golden-images" className="flex items-center gap-1">
              <FileBadge className="h-4 w-4" />
              <span>Golden Images</span>
            </TabsTrigger>
          </TabsList>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
        
        <TabsContent value="standards" className="mt-6">
          <ComplianceStandards
            standards={standards}
            onViewDetails={handleViewDetails}
            onRunScan={handleRunScan}
            scanningStatus={scanningStatus}
          />
        </TabsContent>
        
        <TabsContent value="golden-images" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <GoldenImageCreator
                baseImages={baseImages}
                hardeningRules={hardeningRules}
                complianceStandards={complianceStandards}
                onCreateImage={handleCreateImage}
              />
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Hardening Benefits</CardTitle>
                  <CardDescription>
                    Why use hardened golden images?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium">Security by Default</h4>
                    <p className="text-sm text-muted-foreground">
                      Deploy systems that are secure from the first boot, reducing the window of vulnerability
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">Compliance Ready</h4>
                    <p className="text-sm text-muted-foreground">
                      Meet regulatory requirements with pre-configured security controls
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">Consistent Deployments</h4>
                    <p className="text-sm text-muted-foreground">
                      Ensure all systems are deployed with the same security baseline
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium">Reduced Remediation</h4>
                    <p className="text-sm text-muted-foreground">
                      Minimize post-deployment security fixes and emergency patching
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Recent Images</CardTitle>
                  <CardDescription>
                    Recently created golden images
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                      <div>
                        <p className="font-medium">Hardened Ubuntu 22.04</p>
                        <p className="text-xs text-muted-foreground">PCI DSS Level 1</p>
                      </div>
                      <p className="text-xs text-muted-foreground">2 days ago</p>
                    </div>
                    
                    <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                      <div>
                        <p className="font-medium">RHEL 9 Secure</p>
                        <p className="text-xs text-muted-foreground">HIPAA + NIST</p>
                      </div>
                      <p className="text-xs text-muted-foreground">1 week ago</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComplianceTab;
