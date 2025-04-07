
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const HardeningLink: React.FC = () => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Security Hardening
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Apply security hardening rules to your infrastructure or create hardened golden images
            based on compliance standards like PCI DSS, HIPAA, NIST, and SOC 2.
          </p>
          <div className="flex justify-end">
            <Button asChild>
              <Link to="/security/hardening" className="flex items-center gap-2">
                Go to Hardening <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HardeningLink;
