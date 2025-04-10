
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatabaseInstance } from "@/services/databaseService";
import { Loader2, Save } from "lucide-react";

interface DatabaseSettingsProps {
  database: DatabaseInstance;
  onSave: (updates: Partial<DatabaseInstance>) => Promise<void>;
}

const DatabaseSettings: React.FC<DatabaseSettingsProps> = ({
  database,
  onSave
}) => {
  const [name, setName] = useState(database.name);
  const [version, setVersion] = useState(database.version);
  const [isLoading, setIsLoading] = useState(false);

  const versionOptions = [
    "14.5",
    "14.10",
    "15.3",
    "15.6",
    "16.0",
    "16.1"
  ];

  const isVersionUpgrade = version !== database.version;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await onSave({
        name,
        version
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Database Settings</CardTitle>
        <CardDescription>
          Configure your database instance settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Database Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter database name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="version">Database Version</Label>
            <Select 
              value={version} 
              onValueChange={setVersion}
            >
              <SelectTrigger id="version">
                <SelectValue placeholder="Select version" />
              </SelectTrigger>
              <SelectContent>
                {versionOptions.map(v => (
                  <SelectItem key={v} value={v}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isVersionUpgrade && (
              <p className="text-sm text-amber-500 mt-1">
                Warning: Upgrading the database version requires maintenance downtime.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="connectionString">Connection String</Label>
            <div className="flex">
              <Input
                id="connectionString"
                value={database.connectionString || ""}
                readOnly
                className="flex-1 font-mono text-xs"
              />
              <Button
                type="button"
                variant="outline"
                className="ml-2"
                onClick={() => navigator.clipboard.writeText(database.connectionString || "")}
              >
                Copy
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Resources</Label>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label htmlFor="cpu" className="text-xs">CPU (vCores)</Label>
                <div className="border rounded p-2 text-center">
                  {database.resources?.cpu || "2"}
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="memory" className="text-xs">Memory (GB)</Label>
                <div className="border rounded p-2 text-center">
                  {database.resources?.memory || "8"}
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="storage" className="text-xs">Storage (GB)</Label>
                <div className="border rounded p-2 text-center">
                  {database.resources?.storage || "100"}
                </div>
              </div>
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default DatabaseSettings;
