export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      candidate_info: {
        Row: {
          address_line_1: string
          address_line_2: string | null
          age: number | null
          candidate_id: string | null
          church: string | null
          city: string
          created_at: string
          date_of_birth: string
          email: string
          emergency_contact_name: string
          emergency_contact_phone: string
          first_name: string
          has_friends_attending_weekend: boolean | null
          has_spouse_attended_weekend: boolean | null
          id: string
          is_christian: boolean | null
          last_name: string
          marital_status: string | null
          medical_conditions: string | null
          member_of_clergy: boolean | null
          phone: string
          reason_for_attending: string | null
          shirt_size: string
          spouse_name: string | null
          spouse_weekend_location: string | null
          state: string
          zip: string
        }
        Insert: {
          address_line_1: string
          address_line_2?: string | null
          age?: number | null
          candidate_id?: string | null
          church?: string | null
          city: string
          created_at?: string
          date_of_birth: string
          email: string
          emergency_contact_name: string
          emergency_contact_phone: string
          first_name: string
          has_friends_attending_weekend?: boolean | null
          has_spouse_attended_weekend?: boolean | null
          id?: string
          is_christian?: boolean | null
          last_name: string
          marital_status?: string | null
          medical_conditions?: string | null
          member_of_clergy?: boolean | null
          phone: string
          reason_for_attending?: string | null
          shirt_size: string
          spouse_name?: string | null
          spouse_weekend_location?: string | null
          state: string
          zip: string
        }
        Update: {
          address_line_1?: string
          address_line_2?: string | null
          age?: number | null
          candidate_id?: string | null
          church?: string | null
          city?: string
          created_at?: string
          date_of_birth?: string
          email?: string
          emergency_contact_name?: string
          emergency_contact_phone?: string
          first_name?: string
          has_friends_attending_weekend?: boolean | null
          has_spouse_attended_weekend?: boolean | null
          id?: string
          is_christian?: boolean | null
          last_name?: string
          marital_status?: string | null
          medical_conditions?: string | null
          member_of_clergy?: boolean | null
          phone?: string
          reason_for_attending?: string | null
          shirt_size?: string
          spouse_name?: string | null
          spouse_weekend_location?: string | null
          state?: string
          zip?: string
        }
        Relationships: [
          {
            foreignKeyName: 'candidate_info_candidate_id_fkey'
            columns: ['candidate_id']
            isOneToOne: false
            referencedRelation: 'candidates'
            referencedColumns: ['id']
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
            foreignKeyName: 'candidate_sponsorship_info_candidate_id_fkey'
            columns: ['candidate_id']
            isOneToOne: false
            referencedRelation: 'candidates'
            referencedColumns: ['id']
          },
        ]
      }
      candidates: {
        Row: {
          created_at: string
          id: string
          status: Database['public']['Enums']['candidate_status']
          updated_at: string
          weekend_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          status?: Database['public']['Enums']['candidate_status']
          updated_at?: string
          weekend_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          status?: Database['public']['Enums']['candidate_status']
          updated_at?: string
          weekend_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'candidates_weekend_id_fkey'
            columns: ['weekend_id']
            isOneToOne: false
            referencedRelation: 'weekends'
            referencedColumns: ['id']
          },
        ]
      }
      community_encouragements: {
        Row: {
          created_at: string
          id: string
          message: string | null
          updated_at: string
          updated_by_user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          updated_at?: string
          updated_by_user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          updated_at?: string
          updated_by_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'community_encouragements_updated_by_user_id_fkey'
            columns: ['updated_by_user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
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
      deposit_payments: {
        Row: {
          created_at: string | null
          deposit_id: string
          id: string
          payment_transaction_id: string
        }
        Insert: {
          created_at?: string | null
          deposit_id: string
          id?: string
          payment_transaction_id: string
        }
        Update: {
          created_at?: string | null
          deposit_id?: string
          id?: string
          payment_transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'deposit_payments_deposit_id_fkey'
            columns: ['deposit_id']
            isOneToOne: false
            referencedRelation: 'deposits'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'deposit_payments_payment_transaction_id_fkey'
            columns: ['payment_transaction_id']
            isOneToOne: false
            referencedRelation: 'payment_transaction'
            referencedColumns: ['id']
          },
        ]
      }
      deposits: {
        Row: {
          amount: number
          arrival_date: string | null
          created_at: string | null
          deposit_type: string
          id: string
          notes: string | null
          payout_id: string | null
          status: string
          transaction_count: number
        }
        Insert: {
          amount: number
          arrival_date?: string | null
          created_at?: string | null
          deposit_type: string
          id?: string
          notes?: string | null
          payout_id?: string | null
          status: string
          transaction_count?: number
        }
        Update: {
          amount?: number
          arrival_date?: string | null
          created_at?: string | null
          deposit_type?: string
          id?: string
          notes?: string | null
          payout_id?: string | null
          status?: string
          transaction_count?: number
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          datetime: string | null
          end_datetime: string | null
          id: number
          location: string | null
          title: string | null
          type: Database['public']['Enums']['event_type'] | null
          weekend_id: string | null
        }
        Insert: {
          created_at?: string
          datetime?: string | null
          end_datetime?: string | null
          id?: number
          location?: string | null
          title?: string | null
          type?: Database['public']['Enums']['event_type'] | null
          weekend_id?: string | null
        }
        Update: {
          created_at?: string
          datetime?: string | null
          end_datetime?: string | null
          id?: number
          location?: string | null
          title?: string | null
          type?: Database['public']['Enums']['event_type'] | null
          weekend_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'events_weekend_id_fkey'
            columns: ['weekend_id']
            isOneToOne: false
            referencedRelation: 'weekends'
            referencedColumns: ['id']
          },
        ]
      }
      payment_transaction: {
        Row: {
          balance_transaction_id: string | null
          charge_id: string | null
          created_at: string | null
          gross_amount: number
          id: string
          net_amount: number | null
          notes: string | null
          payment_intent_id: string | null
          payment_method: string
          payment_owner: string | null
          stripe_fee: number | null
          target_id: string | null
          target_type: string | null
          type: string
          weekend_id: string | null
        }
        Insert: {
          balance_transaction_id?: string | null
          charge_id?: string | null
          created_at?: string | null
          gross_amount: number
          id?: string
          net_amount?: number | null
          notes?: string | null
          payment_intent_id?: string | null
          payment_method: string
          payment_owner?: string | null
          stripe_fee?: number | null
          target_id?: string | null
          target_type?: string | null
          type: string
          weekend_id?: string | null
        }
        Update: {
          balance_transaction_id?: string | null
          charge_id?: string | null
          created_at?: string | null
          gross_amount?: number
          id?: string
          net_amount?: number | null
          notes?: string | null
          payment_intent_id?: string | null
          payment_method?: string
          payment_owner?: string | null
          stripe_fee?: number | null
          target_id?: string | null
          target_type?: string | null
          type?: string
          weekend_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'payment_transaction_weekend_id_fkey'
            columns: ['weekend_id']
            isOneToOne: false
            referencedRelation: 'weekends'
            referencedColumns: ['id']
          },
        ]
      }
      roles: {
        Row: {
          description: string | null
          id: string
          label: string
          permissions: string[]
          type: Database['public']['Enums']['role_type']
        }
        Insert: {
          description?: string | null
          id?: string
          label: string
          permissions: string[]
          type?: Database['public']['Enums']['role_type']
        }
        Update: {
          description?: string | null
          id?: string
          label?: string
          permissions?: string[]
          type?: Database['public']['Enums']['role_type']
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string | null
          updated_by_user_id: string | null
          value: string
        }
        Insert: {
          key: string
          updated_at?: string | null
          updated_by_user_id?: string | null
          value: string
        }
        Update: {
          key?: string
          updated_at?: string | null
          updated_by_user_id?: string | null
          value?: string
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
            foreignKeyName: 'user_roles_role_id_fkey'
            columns: ['role_id']
            isOneToOne: false
            referencedRelation: 'roles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'user_roles_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      users: {
        Row: {
          address: Json | null
          church_affiliation: string | null
          email: string | null
          essentials_training_date: string | null
          first_name: string | null
          gender: string | null
          id: string
          last_name: string | null
          phone_number: string | null
          special_gifts_and_skills: string[] | null
          weekend_attended: string | null
        }
        Insert: {
          address?: Json | null
          church_affiliation?: string | null
          email?: string | null
          essentials_training_date?: string | null
          first_name?: string | null
          gender?: string | null
          id: string
          last_name?: string | null
          phone_number?: string | null
          special_gifts_and_skills?: string[] | null
          weekend_attended?: string | null
        }
        Update: {
          address?: Json | null
          church_affiliation?: string | null
          email?: string | null
          essentials_training_date?: string | null
          first_name?: string | null
          gender?: string | null
          id?: string
          last_name?: string | null
          phone_number?: string | null
          special_gifts_and_skills?: string[] | null
          weekend_attended?: string | null
        }
        Relationships: []
      }
      users_experience: {
        Row: {
          cha_role: string
          created_at: string
          id: string
          rollo: string | null
          updated_at: string
          user_id: string
          weekend_id: string | null
          weekend_reference: string
        }
        Insert: {
          cha_role: string
          created_at?: string
          id?: string
          rollo?: string | null
          updated_at?: string
          user_id: string
          weekend_id?: string | null
          weekend_reference: string
        }
        Update: {
          cha_role?: string
          created_at?: string
          id?: string
          rollo?: string | null
          updated_at?: string
          user_id?: string
          weekend_id?: string | null
          weekend_reference?: string
        }
        Relationships: [
          {
            foreignKeyName: 'users_experience_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'users_experience_weekend_id_fkey'
            columns: ['weekend_id']
            isOneToOne: false
            referencedRelation: 'weekends'
            referencedColumns: ['id']
          },
        ]
      }
      weekend_roster: {
        Row: {
          additional_cha_role: string | null
          cha_role: string | null
          completed_camp_waiver_at: string | null
          completed_commitment_form_at: string | null
          completed_info_sheet_at: string | null
          completed_release_of_claim_at: string | null
          completed_statement_of_belief_at: string | null
          created_at: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          id: string
          medical_conditions: string | null
          rollo: string | null
          special_needs: string | null
          status: string | null
          user_id: string | null
          weekend_id: string | null
        }
        Insert: {
          additional_cha_role?: string | null
          cha_role?: string | null
          completed_camp_waiver_at?: string | null
          completed_commitment_form_at?: string | null
          completed_info_sheet_at?: string | null
          completed_release_of_claim_at?: string | null
          completed_statement_of_belief_at?: string | null
          created_at?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          id?: string
          medical_conditions?: string | null
          rollo?: string | null
          special_needs?: string | null
          status?: string | null
          user_id?: string | null
          weekend_id?: string | null
        }
        Update: {
          additional_cha_role?: string | null
          cha_role?: string | null
          completed_camp_waiver_at?: string | null
          completed_commitment_form_at?: string | null
          completed_info_sheet_at?: string | null
          completed_release_of_claim_at?: string | null
          completed_statement_of_belief_at?: string | null
          created_at?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          id?: string
          medical_conditions?: string | null
          rollo?: string | null
          special_needs?: string | null
          status?: string | null
          user_id?: string | null
          weekend_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'weekend_roster_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'weekend_roster_weekend_id_fkey'
            columns: ['weekend_id']
            isOneToOne: false
            referencedRelation: 'weekends'
            referencedColumns: ['id']
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
          type: Database['public']['Enums']['weekend_type']
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
          type: Database['public']['Enums']['weekend_type']
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
          type?: Database['public']['Enums']['weekend_type']
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
        | 'sponsored'
        | 'awaiting_forms'
        | 'pending_approval'
        | 'awaiting_payment'
        | 'confirmed'
        | 'rejected'
      event_type:
        | 'meeting'
        | 'weekend'
        | 'serenade'
        | 'sendoff'
        | 'closing'
        | 'other'
      permissions: 'READ_MEDICAL_HISTORY'
      role_type: 'INDIVIDUAL' | 'COMMITTEE'
      weekend_type: 'MENS' | 'WOMENS'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      candidate_status: [
        'sponsored',
        'awaiting_forms',
        'pending_approval',
        'awaiting_payment',
        'confirmed',
        'rejected',
      ],
      event_type: [
        'meeting',
        'weekend',
        'serenade',
        'sendoff',
        'closing',
        'other',
      ],
      permissions: ['READ_MEDICAL_HISTORY'],
      role_type: ['INDIVIDUAL', 'COMMITTEE'],
      weekend_type: ['MENS', 'WOMENS'],
    },
  },
} as const
