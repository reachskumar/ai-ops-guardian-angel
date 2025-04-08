
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ComplianceStandard } from "./types";

interface ComplianceStandardsTableProps {
  complianceStandards: ComplianceStandard[];
  onRunScan: (standardId: string) => Promise<void>;
}

const ComplianceStandardsTable: React.FC<ComplianceStandardsTableProps> = ({ 
  complianceStandards,
  onRunScan
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Standard</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Score</TableHead>
          <TableHead>Controls Passed</TableHead>
          <TableHead>Last Assessment</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {complianceStandards.map((item) => (
          <TableRow key={item.id}>
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
            <TableCell>{Math.floor((item.score || 0) / 100 * 42)}/42</TableCell>
            <TableCell>
              {item.last_assessment_date 
                ? new Date(item.last_assessment_date).toLocaleDateString() 
                : 'Not assessed'}
            </TableCell>
            <TableCell>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onRunScan(item.id)}
              >
                Run Scan
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ComplianceStandardsTable;
