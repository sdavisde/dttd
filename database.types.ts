export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      candidate_info: {
        Row: {
          acknowledged_camp_rules: boolean | null
          acknowledged_smoke_rules: boolean | null
          activity_restrictions: string | null
          address_line_1: string
          address_line_2: string | null
          age: number | null
          allergies: string | null
          allergy_management: string | null
          candidate_id: string | null
          church: string | null
          city: string
          covered_by_insurance: boolean | null
          created_at: string
          date_of_birth: string
          dentist_phone: string
          email: string
          emergency_contact_name: string
          emergency_contact_permission: boolean | null
          emergency_contact_phone: string
          family_dentist: string
          family_physician: string
          first_name: string
          has_friends_attending_weekend: boolean | null
          has_medication: boolean | null
          has_spouse_attended_weekend: boolean | null
          id: string
          insurance_information: string | null
          is_christian: boolean | null
          last_name: string
          marital_status: string | null
          medical_conditions: string | null
          medical_permission: boolean | null
          medication_information: string | null
          member_of_clergy: boolean | null
          phone: string
          physician_phone: string
          reason_for_attending: string | null
          require_special_assistance: boolean | null
          shirt_size: string
          smoke_or_vape: boolean | null
          special_needs: string | null
          spouse_name: string | null
          spouse_weekend_location: string | null
          state: string
          zip: string
        }
        Insert: {
          acknowledged_camp_rules?: boolean | null
          acknowledged_smoke_rules?: boolean | null
          activity_restrictions?: string | null
          address_line_1: string
          address_line_2?: string | null
          age?: number | null
          allergies?: string | null
          allergy_management?: string | null
          candidate_id?: string | null
          church?: string | null
          city: string
          covered_by_insurance?: boolean | null
          created_at?: string
          date_of_birth: string
          dentist_phone: string
          email: string
          emergency_contact_name: string
          emergency_contact_permission?: boolean | null
          emergency_contact_phone: string
          family_dentist: string
          family_physician: string
          first_name: string
          has_friends_attending_weekend?: boolean | null
          has_medication?: boolean | null
          has_spouse_attended_weekend?: boolean | null
          id?: string
          insurance_information?: string | null
          is_christian?: boolean | null
          last_name: string
          marital_status?: string | null
          medical_conditions?: string | null
          medical_permission?: boolean | null
          medication_information?: string | null
          member_of_clergy?: boolean | null
          phone: string
          physician_phone: string
          reason_for_attending?: string | null
          require_special_assistance?: boolean | null
          shirt_size: string
          smoke_or_vape?: boolean | null
          special_needs?: string | null
          spouse_name?: string | null
          spouse_weekend_location?: string | null
          state: string
          zip: string
        }
        Update: {
          acknowledged_camp_rules?: boolean | null
          acknowledged_smoke_rules?: boolean | null
          activity_restrictions?: string | null
          address_line_1?: string
          address_line_2?: string | null
          age?: number | null
          allergies?: string | null
          allergy_management?: string | null
          candidate_id?: string | null
          church?: string | null
          city?: string
          covered_by_insurance?: boolean | null
          created_at?: string
          date_of_birth?: string
          dentist_phone?: string
          email?: string
          emergency_contact_name?: string
          emergency_contact_permission?: boolean | null
          emergency_contact_phone?: string
          family_dentist?: string
          family_physician?: string
          first_name?: string
          has_friends_attending_weekend?: boolean | null
          has_medication?: boolean | null
          has_spouse_attended_weekend?: boolean | null
          id?: string
          insurance_information?: string | null
          is_christian?: boolean | null
          last_name?: string
          marital_status?: string | null
          medical_conditions?: string | null
          medical_permission?: boolean | null
          medication_information?: string | null
          member_of_clergy?: boolean | null
          phone?: string
          physician_phone?: string
          reason_for_attending?: string | null
          require_special_assistance?: boolean | null
          shirt_size?: string
          smoke_or_vape?: boolean | null
          special_needs?: string | null
          spouse_name?: string | null
          spouse_weekend_location?: string | null
          state?: string
          zip?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_info_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_payments: {
        Row: {
          candidate_id: string | null
          created_at: string
          id: number
          payment_amount: number | null
          payment_intent_id: string
          payment_owner: string
        }
        Insert: {
          candidate_id?: string | null
          created_at?: string
          id?: number
          payment_amount?: number | null
          payment_intent_id: string
          payment_owner: string
        }
        Update: {
          candidate_id?: string | null
          created_at?: string
          id?: number
          payment_amount?: number | null
          payment_intent_id?: string
          payment_owner?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_payments_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_sponsorship_info: {
        Row: {
          attends_secuela: string | null
          candidate_email: string | null
          candidate_id: string | null
          candidate_name: string | null
          church_environment: string | null
          contact_frequency: string | null
          created_at: string
          god_evidence: string | null
          home_environment: string | null
          id: string
          payment_owner: string | null
          prayer_request: string | null
          reunion_group: string | null
          social_environment: string | null
          sponsor_address: string | null
          sponsor_church: string | null
          sponsor_email: string | null
          sponsor_name: string | null
          sponsor_phone: string | null
          sponsor_weekend: string | null
          support_plan: string | null
          updated_at: string | null
          work_environment: string | null
        }
        Insert: {
          attends_secuela?: string | null
          candidate_email?: string | null
          candidate_id?: string | null
          candidate_name?: string | null
          church_environment?: string | null
          contact_frequency?: string | null
          created_at?: string
          god_evidence?: string | null
          home_environment?: string | null
          id?: string
          payment_owner?: string | null
          prayer_request?: string | null
          reunion_group?: string | null
          social_environment?: string | null
          sponsor_address?: string | null
          sponsor_church?: string | null
          sponsor_email?: string | null
          sponsor_name?: string | null
          sponsor_phone?: string | null
          sponsor_weekend?: string | null
          support_plan?: string | null
          updated_at?: string | null
          work_environment?: string | null
        }
        Update: {
          attends_secuela?: string | null
          candidate_email?: string | null
          candidate_id?: string | null
          candidate_name?: string | null
          church_environment?: string | null
          contact_frequency?: string | null
          created_at?: string
          god_evidence?: string | null
          home_environment?: string | null
          id?: string
          payment_owner?: string | null
          prayer_request?: string | null
          reunion_group?: string | null
          social_environment?: string | null
          sponsor_address?: string | null
          sponsor_church?: string | null
          sponsor_email?: string | null
          sponsor_name?: string | null
          sponsor_phone?: string | null
          sponsor_weekend?: string | null
          support_plan?: string | null
          updated_at?: string | null
          work_environment?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_sponsorship_info_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          created_at: string
          id: string
          status: Database["public"]["Enums"]["candidate_status"]
          updated_at: string
          weekend_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["candidate_status"]
          updated_at?: string
          weekend_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["candidate_status"]
          updated_at?: string
          weekend_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidates_weekend_id_fkey"
            columns: ["weekend_id"]
            isOneToOne: false
            referencedRelation: "weekends"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_information: {
        Row: {
          created_at: string
          email_address: string | null
          id: string
          label: string | null
        }
        Insert: {
          created_at?: string
          email_address?: string | null
          id: string
          label?: string | null
        }
        Update: {
          created_at?: string
          email_address?: string | null
          id?: string
          label?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          datetime: string | null
          id: number
          location: string | null
          title: string | null
        }
        Insert: {
          created_at?: string
          datetime?: string | null
          id?: number
          location?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string
          datetime?: string | null
          id?: number
          location?: string | null
          title?: string | null
        }
        Relationships: []
      }
      roles: {
        Row: {
          id: string
          label: string
          permissions: string[]
        }
        Insert: {
          id?: string
          label: string
          permissions: string[]
        }
        Update: {
          id?: string
          label?: string
          permissions?: string[]
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          email: string | null
          first_name: string | null
          gender: string | null
          id: string
          last_name: string | null
          phone_number: string | null
        }
        Insert: {
          email?: string | null
          first_name?: string | null
          gender?: string | null
          id: string
          last_name?: string | null
          phone_number?: string | null
        }
        Update: {
          email?: string | null
          first_name?: string | null
          gender?: string | null
          id?: string
          last_name?: string | null
          phone_number?: string | null
        }
        Relationships: []
      }
      users_experience: {
        Row: {
          cha_role: string
          created_at: string
          external_community_weekend: string | null
          id: string
          rollo: string | null
          served_date: string
          updated_at: string
          user_id: string
          weekend_id: string | null
        }
        Insert: {
          cha_role: string
          created_at?: string
          external_community_weekend?: string | null
          id?: string
          rollo?: string | null
          served_date: string
          updated_at?: string
          user_id: string
          weekend_id?: string | null
        }
        Update: {
          cha_role?: string
          created_at?: string
          external_community_weekend?: string | null
          id?: string
          rollo?: string | null
          served_date?: string
          updated_at?: string
          user_id?: string
          weekend_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_experience_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_experience_weekend_id_fkey"
            columns: ["weekend_id"]
            isOneToOne: false
            referencedRelation: "weekends"
            referencedColumns: ["id"]
          },
        ]
      }
      weekend_roster: {
        Row: {
          additional_cha_role: string | null
          cha_role: string | null
          completed_commitment_form: boolean
          completed_statement_of_belief: boolean
          created_at: string
          id: string
          rollo: string | null
          special_needs: string | null
          status: string | null
          user_id: string | null
          weekend_id: string | null
        }
        Insert: {
          additional_cha_role?: string | null
          cha_role?: string | null
          completed_commitment_form?: boolean
          completed_statement_of_belief?: boolean
          created_at?: string
          id?: string
          rollo?: string | null
          special_needs?: string | null
          status?: string | null
          user_id?: string | null
          weekend_id?: string | null
        }
        Update: {
          additional_cha_role?: string | null
          cha_role?: string | null
          completed_commitment_form?: boolean
          completed_statement_of_belief?: boolean
          created_at?: string
          id?: string
          rollo?: string | null
          special_needs?: string | null
          status?: string | null
          user_id?: string | null
          weekend_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "weekend_roster_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekend_roster_weekend_id_fkey"
            columns: ["weekend_id"]
            isOneToOne: false
            referencedRelation: "weekends"
            referencedColumns: ["id"]
          },
        ]
      }
      weekend_roster_payments: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          payment_amount: number | null
          payment_intent_id: string
          payment_method: string | null
          weekend_roster_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          payment_amount?: number | null
          payment_intent_id: string
          payment_method?: string | null
          weekend_roster_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          payment_amount?: number | null
          payment_intent_id?: string
          payment_method?: string | null
          weekend_roster_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "weekend_roster_payments_weekend_roster_id_fkey"
            columns: ["weekend_roster_id"]
            isOneToOne: false
            referencedRelation: "weekend_roster"
            referencedColumns: ["id"]
          },
        ]
      }
      weekends: {
        Row: {
          created_at: string
          end_date: string
          group_id: string | null
          id: string
          number: number | null
          start_date: string
          status: string | null
          title: string | null
          type: Database["public"]["Enums"]["weekend_type"]
        }
        Insert: {
          created_at?: string
          end_date: string
          group_id?: string | null
          id?: string
          number?: number | null
          start_date: string
          status?: string | null
          title?: string | null
          type: Database["public"]["Enums"]["weekend_type"]
        }
        Update: {
          created_at?: string
          end_date?: string
          group_id?: string | null
          id?: string
          number?: number | null
          start_date?: string
          status?: string | null
          title?: string | null
          type?: Database["public"]["Enums"]["weekend_type"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      candidate_status:
        | "sponsored"
        | "awaiting_forms"
        | "pending_approval"
        | "awaiting_payment"
        | "confirmed"
        | "rejected"
      permissions: "READ_MEDICAL_HISTORY"
      weekend_type: "MENS" | "WOMENS"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      candidate_status: [
        "sponsored",
        "awaiting_forms",
        "pending_approval",
        "awaiting_payment",
        "confirmed",
        "rejected",
      ],
      permissions: ["READ_MEDICAL_HISTORY"],
      weekend_type: ["MENS", "WOMENS"],
    },
  },
} as const
