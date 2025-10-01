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
      api_rate_limits: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          identifier: string
          request_count: number | null
          window_start: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          identifier: string
          request_count?: number | null
          window_start?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          identifier?: string
          request_count?: number | null
          window_start?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          client_id: string
          created_at: string | null
          id: string
          notes: string | null
          reschedule_requests: Json | null
          scheduled_at: string
          service_id: string
          status: string
          trainer_id: string
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          id?: string
          notes?: string | null
          reschedule_requests?: Json | null
          scheduled_at: string
          service_id: string
          status: string
          trainer_id: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          reschedule_requests?: Json | null
          scheduled_at?: string
          service_id?: string
          status?: string
          trainer_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "public_trainer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chats: {
        Row: {
          client_id: string
          created_at: string | null
          id: string
          trainer_id: string
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          id?: string
          trainer_id: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          id?: string
          trainer_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chats_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_trainer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "public_trainer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          booking_id: string | null
          client_email: string
          client_name: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          invitation_data: Json
          invitation_token: string | null
          status: string
          trainer_id: string
          updated_at: string | null
        }
        Insert: {
          booking_id?: string | null
          client_email: string
          client_name?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          invitation_data?: Json
          invitation_token?: string | null
          status?: string
          trainer_id: string
          updated_at?: string | null
        }
        Update: {
          booking_id?: string | null
          client_email?: string
          client_name?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          invitation_data?: Json
          invitation_token?: string | null
          status?: string
          trainer_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      manual_blocks: {
        Row: {
          created_at: string | null
          date: string
          end_time: string
          id: string
          start_time: string
          title: string
          trainer_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          end_time: string
          id?: string
          start_time: string
          title: string
          trainer_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          end_time?: string
          id?: string
          start_time?: string
          title?: string
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "manual_blocks_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manual_blocks_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "public_trainer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          chat_id: string
          content: string
          created_at: string | null
          id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          chat_id: string
          content: string
          created_at?: string | null
          id?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          chat_id?: string
          content?: string
          created_at?: string | null
          id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "public_trainer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatarurl: string | null
          city: string | null
          created_at: string | null
          email: string
          geolocation_preference: string | null
          id: string
          language: string | null
          language_preference: string | null
          name: string
          pending_role: string | null
          role: string
          surname: string | null
          updated_at: string | null
        }
        Insert: {
          avatarurl?: string | null
          city?: string | null
          created_at?: string | null
          email: string
          geolocation_preference?: string | null
          id: string
          language?: string | null
          language_preference?: string | null
          name: string
          pending_role?: string | null
          role: string
          surname?: string | null
          updated_at?: string | null
        }
        Update: {
          avatarurl?: string | null
          city?: string | null
          created_at?: string | null
          email?: string
          geolocation_preference?: string | null
          id?: string
          language?: string | null
          language_preference?: string | null
          name?: string
          pending_role?: string | null
          role?: string
          surname?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string | null
          client_id: string
          comment: string | null
          created_at: string | null
          id: string
          photos: string[] | null
          rating: number
          trainer_id: string
          trainer_reply: Json | null
          updated_at: string | null
        }
        Insert: {
          booking_id?: string | null
          client_id: string
          comment?: string | null
          created_at?: string | null
          id?: string
          photos?: string[] | null
          rating: number
          trainer_id: string
          trainer_reply?: Json | null
          updated_at?: string | null
        }
        Update: {
          booking_id?: string | null
          client_id?: string
          comment?: string | null
          created_at?: string | null
          id?: string
          photos?: string[] | null
          rating?: number
          trainer_id?: string
          trainer_reply?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "public_trainer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "public_trainer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      time_off: {
        Row: {
          all_day: boolean | null
          created_at: string | null
          end_date: string
          id: string
          note: string | null
          start_date: string
          trainer_id: string
        }
        Insert: {
          all_day?: boolean | null
          created_at?: string | null
          end_date: string
          id?: string
          note?: string | null
          start_date: string
          trainer_id: string
        }
        Update: {
          all_day?: boolean | null
          created_at?: string | null
          end_date?: string
          id?: string
          note?: string | null
          start_date?: string
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_off_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_off_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "public_trainer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trainers: {
        Row: {
          availability: Json | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          gallery: string[] | null
          gender: string | null
          has_video: boolean | null
          id: string
          is_verified: boolean | null
          languages: string[] | null
          locations: Json | null
          off_mode: boolean | null
          price_from: number | null
          rating: number | null
          review_count: number | null
          services: Json | null
          settings: Json | null
          specialties: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          availability?: Json | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          gallery?: string[] | null
          gender?: string | null
          has_video?: boolean | null
          id?: string
          is_verified?: boolean | null
          languages?: string[] | null
          locations?: Json | null
          off_mode?: boolean | null
          price_from?: number | null
          rating?: number | null
          review_count?: number | null
          services?: Json | null
          settings?: Json | null
          specialties?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          availability?: Json | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          gallery?: string[] | null
          gender?: string | null
          has_video?: boolean | null
          id?: string
          is_verified?: boolean | null
          languages?: string[] | null
          locations?: Json | null
          off_mode?: boolean | null
          price_from?: number | null
          rating?: number | null
          review_count?: number | null
          services?: Json | null
          settings?: Json | null
          specialties?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "public_trainer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_trainer_profiles: {
        Row: {
          avatarurl: string | null
          city: string | null
          created_at: string | null
          id: string | null
          name: string | null
        }
        Insert: {
          avatarurl?: string | null
          city?: string | null
          created_at?: string | null
          id?: string | null
          name?: string | null
        }
        Update: {
          avatarurl?: string | null
          city?: string | null
          created_at?: string | null
          id?: string | null
          name?: string | null
        }
        Relationships: []
      }
      trainers_public_view: {
        Row: {
          avatarurl: string | null
          bio: string | null
          city: string | null
          created_at: string | null
          display_name: string | null
          gallery: string[] | null
          has_video: boolean | null
          id: string | null
          is_verified: boolean | null
          languages: string[] | null
          locations: Json | null
          name: string | null
          price_from: number | null
          rating: number | null
          review_count: number | null
          services: Json | null
          specialties: string[] | null
        }
        Relationships: []
      }
    }
    Functions: {
      accept_invitation_by_token: {
        Args: { token: string; user_id: string }
        Returns: Json
      }
      check_rate_limit: {
        Args: {
          max_requests?: number
          req_endpoint: string
          req_identifier: string
          window_minutes?: number
        }
        Returns: boolean
      }
      get_booking_partner_profile: {
        Args: { partner_id: string }
        Returns: {
          avatarurl: string
          city: string
          id: string
          name: string
        }[]
      }
      get_limited_profile_for_chat: {
        Args: { profile_user_id: string }
        Returns: {
          avatarurl: string
          id: string
          name: string
        }[]
      }
      get_profiles_for_bookings: {
        Args: { profile_ids: string[] }
        Returns: {
          avatarurl: string
          email: string
          id: string
          name: string
          surname: string
        }[]
      }
      get_reviewer_profiles: {
        Args: { reviewer_ids: string[] }
        Returns: {
          avatarurl: string
          id: string
          name: string
          surname: string
        }[]
      }
      get_trainer_invitations: {
        Args: Record<PropertyKey, never>
        Returns: {
          booking_id: string
          client_name: string
          created_at: string
          expires_at: string
          id: string
          status: string
          trainer_id: string
        }[]
      }
      users_have_bookings_together: {
        Args: { user_id_1: string; user_id_2: string }
        Returns: boolean
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
    Enums: {},
  },
} as const
