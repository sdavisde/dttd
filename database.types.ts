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
      candidates: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string | null
          sponsor_email: string | null
          sponsor_name: string | null
          status: Database["public"]["Enums"]["candidate_status"]
          updated_at: string
          weekend_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          sponsor_email?: string | null
          sponsor_name?: string | null
          status?: Database["public"]["Enums"]["candidate_status"]
          updated_at?: string
          weekend_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          sponsor_email?: string | null
          sponsor_name?: string | null
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
      sponsorship_request: {
        Row: {
          attends_secuela: string | null
          candidate_email: string | null
          candidate_name: string | null
          church_environment: string | null
          contact_frequency: string | null
          created_at: string
          god_evidence: string | null
          home_environment: string | null
          id: number
          payment_owner: string | null
          prayer_request: string | null
          reunion_group: string | null
          social_environment: string | null
          sponsor_address: string | null
          sponsor_church: string | null
          sponsor_name: string | null
          sponsor_phone: string | null
          sponsor_weekend: string | null
          support_plan: string | null
          work_environment: string | null
        }
        Insert: {
          attends_secuela?: string | null
          candidate_email?: string | null
          candidate_name?: string | null
          church_environment?: string | null
          contact_frequency?: string | null
          created_at?: string
          god_evidence?: string | null
          home_environment?: string | null
          id?: number
          payment_owner?: string | null
          prayer_request?: string | null
          reunion_group?: string | null
          social_environment?: string | null
          sponsor_address?: string | null
          sponsor_church?: string | null
          sponsor_name?: string | null
          sponsor_phone?: string | null
          sponsor_weekend?: string | null
          support_plan?: string | null
          work_environment?: string | null
        }
        Update: {
          attends_secuela?: string | null
          candidate_email?: string | null
          candidate_name?: string | null
          church_environment?: string | null
          contact_frequency?: string | null
          created_at?: string
          god_evidence?: string | null
          home_environment?: string | null
          id?: number
          payment_owner?: string | null
          prayer_request?: string | null
          reunion_group?: string | null
          social_environment?: string | null
          sponsor_address?: string | null
          sponsor_church?: string | null
          sponsor_name?: string | null
          sponsor_phone?: string | null
          sponsor_weekend?: string | null
          support_plan?: string | null
          work_environment?: string | null
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
          id: string
        }
        Insert: {
          id: string
        }
        Update: {
          id?: string
        }
        Relationships: []
      }
      weekends: {
        Row: {
          created_at: string
          end_date: string
          id: string
          number: number | null
          start_date: string
          title: string | null
          type: Database["public"]["Enums"]["weekend_type"]
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          number?: number | null
          start_date: string
          title?: string | null
          type: Database["public"]["Enums"]["weekend_type"]
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          number?: number | null
          start_date?: string
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
