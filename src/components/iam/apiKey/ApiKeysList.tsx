
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Key } from "lucide-react";
import { ApiKeyStatusBadge } from "./";
import ApiKeyActions from "./ApiKeyActions";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

interface ApiKey {
  id: string;
  name: string;
  created: string;
  expires: string;
  status: string;
  key?: string;
}

interface ApiKeysListProps {
  apiKeys: ApiKey[];
  onRevokeKey: (id: string) => void;
  onDeleteKey: (id: string) => void;
}

const ApiKeysList: React.FC<ApiKeysListProps> = ({ 
  apiKeys,
  onRevokeKey,
  onDeleteKey
}) => {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apiKeys.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No API keys found
                </TableCell>
              </TableRow>
            ) : (
              apiKeys.map((apiKey) => (
                <TableRow key={apiKey.id} className="border-b hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-primary" />
                      {apiKey.name}
                    </div>
                  </TableCell>
                  <TableCell>{apiKey.created}</TableCell>
                  <TableCell>{apiKey.expires}</TableCell>
                  <TableCell>
                    <ApiKeyStatusBadge status={apiKey.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <ApiKeyActions
                      keyId={apiKey.id}
                      status={apiKey.status}
                      onRevokeKey={onRevokeKey}
                      onDeleteKey={onDeleteKey}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ApiKeysList;
