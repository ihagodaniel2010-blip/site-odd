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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          auth_user_id: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      areas_served: {
        Row: {
          active: boolean
          city: string
          created_at: string
          display_order: number
          id: string
          state: string
          updated_at: string
          zip_codes: string[]
          zone: string
        }
        Insert: {
          active?: boolean
          city: string
          created_at?: string
          display_order?: number
          id?: string
          state: string
          updated_at?: string
          zip_codes?: string[]
          zone: string
        }
        Update: {
          active?: boolean
          city?: string
          created_at?: string
          display_order?: number
          id?: string
          state?: string
          updated_at?: string
          zip_codes?: string[]
          zone?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          cleaner_id: string | null
          created_at: string
          customer_id: string | null
          id: string
          notes: string | null
          price: number | null
          scheduled_date: string | null
          scheduled_time: string | null
          service_request_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          cleaner_id?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          notes?: string | null
          price?: number | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          service_request_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          cleaner_id?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          notes?: string | null
          price?: number | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          service_request_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      cleaners: {
        Row: {
          availability: Json | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          notes: string | null
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          availability?: Json | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          availability?: Json | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          email: string | null
          id: string
          last_service_date: string | null
          name: string
          notes: string | null
          phone: string | null
          status: string
          total_spent: number
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_service_date?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          status?: string
          total_spent?: number
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_service_date?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          status?: string
          total_spent?: number
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      estimate_requests: {
        Row: {
          address: string
          admin_notes: string | null
          bathrooms: string | null
          bedrooms: string | null
          calculated_estimate: number | null
          city: string | null
          contacted_via: string | null
          created_at: string
          email: string
          estimate_breakdown: Json | null
          frequency: string | null
          full_name: string
          id: string
          notes: string | null
          phone: string
          preferred_date: string | null
          preferred_time: string | null
          property_type: string | null
          service_type: string
          service_zone: string | null
          status: Database["public"]["Enums"]["estimate_status"]
          updated_at: string
          zip_code: string
        }
        Insert: {
          address: string
          admin_notes?: string | null
          bathrooms?: string | null
          bedrooms?: string | null
          calculated_estimate?: number | null
          city?: string | null
          contacted_via?: string | null
          created_at?: string
          email: string
          estimate_breakdown?: Json | null
          frequency?: string | null
          full_name: string
          id?: string
          notes?: string | null
          phone: string
          preferred_date?: string | null
          preferred_time?: string | null
          property_type?: string | null
          service_type: string
          service_zone?: string | null
          status?: Database["public"]["Enums"]["estimate_status"]
          updated_at?: string
          zip_code: string
        }
        Update: {
          address?: string
          admin_notes?: string | null
          bathrooms?: string | null
          bedrooms?: string | null
          calculated_estimate?: number | null
          city?: string | null
          contacted_via?: string | null
          created_at?: string
          email?: string
          estimate_breakdown?: Json | null
          frequency?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string
          preferred_date?: string | null
          preferred_time?: string | null
          property_type?: string | null
          service_type?: string
          service_zone?: string | null
          status?: Database["public"]["Enums"]["estimate_status"]
          updated_at?: string
          zip_code?: string
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          alt_text: string | null
          created_at: string
          file_name: string
          file_type: string
          file_url: string
          id: string
          section: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          file_name: string
          file_type: string
          file_url: string
          id?: string
          section?: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          file_name?: string
          file_type?: string
          file_url?: string
          id?: string
          section?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          channel: string
          client_name: string
          created_at: string
          email: string
          estimate_request_id: string | null
          full_name: string | null
          id: string
          message: string
          phone: string | null
          sent_at: string | null
          status: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          channel?: string
          client_name: string
          created_at?: string
          email: string
          estimate_request_id?: string | null
          full_name?: string | null
          id?: string
          message: string
          phone?: string | null
          sent_at?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          channel?: string
          client_name?: string
          created_at?: string
          email?: string
          estimate_request_id?: string | null
          full_name?: string | null
          id?: string
          message?: string
          phone?: string | null
          sent_at?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_estimate_request_id_fkey"
            columns: ["estimate_request_id"]
            isOneToOne: false
            referencedRelation: "estimate_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_items: {
        Row: {
          active: boolean
          after_image_url: string | null
          before_image_url: string | null
          category: string | null
          created_at: string
          description: string | null
          display_order: number
          featured: boolean
          id: string
          image_url: string | null
          is_featured: boolean
          is_public: boolean
          location: string | null
          room: string | null
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          after_image_url?: string | null
          before_image_url?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          featured?: boolean
          id?: string
          image_url?: string | null
          is_featured?: boolean
          is_public?: boolean
          location?: string | null
          room?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          after_image_url?: string | null
          before_image_url?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          featured?: boolean
          id?: string
          image_url?: string | null
          is_featured?: boolean
          is_public?: boolean
          location?: string | null
          room?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      pricing_rules: {
        Row: {
          active: boolean
          category: string
          created_at: string
          id: string
          label: string
          name: string
          sort_order: number
          updated_at: string
          value: number
          value_type: string
        }
        Insert: {
          active?: boolean
          category: string
          created_at?: string
          id?: string
          label: string
          name: string
          sort_order?: number
          updated_at?: string
          value?: number
          value_type?: string
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          id?: string
          label?: string
          name?: string
          sort_order?: number
          updated_at?: string
          value?: number
          value_type?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          anonymize_name: boolean
          created_at: string
          customer_name: string | null
          id: string
          is_featured: boolean
          is_public: boolean
          rating: number | null
          review_text: string | null
          updated_at: string
        }
        Insert: {
          anonymize_name?: boolean
          created_at?: string
          customer_name?: string | null
          id?: string
          is_featured?: boolean
          is_public?: boolean
          rating?: number | null
          review_text?: string | null
          updated_at?: string
        }
        Update: {
          anonymize_name?: boolean
          created_at?: string
          customer_name?: string | null
          id?: string
          is_featured?: boolean
          is_public?: boolean
          rating?: number | null
          review_text?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      service_requests: {
        Row: {
          address: string | null
          admin_notes: string | null
          bathrooms: number | null
          bedrooms: number | null
          calculated_estimate: number | null
          city: string | null
          contacted_via: string | null
          created_at: string
          customer_id: string | null
          email: string | null
          estimate_breakdown: Json | null
          estimated_price_max: number | null
          estimated_price_min: number | null
          extras: Json | null
          frequency: string | null
          full_name: string | null
          home_size: string | null
          id: string
          notes: string | null
          phone: string | null
          preferred_date: string | null
          preferred_time: string | null
          property_type: string | null
          service_type: string | null
          service_zone: string | null
          status: string
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          admin_notes?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          calculated_estimate?: number | null
          city?: string | null
          contacted_via?: string | null
          created_at?: string
          customer_id?: string | null
          email?: string | null
          estimate_breakdown?: Json | null
          estimated_price_max?: number | null
          estimated_price_min?: number | null
          extras?: Json | null
          frequency?: string | null
          full_name?: string | null
          home_size?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          property_type?: string | null
          service_type?: string | null
          service_zone?: string | null
          status?: string
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          admin_notes?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          calculated_estimate?: number | null
          city?: string | null
          contacted_via?: string | null
          created_at?: string
          customer_id?: string | null
          email?: string | null
          estimate_breakdown?: Json | null
          estimated_price_max?: number | null
          estimated_price_min?: number | null
          extras?: Json | null
          frequency?: string | null
          full_name?: string | null
          home_size?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          property_type?: string | null
          service_type?: string | null
          service_zone?: string | null
          status?: string
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          display_order: number
          id: string
          image_url: string | null
          name: string
          slug: string
          starting_price: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          name: string
          slug: string
          starting_price?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
          starting_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          category: string
          id: string
          label: string
          setting_key: string
          setting_type: string
          setting_value: Json | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          category?: string
          id?: string
          label: string
          setting_key: string
          setting_type?: string
          setting_value?: Json | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          category?: string
          id?: string
          label?: string
          setting_key?: string
          setting_type?: string
          setting_value?: Json | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "staff" | "user"
      estimate_status:
        | "new_request"
        | "contacted"
        | "estimate_sent"
        | "scheduled"
        | "completed"
        | "cancelled"
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
      app_role: ["admin", "staff", "user"],
      estimate_status: [
        "new_request",
        "contacted",
        "estimate_sent",
        "scheduled",
        "completed",
        "cancelled",
      ],
    },
  },
} as const
