
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ComplianceStandard, ComplianceDataState } from "./types";
import { useSecurityContext } from "../SecurityContext";

export const useComplianceData = () => {
  const { setIsScanning } = useSecurityContext();
  const [state, setState] = useState<ComplianceDataState>({
    loading: true,
    standards: [],
    error: null
  });

  const fetchComplianceData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
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

      setState({
        loading: false,
        standards: standardsWithAssessments,
        error: null
      });
    } catch (error) {
      console.error("Error fetching compliance data:", error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: "Failed to fetch compliance data"
      }));
      
      toast({
        title: "Error",
        description: "Failed to fetch compliance data. Please try again.",
        variant: "destructive"
      });
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

  useEffect(() => {
    fetchComplianceData();
  }, []);

  return {
    ...state,
    runComplianceScan,
    fetchComplianceData
  };
};
