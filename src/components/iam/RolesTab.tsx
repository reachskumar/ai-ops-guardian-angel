
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";

interface Role {
  id: string;
  name: string;
  description: string;
  users: number;
  permissions: number;
}

interface RolesTabProps {
  filteredRoles: Role[];
}

const RolesTab: React.FC<RolesTabProps> = ({ filteredRoles }) => {
  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Roles & Permissions</h2>
        <Button size="sm">
          <Shield className="h-4 w-4 mr-2" />
          Create Role
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Role Name</th>
                  <th className="text-left p-4">Description</th>
                  <th className="text-center p-4">Users</th>
                  <th className="text-center p-4">Permissions</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-muted-foreground">
                      No roles found
                    </td>
                  </tr>
                ) : (
                  filteredRoles.map((role) => (
                    <tr key={role.id} className="border-b hover:bg-muted/50">
                      <td className="p-4 font-medium">{role.name}</td>
                      <td className="p-4">{role.description}</td>
                      <td className="p-4 text-center">{role.users}</td>
                      <td className="p-4 text-center">{role.permissions}</td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="sm">Edit</Button>
                        <Button variant="ghost" size="sm">Clone</Button>
                        <Button variant="ghost" size="sm" className="text-red-500">Delete</Button>
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

export default RolesTab;
