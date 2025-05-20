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
      bin_tally_forms: {
        Row: {
          area: string | null
          company_id: string
          created_at: string
          created_by: string
          description: string | null
          id: string
          location: string | null
          title: string
          unique_code: string
          updated_at: string
        }
        Insert: {
          area?: string | null
          company_id: string
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          location?: string | null
          title: string
          unique_code: string
          updated_at?: string
        }
        Update: {
          area?: string | null
          company_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          location?: string | null
          title?: string
          unique_code?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bin_tally_forms_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bin_tally_forms_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bin_types: {
        Row: {
          bin_size: string | null
          color: string | null
          created_at: string
          icon: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          bin_size?: string | null
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          bin_size?: string | null
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          abn: string
          address: string
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          abn: string
          address: string
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          abn?: string
          address?: string
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      contamination_bin_types: {
        Row: {
          bin_type_id: string
          contamination_type_id: string
          created_at: string
          id: string
        }
        Insert: {
          bin_type_id: string
          contamination_type_id: string
          created_at?: string
          id?: string
        }
        Update: {
          bin_type_id?: string
          contamination_type_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contamination_bin_types_bin_type_id_fkey"
            columns: ["bin_type_id"]
            isOneToOne: false
            referencedRelation: "bin_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contamination_bin_types_contamination_type_id_fkey"
            columns: ["contamination_type_id"]
            isOneToOne: false
            referencedRelation: "contamination_types"
            referencedColumns: ["id"]
          },
        ]
      }
      contamination_types: {
        Row: {
          company_id: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contamination_types_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      form_bins: {
        Row: {
          bin_type_id: string
          created_at: string
          form_id: string
          id: string
          quantity: number
          updated_at: string
        }
        Insert: {
          bin_type_id: string
          created_at?: string
          form_id: string
          id?: string
          quantity?: number
          updated_at?: string
        }
        Update: {
          bin_type_id?: string
          created_at?: string
          form_id?: string
          id?: string
          quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_bins_bin_type_id_fkey"
            columns: ["bin_type_id"]
            isOneToOne: false
            referencedRelation: "bin_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_bins_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "bin_tally_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      form_submissions: {
        Row: {
          data: Json
          form_id: string
          id: string
          submitted_at: string
          submitted_by: string
        }
        Insert: {
          data: Json
          form_id: string
          id?: string
          submitted_at?: string
          submitted_by: string
        }
        Update: {
          data?: Json
          form_id?: string
          id?: string
          submitted_at?: string
          submitted_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "bin_tally_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          access_code: string
          created_at: string
          email: string
          expires_at: string | null
          form_id: string
          id: string
          is_used: boolean
          last_updated_at: string
          status: string
        }
        Insert: {
          access_code: string
          created_at?: string
          email: string
          expires_at?: string | null
          form_id: string
          id?: string
          is_used?: boolean
          last_updated_at?: string
          status?: string
        }
        Update: {
          access_code?: string
          created_at?: string
          email?: string
          expires_at?: string | null
          form_id?: string
          id?: string
          is_used?: boolean
          last_updated_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "bin_tally_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          company_id: string
          created_at: string | null
          email: string
          id: string
          last_login: string | null
          name: string
          password_hash: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          email: string
          id?: string
          last_login?: string | null
          name: string
          password_hash?: string | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          email?: string
          id?: string
          last_login?: string | null
          name?: string
          password_hash?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_random_code: {
        Args: { length: number }
        Returns: string
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      hash_password: {
        Args: { password: string }
        Returns: string
      }
    }
    Enums: {
      app_role: "super_admin" | "site_admin"
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
      app_role: ["super_admin", "site_admin"],
    },
  },
} as const
