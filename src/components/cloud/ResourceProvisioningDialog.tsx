
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ResourceProvisioningForm from "./ResourceProvisioningForm";
import { CloudAccount } from "@/services/cloud";

interface ResourceProvisioningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: CloudAccount[];
  onSuccess?: () => void;
}

const ResourceProvisioningDialog: React.FC<ResourceProvisioningDialogProps> = ({
  open,
  onOpenChange,
  accounts,
  onSuccess
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Provision New Resource</DialogTitle>
        </DialogHeader>
        {accounts.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-muted-foreground">No cloud accounts connected. Please connect an account first.</p>
          </div>
        ) : (
          <ResourceProvisioningForm 
            accounts={accounts}
            onCancel={() => onOpenChange(false)}
            onSuccess={() => {
              onOpenChange(false);
              if (onSuccess) onSuccess();
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ResourceProvisioningDialog;
