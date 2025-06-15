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
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      product_prices: {
        Row: {
          created_at: string
          id: string
          price: number
          product_id: string
          store_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          price: number
          product_id: string
          store_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          price?: number
          product_id?: string
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_prices_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          unit: string
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          unit: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      shopping_plans: {
        Row: {
          created_at: string
          custom_frequency_days: number | null
          delivery_address: string | null
          estimated_total: number
          frequency: string
          id: string
          is_active: boolean
          item_count: number
          items: Json
          name: string
          pickup_time: string | null
          shopping_type: string
          store_address: string | null
          store_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_frequency_days?: number | null
          delivery_address?: string | null
          estimated_total?: number
          frequency: string
          id?: string
          is_active?: boolean
          item_count?: number
          items?: Json
          name: string
          pickup_time?: string | null
          shopping_type: string
          store_address?: string | null
          store_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          custom_frequency_days?: number | null
          delivery_address?: string | null
          estimated_total?: number
          frequency?: string
          id?: string
          is_active?: boolean
          item_count?: number
          items?: Json
          name?: string
          pickup_time?: string | null
          shopping_type?: string
          store_address?: string | null
          store_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shopping_sessions: {
        Row: {
          created_at: string
          id: string
          session_data: Json
          shopping_type: string | null
          store_preference: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          session_data?: Json
          shopping_type?: string | null
          store_preference?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          session_data?: Json
          shopping_type?: string | null
          store_preference?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      store_locations: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          chain: string
          city: string | null
          county: string | null
          created_at: string | null
          departments: Json | null
          division_number: string | null
          geolocation: unknown | null
          hours: Json | null
          id: string
          latitude: number | null
          location_id: string | null
          longitude: number | null
          name: string
          phone: string | null
          state: string | null
          store_number: string | null
          zip_code: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          chain: string
          city?: string | null
          county?: string | null
          created_at?: string | null
          departments?: Json | null
          division_number?: string | null
          geolocation?: unknown | null
          hours?: Json | null
          id?: string
          latitude?: number | null
          location_id?: string | null
          longitude?: number | null
          name: string
          phone?: string | null
          state?: string | null
          store_number?: string | null
          zip_code?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          chain?: string
          city?: string | null
          county?: string | null
          created_at?: string | null
          departments?: Json | null
          division_number?: string | null
          geolocation?: unknown | null
          hours?: Json | null
          id?: string
          latitude?: number | null
          location_id?: string | null
          longitude?: number | null
          name?: string
          phone?: string | null
          state?: string | null
          store_number?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      stores: {
        Row: {
          created_at: string
          display_name: string
          id: string
          logo_url: string | null
          name: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          logo_url?: string | null
          name: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          logo_url?: string | null
          name?: string
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
