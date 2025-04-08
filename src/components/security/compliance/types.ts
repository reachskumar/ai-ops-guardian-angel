
export interface ComplianceStandard {
  id: string;
  name: string;
  description: string;
  version: string;
  category: string;
  status?: string;
  score?: number;
  last_assessment_date?: string;
}

export interface ComplianceDataState {
  loading: boolean;
  standards: ComplianceStandard[];
  error: string | null;
}
