
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface CreateDatabaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (database: {
    name: string;
    type: string;
    region: string;
    version: string;
  }) => Promise<void>;
}

const CreateDatabaseDialog: React.FC<CreateDatabaseDialogProps> = ({
  isOpen,
  onClose,
  onCreate
}) => {
  const [name, setName] = useState("");
  const [type, setType] = useState("PostgreSQL");
  const [region, setRegion] = useState("us-east-1");
  const [version, setVersion] = useState("14.5");
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    
    try {
      await onCreate({
        name,
        type,
        region,
        version
      });
      
      // Reset form
      setName("");
      setType("PostgreSQL");
      setRegion("us-east-1");
      setVersion("14.5");
      onClose();
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Database</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Database Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="my-database"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Database Type</Label>
            <Select value={type} onValueChange={setType} required>
              <SelectTrigger id="type">
                <SelectValue placeholder="Select database type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PostgreSQL">PostgreSQL</SelectItem>
                <SelectItem value="MySQL">MySQL</SelectItem>
                <SelectItem value="MongoDB">MongoDB</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="region">Region</Label>
            <Select value={region} onValueChange={setRegion} required>
              <SelectTrigger id="region">
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                <SelectItem value="us-west-1">US West (N. California)</SelectItem>
                <SelectItem value="eu-west-1">EU (Ireland)</SelectItem>
                <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="version">Version</Label>
            <Select value={version} onValueChange={setVersion} required>
              <SelectTrigger id="version">
                <SelectValue placeholder="Select version" />
              </SelectTrigger>
              <SelectContent>
                {type === "PostgreSQL" && (
                  <>
                    <SelectItem value="14.5">PostgreSQL 14.5</SelectItem>
                    <SelectItem value="15.3">PostgreSQL 15.3</SelectItem>
                    <SelectItem value="16.0">PostgreSQL 16.0</SelectItem>
                  </>
                )}
                {type === "MySQL" && (
                  <>
                    <SelectItem value="8.0">MySQL 8.0</SelectItem>
                    <SelectItem value="5.7">MySQL 5.7</SelectItem>
                  </>
                )}
                {type === "MongoDB" && (
                  <>
                    <SelectItem value="6.0">MongoDB 6.0</SelectItem>
                    <SelectItem value="5.0">MongoDB 5.0</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter className="mt-6">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Database"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDatabaseDialog;
