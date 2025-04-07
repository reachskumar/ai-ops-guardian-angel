
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Key } from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  created: string;
  expires: string;
  status: string;
}

interface ApiKeysTabProps {
  filteredApiKeys: ApiKey[];
}

const ApiKeysTab: React.FC<ApiKeysTabProps> = ({ filteredApiKeys }) => {
  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">API Key Management</h2>
        <Button size="sm">
          <Key className="h-4 w-4 mr-2" />
          Generate API Key
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Key Name</th>
                  <th className="text-left p-4">Created</th>
                  <th className="text-left p-4">Expires</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApiKeys.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-muted-foreground">
                      No API keys found
                    </td>
                  </tr>
                ) : (
                  filteredApiKeys.map((key) => (
                    <tr key={key.id} className="border-b hover:bg-muted/50">
                      <td className="p-4 font-medium">{key.name}</td>
                      <td className="p-4">{key.created}</td>
                      <td className="p-4">{key.expires}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          key.status === "Active" ? "bg-green-100 text-green-800" :
                          key.status === "Expiring soon" ? "bg-amber-100 text-amber-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {key.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="sm">View</Button>
                        <Button variant="ghost" size="sm">Rotate</Button>
                        <Button variant="ghost" size="sm" className="text-red-500">Revoke</Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default ApiKeysTab;
