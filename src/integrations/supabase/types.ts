export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      alert_rules: {
        Row: {
          created_at: string
          description: string | null
          duration: number
          enabled: boolean
          id: string
          metric: string
          name: string
          operator: string
          resource_type: string
          severity: string
          threshold: number
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration?: number
          enabled?: boolean
          id?: string
          metric: string
          name: string
          operator: string
          resource_type: string
          severity: string
          threshold: number
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration?: number
          enabled?: boolean
          id?: string
          metric?: string
          name?: string
          operator?: string
          resource_type?: string
          severity?: string
          threshold?: number
          user_id?: string
        }
        Relationships: []
      }
      alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          id: string
          message: string
          resolved_at: string | null
          resource_id: string | null
          rule_id: string
          severity: string
          status: string
          triggered_at: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          id?: string
          message: string
          resolved_at?: string | null
          resource_id?: string | null
          rule_id: string
          severity: string
          status?: string
          triggered_at?: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          id?: string
          message?: string
          resolved_at?: string | null
          resource_id?: string | null
          rule_id?: string
          severity?: string
          status?: string
          triggered_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "cloud_resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "alert_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          api_key: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_name: string
          last_used_at: string | null
          permissions: Json | null
          rate_limit_per_minute: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_name: string
          last_used_at?: string | null
          permissions?: Json | null
          rate_limit_per_minute?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_name?: string
          last_used_at?: string | null
          permissions?: Json | null
          rate_limit_per_minute?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cloud_account_credentials: {
        Row: {
          account_id: string
          created_at: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          account_id: string
          created_at?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          account_id?: string
          created_at?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "cloud_account_credentials_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "users_cloud_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      cloud_resources: {
        Row: {
          cloud_account_id: string
          cost_per_day: number | null
          created_at: string
          id: string
          metadata: Json | null
          name: string
          region: string
          resource_id: string
          status: string
          tags: Json | null
          type: string
          updated_at: string
        }
        Insert: {
          cloud_account_id: string
          cost_per_day?: number | null
          created_at?: string
          id?: string
          metadata?: Json | null
          name: string
          region: string
          resource_id: string
          status: string
          tags?: Json | null
          type: string
          updated_at?: string
        }
        Update: {
          cloud_account_id?: string
          cost_per_day?: number | null
          created_at?: string
          id?: string
          metadata?: Json | null
          name?: string
          region?: string
          resource_id?: string
          status?: string
          tags?: Json | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cloud_resources_cloud_account_id_fkey"
            columns: ["cloud_account_id"]
            isOneToOne: false
            referencedRelation: "users_cloud_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_assessments: {
        Row: {
          assessor: string | null
          completed_at: string | null
          id: string
          next_assessment_due: string | null
          notes: string | null
          score: number | null
          standard_id: string | null
          started_at: string
          status: string
          summary_report: Json | null
        }
        Insert: {
          assessor?: string | null
          completed_at?: string | null
          id?: string
          next_assessment_due?: string | null
          notes?: string | null
          score?: number | null
          standard_id?: string | null
          started_at?: string
          status: string
          summary_report?: Json | null
        }
        Update: {
          assessor?: string | null
          completed_at?: string | null
          id?: string
          next_assessment_due?: string | null
          notes?: string | null
          score?: number | null
          standard_id?: string | null
          started_at?: string
          status?: string
          summary_report?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_assessments_standard_id_fkey"
            columns: ["standard_id"]
            isOneToOne: false
            referencedRelation: "compliance_standards"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_control_results: {
        Row: {
          assessed_at: string
          assessed_by: string | null
          assessment_id: string | null
          control_id: string | null
          evidence: string | null
          id: string
          notes: string | null
          remediation_due_date: string | null
          remediation_plan: string | null
          status: string
        }
        Insert: {
          assessed_at?: string
          assessed_by?: string | null
          assessment_id?: string | null
          control_id?: string | null
          evidence?: string | null
          id?: string
          notes?: string | null
          remediation_due_date?: string | null
          remediation_plan?: string | null
          status: string
        }
        Update: {
          assessed_at?: string
          assessed_by?: string | null
          assessment_id?: string | null
          control_id?: string | null
          evidence?: string | null
          id?: string
          notes?: string | null
          remediation_due_date?: string | null
          remediation_plan?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_control_results_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "compliance_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_control_results_control_id_fkey"
            columns: ["control_id"]
            isOneToOne: false
            referencedRelation: "compliance_controls"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_controls: {
        Row: {
          control_id: string
          created_at: string
          description: string | null
          id: string
          implementation_guidance: string | null
          standard_id: string | null
          title: string
          updated_at: string
          verification_method: string | null
        }
        Insert: {
          control_id: string
          created_at?: string
          description?: string | null
          id?: string
          implementation_guidance?: string | null
          standard_id?: string | null
          title: string
          updated_at?: string
          verification_method?: string | null
        }
        Update: {
          control_id?: string
          created_at?: string
          description?: string | null
          id?: string
          implementation_guidance?: string | null
          standard_id?: string | null
          title?: string
          updated_at?: string
          verification_method?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_controls_standard_id_fkey"
            columns: ["standard_id"]
            isOneToOne: false
            referencedRelation: "compliance_standards"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_standards: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
          version: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          version?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          version?: string | null
        }
        Relationships: []
      }
      incidents: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          resolved_at: string | null
          severity: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          resolved_at?: string | null
          severity: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          resolved_at?: string | null
          severity?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          endpoint: string
          id: string
          identifier: string
          request_count: number | null
          window_start: string
        }
        Insert: {
          endpoint: string
          id?: string
          identifier: string
          request_count?: number | null
          window_start?: string
        }
        Update: {
          endpoint?: string
          id?: string
          identifier?: string
          request_count?: number | null
          window_start?: string
        }
        Relationships: []
      }
      security_scan_configurations: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          scan_engine: string
          scan_frequency: string | null
          scan_parameters: Json | null
          scan_type: string
          target_identifier: string
          target_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          scan_engine: string
          scan_frequency?: string | null
          scan_parameters?: Json | null
          scan_type: string
          target_identifier: string
          target_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          scan_engine?: string
          scan_frequency?: string | null
          scan_parameters?: Json | null
          scan_type?: string
          target_identifier?: string
          target_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      security_scans: {
        Row: {
          completed_at: string | null
          configuration_id: string | null
          error_message: string | null
          id: string
          initiated_by: string | null
          raw_result: Json | null
          scan_engine_id: string | null
          started_at: string | null
          status: string
          summary: Json | null
        }
        Insert: {
          completed_at?: string | null
          configuration_id?: string | null
          error_message?: string | null
          id?: string
          initiated_by?: string | null
          raw_result?: Json | null
          scan_engine_id?: string | null
          started_at?: string | null
          status?: string
          summary?: Json | null
        }
        Update: {
          completed_at?: string | null
          configuration_id?: string | null
          error_message?: string | null
          id?: string
          initiated_by?: string | null
          raw_result?: Json | null
          scan_engine_id?: string | null
          started_at?: string | null
          status?: string
          summary?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "security_scans_configuration_id_fkey"
            columns: ["configuration_id"]
            isOneToOne: false
            referencedRelation: "security_scan_configurations"
            referencedColumns: ["id"]
          },
        ]
      }
      users_cloud_accounts: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          last_synced_at: string | null
          metadata: Json | null
          name: string
          provider: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          last_synced_at?: string | null
          metadata?: Json | null
          name: string
          provider: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          last_synced_at?: string | null
          metadata?: Json | null
          name?: string
          provider?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      vulnerabilities: {
        Row: {
          affected_component: string | null
          assigned_to: string | null
          cvss_score: number | null
          description: string | null
          discovered_at: string
          external_references: Json | null
          id: string
          remediation_steps: string | null
          resolved_at: string | null
          resolved_by: string | null
          scan_id: string | null
          severity: string
          status: string
          tags: string[] | null
          title: string
          vulnerability_id: string
        }
        Insert: {
          affected_component?: string | null
          assigned_to?: string | null
          cvss_score?: number | null
          description?: string | null
          discovered_at?: string
          external_references?: Json | null
          id?: string
          remediation_steps?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          scan_id?: string | null
          severity: string
          status?: string
          tags?: string[] | null
          title: string
          vulnerability_id: string
        }
        Update: {
          affected_component?: string | null
          assigned_to?: string | null
          cvss_score?: number | null
          description?: string | null
          discovered_at?: string
          external_references?: Json | null
          id?: string
          remediation_steps?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          scan_id?: string | null
          severity?: string
          status?: string
          tags?: string[] | null
          title?: string
          vulnerability_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vulnerabilities_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "security_scans"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_configs: {
        Row: {
          created_at: string
          id: string
          is_verified: boolean | null
          last_verified_at: string | null
          secret_key: string
          user_id: string
          webhook_url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_verified?: boolean | null
          last_verified_at?: string | null
          secret_key: string
          user_id: string
          webhook_url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_verified?: boolean | null
          last_verified_at?: string | null
          secret_key?: string
          user_id?: string
          webhook_url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_rate_limit: {
        Args: { p_identifier: string; p_endpoint: string; p_limit?: number }
        Returns: boolean
      }
      delete_account_credentials: {
        Args: { account_id: string }
        Returns: undefined
      }
      get_account_credentials: {
        Args: { account_id: string }
        Returns: {
          key: string
          value: string
        }[]
      }
      store_credential: {
        Args: {
          account_id: string
          credential_key: string
          credential_value: string
        }
        Returns: undefined
      }
      validate_api_key: {
        Args: { p_api_key: string }
        Returns: {
          user_id: string
          permissions: Json
          rate_limit: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
