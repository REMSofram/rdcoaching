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
      daily_logs: {
        Row: {
          appetite: string | null
          client_id: string | null
          created_at: string | null
          energy_level: number | null
          id: string
          log_date: string
          notes: string | null
          plaisir_seance: number | null
          sleep_hours: number | null
          sleep_quality: number | null
          training_done: boolean
          training_type: string | null
          weight: number | null
        }
        Insert: {
          appetite?: string | null
          client_id?: string | null
          created_at?: string | null
          energy_level?: number | null
          id?: string
          log_date?: string
          notes?: string | null
          plaisir_seance?: number | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          training_done?: boolean
          training_type?: string | null
          weight?: number | null
        }
        Update: {
          appetite?: string | null
          client_id?: string | null
          created_at?: string | null
          energy_level?: number | null
          id?: string
          log_date?: string
          notes?: string | null
          plaisir_seance?: number | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          training_done?: boolean
          training_type?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_days: {
        Row: {
          content: string
          created_at: string
          day_order: number
          day_title: string
          id: string
          nutrition_program_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          day_order: number
          day_title: string
          id?: string
          nutrition_program_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          day_order?: number
          day_title?: string
          id?: string
          nutrition_program_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_days_nutrition_program_id_fkey"
            columns: ["nutrition_program_id"]
            isOneToOne: false
            referencedRelation: "nutrition_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_programs: {
        Row: {
          client_id: string
          created_at: string
          id: string
          is_active: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_nutrition_programs_client_id"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_programs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          birth_date: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          height: number | null
          id: string
          injuries: string | null
          is_onboarded: boolean | null
          last_name: string | null
          objectives: string | null
          phone: string | null
          profile_picture_url: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          sports_practiced: string[] | null
          starting_weight: number | null
          updated_at: string | null
        }
        Insert: {
          birth_date?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          height?: number | null
          id: string
          injuries?: string | null
          is_onboarded?: boolean | null
          last_name?: string | null
          objectives?: string | null
          phone?: string | null
          profile_picture_url?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          sports_practiced?: string[] | null
          starting_weight?: number | null
          updated_at?: string | null
        }
        Update: {
          birth_date?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          height?: number | null
          id?: string
          injuries?: string | null
          is_onboarded?: boolean | null
          last_name?: string | null
          objectives?: string | null
          phone?: string | null
          profile_picture_url?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          sports_practiced?: string[] | null
          starting_weight?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      program_days: {
        Row: {
          content: string
          created_at: string | null
          day_order: number
          day_title: string
          id: string
          program_id: string
          updated_at: string | null
        }
        Insert: {
          content?: string
          created_at?: string | null
          day_order: number
          day_title: string
          id?: string
          program_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          day_order?: number
          day_title?: string
          id?: string
          program_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "program_days_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          client_id: string
          content: string
          created_at: string
          id: string
          is_active: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          client_id: string
          content: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_client"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_nutrition_program_with_days: {
        Args: { program_data: Json; days_data: Json[] }
        Returns: {
          client_id: string
          created_at: string
          id: string
          is_active: boolean | null
          title: string
          updated_at: string
        }[]
      }
      create_program_with_days: {
        Args: { program_data: Json; days_data: Json[] }
        Returns: Json
      }
      get_active_nutrition_program_with_days: {
        Args: { client_id: string }
        Returns: Json
      }
      get_active_program: {
        Args: { client_id_param: string }
        Returns: Json
      }
      is_client_of_program: {
        Args: { program_id_param: string }
        Returns: boolean
      }
      is_coach: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      update_nutrition_program_with_days: {
        Args: { program_id: string; program_data: Json; days_data: Json[] }
        Returns: {
          client_id: string
          created_at: string
          id: string
          is_active: boolean | null
          title: string
          updated_at: string
        }[]
      }
      update_program_with_days: {
        Args: { program_id_param: string; program_data: Json; days_data: Json }
        Returns: Json
      }
    }
    Enums: {
      phase_status: "PLANNED" | "ACTIVE" | "COMPLETED" | "UPCOMING"
      phase_type: "CUT" | "BUILD" | "REVERSE" | "AFFUTAGE"
      user_role: "client" | "coach"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never