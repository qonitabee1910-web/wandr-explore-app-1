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
      bookings: {
        Row: {
          booking_date: string
          booking_type: string
          created_at: string
          details: Json
          id: string
          status: string
          total_price: number
          user_id: string
        }
        Insert: {
          booking_date?: string
          booking_type: string
          created_at?: string
          details?: Json
          id?: string
          status?: string
          total_price?: number
          user_id: string
        }
        Update: {
          booking_date?: string
          booking_type?: string
          created_at?: string
          details?: Json
          id?: string
          status?: string
          total_price?: number
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      promos: {
        Row: {
          category: string
          created_at: string
          description: string | null
          discount_percent: number
          id: string
          image_url: string | null
          is_active: boolean
          title: string
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          discount_percent?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          title: string
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          discount_percent?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          title?: string
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      shuttle_booking_seats: {
        Row: {
          booking_id: string
          created_at: string
          id: string
          seat_label: string
          seat_position: string | null
        }
        Insert: {
          booking_id: string
          created_at?: string
          id?: string
          seat_label: string
          seat_position?: string | null
        }
        Update: {
          booking_id?: string
          created_at?: string
          id?: string
          seat_label?: string
          seat_position?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shuttle_booking_seats_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "shuttle_bookings"
            referencedColumns: ["id"]
          }
        ]
      }
      shuttle_bookings: {
        Row: {
          booking_code: string
          created_at: string
          id: string
          notes: string | null
          passenger_email: string | null
          passenger_name: string
          passenger_phone: string
          payment_method: string | null
          payment_status: string | null
          qr_code: string | null
          schedule_id: string
          seats: string[]
          service_type: string
          status: string | null
          total_price: number
          updated_at: string
          user_id: string | null
          rayon_id: string | null
          pickup_point_id: string | null
        }
        Insert: {
          booking_code: string
          created_at?: string
          id?: string
          notes?: string | null
          passenger_email?: string | null
          passenger_name: string
          passenger_phone: string
          payment_method?: string | null
          payment_status?: string | null
          qr_code?: string | null
          schedule_id: string
          seats: string[]
          service_type: string
          status?: string | null
          total_price: number
          updated_at?: string
          user_id?: string | null
          rayon_id?: string | null
          pickup_point_id?: string | null
        }
        Update: {
          booking_code?: string
          created_at?: string
          id?: string
          notes?: string | null
          passenger_email?: string | null
          passenger_name?: string
          passenger_phone?: string
          payment_method?: string | null
          payment_status?: string | null
          qr_code?: string | null
          schedule_id?: string
          seats?: string[]
          service_type?: string
          status?: string | null
          total_price?: number
          updated_at?: string
          user_id?: string | null
          rayon_id?: string | null
          pickup_point_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shuttle_bookings_rayon_id_fkey"
            columns: ["rayon_id"]
            isOneToOne: false
            referencedRelation: "rayon_zones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shuttle_bookings_pickup_point_id_fkey"
            columns: ["pickup_point_id"]
            isOneToOne: false
            referencedRelation: "pickup_points"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shuttle_bookings_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "shuttle_schedules"
            referencedColumns: ["id"]
          }
        ]
      }
      shuttle_routes: {
        Row: {
          created_at: string
          description: string | null
          destination: string
          id: string
          is_active: boolean | null
          name: string
          origin: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          destination: string
          id?: string
          is_active?: boolean | null
          name: string
          origin: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          destination?: string
          id?: string
          is_active?: boolean | null
          name?: string
          origin?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      shuttle_schedules: {
        Row: {
          arrival_time: string
          available_seats: number
          created_at: string
          departure_time: string
          id: string
          is_active: boolean | null
          price_executive: number
          price_regular: number
          price_vip: number
          route_id: string
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          arrival_time: string
          available_seats: number
          created_at?: string
          departure_time: string
          id?: string
          is_active?: boolean | null
          price_executive: number
          price_regular: number
          price_vip: number
          route_id: string
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          arrival_time?: string
          available_seats?: number
          created_at?: string
          departure_time?: string
          id?: string
          is_active?: boolean | null
          price_executive?: number
          price_regular?: number
          price_vip?: number
          route_id?: string
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shuttle_schedules_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "shuttle_routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shuttle_schedules_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          }
        ]
      }
      shuttle_services: {
        Row: {
          code: string
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      rayon_zones: {
        Row: {
          id: string
          name: string
          description: string | null
          base_fare_regular: number | null
          base_fare_executive: number | null
          base_fare_vip: number | null
          price_per_km_regular: number | null
          price_per_km_executive: number | null
          price_per_km_vip: number | null
          center_lat: number | null
          center_lng: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          base_fare_regular?: number | null
          base_fare_executive?: number | null
          base_fare_vip?: number | null
          price_per_km_regular?: number | null
          price_per_km_executive?: number | null
          price_per_km_vip?: number | null
          center_lat?: number | null
          center_lng?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          base_fare_regular?: number | null
          base_fare_executive?: number | null
          base_fare_vip?: number | null
          price_per_km_regular?: number | null
          price_per_km_executive?: number | null
          price_per_km_vip?: number | null
          center_lat?: number | null
          center_lng?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      pickup_points: {
        Row: {
          id: string
          rayon_id: string | null
          place_name: string
          time_wib: string
          distance_from_previous_mtr: number
          cumulative_distance_mtr: number
          latitude: number
          longitude: number
          jarak_ke_kno: number
          is_active: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          rayon_id?: string | null
          place_name: string
          time_wib: string
          distance_from_previous_mtr?: number
          cumulative_distance_mtr?: number
          latitude: number
          longitude: number
          jarak_ke_kno: number
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          rayon_id?: string | null
          place_name?: string
          time_wib?: string
          distance_from_previous_mtr?: number
          cumulative_distance_mtr?: number
          latitude?: number
          longitude?: number
          jarak_ke_kno?: number
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pickup_points_rayon_id_fkey"
            columns: ["rayon_id"]
            isOneToOne: false
            referencedRelation: "rayon_zones"
            referencedColumns: ["id"]
          }
        ]
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
          role?: Database["public"]["Enums"]["app_role"]
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
      vehicles: {
        Row: {
          created_at: string
          description: string | null
          driver_pos: Json | null
          id: string
          image_url: string | null
          is_active: boolean
          layout: Json
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          driver_pos?: Json | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          layout?: Json
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          driver_pos?: Json | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          layout?: Json
          name?: string
          slug?: string
          updated_at?: string
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
      app_role: "user" | "admin"
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
      app_role: ["user", "admin"],
    },
  },
} as const
