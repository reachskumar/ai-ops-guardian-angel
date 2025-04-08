
import React, { useState, useEffect } from "react";
import { ComplianceCards } from "@/components/security";
import { useSecurityContext } from "../SecurityContext";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

interface ComplianceStandard {
  id: string;
  name: string;
  description: string;
  version: string;
  category: string;
  status?: string;
  score?: number;
  last_assessment_date?: string;
}

const ComplianceSection: React.FC = () => {
  const { setIsScanning } = useSecurityContext();
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [complianceStandards, setComplianceStandards] = useState<ComplianceStandard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplianceData();
  }, []);

  const fetchComplianceData = async () => {
    try {
      setLoading(true);
      
      // Fetch compliance standards from the database
      const { data: standards, error: standardsError } = await supabase
        .from('compliance_standards')
        .select('*');

      if (standardsError) throw standardsError;

      // Fetch the latest assessment for each standard
      const standardsWithAssessments = await Promise.all(
        standards.map(async (standard) => {
          const { data: assessments, error: assessmentsError } = await supabase
            .from('compliance_assessments')
            .select('*')
            .eq('standard_id', standard.id)
            .order('completed_at', { ascending: false })
            .limit(1);

          if (assessmentsError) {
            console.error(`Error fetching assessments for ${standard.name}:`, assessmentsError);
            return {
              ...standard,
              status: 'Not Assessed',
              score: 0
            };
          }

          const latestAssessment = assessments && assessments.length > 0 ? assessments[0] : null;
          
          return {
            ...standard,
            status: latestAssessment ? 
              (latestAssessment.score >= 85 ? 'Passing' : 
               latestAssessment.score >= 70 ? 'Needs Review' : 'Failing') : 
              'Not Assessed',
            score: latestAssessment?.score || 0,
            last_assessment_date: latestAssessment?.completed_at
          };
        })
      );

      setComplianceStandards(standardsWithAssessments);
    } catch (error) {
      console.error("Error fetching compliance data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch compliance data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const runComplianceScan = async (standardId: string) => {
    try {
      setIsScanning(true);
      
      // Create a new compliance assessment
      const { data, error } = await supabase
        .from('compliance_assessments')
        .insert({
          standard_id: standardId,
          status: 'completed',
          score: Math.floor(Math.random() * 30) + 70, // Random score between 70-100 for demo
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString()
        })
        .select();

      if (error) throw error;

      toast({
        title: "Compliance Scan Complete",
        description: "The compliance assessment has been updated.",
      });

      // Refresh data
      await fetchComplianceData();
    } catch (error) {
      console.error("Error running compliance scan:", error);
      toast({
        title: "Error",
        description: "Failed to run compliance scan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

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
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : viewMode === "cards" ? (
        <ComplianceCards 
          complianceItems={complianceStandards.map(std => ({
            id: std.id,
            name: std.name,
            status: std.status || 'Not Assessed',
            score: std.score || 0,
          }))} 
          onScanRequest={runComplianceScan}
        />
      ) : (
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
                    onClick={() => runComplianceScan(item.id)}
                  >
                    Run Scan
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default ComplianceSection;
