
import React, { useState } from "react";
import { ComplianceCards } from "@/components/security";
import { useSecurityContext } from "../SecurityContext";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ComplianceSection: React.FC = () => {
  const { complianceItems } = useSecurityContext();
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Compliance Standards</h2>
        <div className="flex items-center gap-2">
          <Button 
            variant={viewMode === "cards" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("cards")}
          >
            Card View
          </Button>
          <Button 
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
          >
            Table View
          </Button>
        </div>
      </div>
      
      {viewMode === "cards" ? (
        <ComplianceCards complianceItems={complianceItems} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Standard</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Controls Passed</TableHead>
              <TableHead>Last Assessment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {complianceItems.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    item.status === "Passing" 
                      ? "bg-success/10 text-success" 
                      : item.status === "Needs Review" 
                      ? "bg-warning/10 text-warning"
                      : "bg-critical/10 text-critical"
                  }`}>
                    {item.status}
                  </span>
                </TableCell>
                <TableCell>{item.score}%</TableCell>
                <TableCell>{Math.floor(item.score / 100 * 42)}/42</TableCell>
                <TableCell>{new Date().toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default ComplianceSection;
