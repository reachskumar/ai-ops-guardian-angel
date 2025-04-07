
import React from "react";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

interface AdminHeaderProps {
  refreshProfiles: () => void;
  loading: boolean;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ refreshProfiles, loading }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold">Admin Panel</h1>
      <Button
        variant="outline"
        size="sm"
        onClick={refreshProfiles}
        disabled={loading}
      >
        Refresh
      </Button>
    </div>
  );
};

export default AdminHeader;
