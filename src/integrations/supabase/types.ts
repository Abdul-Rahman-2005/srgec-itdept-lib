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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      books: {
        Row: {
          author: string
          available_copies: number
          cover_url: string | null
          created_at: string
          edition: string
          id: string
          publisher: string
          title: string
          total_copies: number
          updated_at: string
        }
        Insert: {
          author: string
          available_copies?: number
          cover_url?: string | null
          created_at?: string
          edition: string
          id?: string
          publisher: string
          title: string
          total_copies?: number
          updated_at?: string
        }
        Update: {
          author?: string
          available_copies?: number
          cover_url?: string | null
          created_at?: string
          edition?: string
          id?: string
          publisher?: string
          title?: string
          total_copies?: number
          updated_at?: string
        }
        Relationships: []
      }
      borrows: {
        Row: {
          book_code: string | null
          book_id: string
          borrow_date: string
          created_at: string
          due_date: string
          id: string
          returned_at: string | null
          status: Database["public"]["Enums"]["borrow_status"]
          user_id: string
        }
        Insert: {
          book_code?: string | null
          book_id: string
          borrow_date?: string
          created_at?: string
          due_date?: string
          id?: string
          returned_at?: string | null
          status?: Database["public"]["Enums"]["borrow_status"]
          user_id: string
        }
        Update: {
          book_code?: string | null
          book_id?: string
          borrow_date?: string
          created_at?: string
          due_date?: string
          id?: string
          returned_at?: string | null
          status?: Database["public"]["Enums"]["borrow_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "borrows_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "borrows_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      csp_project_files: {
        Row: {
          academic_year: string
          file_name: string
          file_path: string
          id: string
          uploaded_at: string
          uploaded_by: string
        }
        Insert: {
          academic_year: string
          file_name: string
          file_path: string
          id?: string
          uploaded_at?: string
          uploaded_by: string
        }
        Update: {
          academic_year?: string
          file_name?: string
          file_path?: string
          id?: string
          uploaded_at?: string
          uploaded_by?: string
        }
        Relationships: []
      }
      journals: {
        Row: {
          category: string
          cover_url: string | null
          created_at: string
          id: string
          issn: string
          issue: string
          publication_year: number
          publisher: string
          title: string
          updated_at: string
          volume: string
        }
        Insert: {
          category: string
          cover_url?: string | null
          created_at?: string
          id?: string
          issn: string
          issue: string
          publication_year: number
          publisher: string
          title: string
          updated_at?: string
          volume: string
        }
        Update: {
          category?: string
          cover_url?: string | null
          created_at?: string
          id?: string
          issn?: string
          issue?: string
          publication_year?: number
          publisher?: string
          title?: string
          updated_at?: string
          volume?: string
        }
        Relationships: []
      }
      magazines: {
        Row: {
          category: string
          cover_url: string | null
          created_at: string
          id: string
          issue_number: string
          publication_date: string
          publisher: string
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          cover_url?: string | null
          created_at?: string
          id?: string
          issue_number: string
          publication_date: string
          publisher: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          cover_url?: string | null
          created_at?: string
          id?: string
          issue_number?: string
          publication_date?: string
          publisher?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          name: string
          phone: string
          role: Database["public"]["Enums"]["user_role"]
          roll_or_faculty_id: string | null
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          name: string
          phone: string
          role: Database["public"]["Enums"]["user_role"]
          roll_or_faculty_id?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          phone?: string
          role?: Database["public"]["Enums"]["user_role"]
          roll_or_faculty_id?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_profile_for_login: {
        Args: { p_identifier: string; p_role: string }
        Returns: {
          id: string
          name: string
          status: Database["public"]["Enums"]["user_status"]
        }[]
      }
      is_active_user: { Args: { _user_id: string }; Returns: boolean }
      is_librarian: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      borrow_status: "borrowed" | "returned"
      user_role: "student" | "faculty" | "librarian"
      user_status: "pending" | "active" | "rejected"
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
      borrow_status: ["borrowed", "returned"],
      user_role: ["student", "faculty", "librarian"],
      user_status: ["pending", "active", "rejected"],
    },
  },
} as const
