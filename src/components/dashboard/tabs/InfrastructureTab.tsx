
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Server, Database, Network, Cloud, FileCode } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface InfrastructureResource {
  id: string;
  type: string;
  status: string;
  region: string;
  provider: string;
}

interface InfrastructureTabProps {
  infrastructureResources: InfrastructureResource[];
}

const InfrastructureTab: React.FC<InfrastructureTabProps> = ({
  infrastructureResources,
}) => {
  const navigate = useNavigate();

  const handleNavigateToIaC = () => {
    navigate("/cloud-resources");
    // We'd ideally also set the active tab to 'iac', but would need to use context or state management
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-md font-medium">Cloud Resources</CardTitle>
            <Button variant="outline" size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Provision
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="grid grid-cols-6 p-3 text-xs font-medium text-muted-foreground border-b">
                <div>ID</div>
                <div>Type</div>
                <div>Provider</div>
                <div>Region</div>
                <div>Status</div>
                <div></div>
              </div>
              {infrastructureResources.map((resource, i) => (
                <div key={i} className="grid grid-cols-6 p-3 text-sm items-center border-b last:border-0">
                  <div className="font-medium">{resource.id}</div>
                  <div>{resource.type}</div>
                  <div>{resource.provider}</div>
                  <div>{resource.region}</div>
                  <div>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      resource.status === 'running' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 
                      resource.status === 'stopped' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' : 
                      'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    }`}>
                      {resource.status}
                    </span>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="ghost" size="sm">
                      Manage
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              <Server className="mr-2 h-4 w-4" />
              Launch New Instance
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Database className="mr-2 h-4 w-4" />
              Create Database
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Network className="mr-2 h-4 w-4" />
              Configure Network
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Cloud className="mr-2 h-4 w-4" />
              Manage Storage
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-md font-medium">Infrastructure as Code</CardTitle>
            <Button variant="ghost" size="sm" onClick={handleNavigateToIaC}>
              <FileCode className="mr-2 h-4 w-4" />
              Manage
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm">Terraform</span>
              </div>
              <span className="text-xs text-muted-foreground">v1.5.2</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm">CloudFormation</span>
              </div>
              <span className="text-xs text-muted-foreground">Updated</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></div>
                <span className="text-sm">Ansible</span>
              </div>
              <span className="text-xs text-muted-foreground">Update needed</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm">Azure ARM</span>
              </div>
              <span className="text-xs text-muted-foreground">New</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InfrastructureTab;
