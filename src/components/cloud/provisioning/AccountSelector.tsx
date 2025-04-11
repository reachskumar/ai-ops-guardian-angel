
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CloudAccount } from "@/services/cloud";

interface AccountSelectorProps {
  accounts: CloudAccount[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const AccountSelector: React.FC<AccountSelectorProps> = ({
  accounts,
  value,
  onChange,
  error,
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="account">Cloud Account</Label>
      <Select onValueChange={onChange} value={value}>
        <SelectTrigger>
          <SelectValue placeholder="Select cloud account" />
        </SelectTrigger>
        <SelectContent>
          {accounts.map((account) => (
            <SelectItem key={account.id} value={account.id}>
              {account.name} ({account.provider.toUpperCase()})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default AccountSelector;
