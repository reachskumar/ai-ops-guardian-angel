
import React from "react";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Shield, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export interface Role {
  id: string;
  name: string;
  description: string;
  users: number;
  permissions: number;
}

interface RoleCardProps {
  role: Role;
  onEdit: (role: Role) => void;
  onDelete: (id: string) => void;
}

const RoleCard: React.FC<RoleCardProps> = ({ role, onEdit, onDelete }) => {
  return (
    <Card className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="absolute right-4 top-4">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(role)}>
            <Edit2 className="h-4 w-4 mr-2" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-destructive focus:text-destructive"
            onClick={() => onDelete(role.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <CardHeader>
        <div className="flex items-start gap-2">
          <Shield className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <CardTitle>{role.name}</CardTitle>
            <CardDescription>{role.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Users:</span>
            <Badge variant="outline">{role.users}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Permissions:</span>
            <Badge variant="outline">{role.permissions}</Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="outline" size="sm" className="w-full">
          Manage Permissions
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RoleCard;
