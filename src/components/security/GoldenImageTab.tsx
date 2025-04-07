
import React, { useState } from "react";
import { 
  GoldenImageCreator 
} from "@/components/compliance";
import { toast } from "@/hooks/use-toast";

const GoldenImageTab: React.FC = () => {
  // Base images for golden image creation
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
  
  // Hardening rules available for golden images
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
  
  // Compliance standards for golden images
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
  
  const handleCreateImage = async (imageConfig: any) => {
    console.log("Creating golden image with config:", imageConfig);
    
    // Simulate API call delay
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        toast({
          title: "Golden Image Created",
          description: `Successfully created ${imageConfig.name} from ${baseImages.find(img => img.id === imageConfig.baseImageId)?.name}`
        });
        resolve();
      }, 3000);
    });
  };
  
  return (
    <div className="space-y-6">
      <GoldenImageCreator
        baseImages={baseImages}
        hardeningRules={hardeningRules}
        complianceStandards={complianceStandards}
        onCreateImage={handleCreateImage}
      />
    </div>
  );
};

export default GoldenImageTab;
