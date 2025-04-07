
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

interface ServerItem {
  id: string;
  name: string;
  status: string;
  type: string;
  ip: string;
  os: string;
  cpu: string;
  memory: string;
  region: string;
}

interface ServerSummaryCardsProps {
  servers: ServerItem[];
}

const ServerSummaryCards: React.FC<ServerSummaryCardsProps> = ({ servers }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Servers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{servers.length}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Running</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-500">
            {servers.filter(s => s.status === "running").length}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Stopped</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-500">
            {servers.filter(s => s.status === "stopped").length}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-500">
            {servers.filter(s => s.status === "maintenance").length}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServerSummaryCards;
