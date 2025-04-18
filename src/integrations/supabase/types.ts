export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Define the UserLocation interface for our application
export interface UserLocation {
  id?: string;
  user_id: string;
  hunt_id: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
  display_name?: string;
  last_waypoint?: string;
}

export type Database = {
  public: {
    Tables: {
      hints: {
        Row: {
          created_at: string | null
          distance_threshold: number
          id: string
          revealed: boolean
          text: string
          waypoint_id: string
        }
        Insert: {
          created_at?: string | null
          distance_threshold: number
          id?: string
          revealed?: boolean
          text: string
          waypoint_id: string
        }
        Update: {
          created_at?: string | null
          distance_threshold?: number
          id?: string
          revealed?: boolean
          text?: string
          waypoint_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hints_waypoint_id_fkey"
            columns: ["waypoint_id"]
            isOneToOne: false
            referencedRelation: "waypoints"
            referencedColumns: ["id"]
          },
        ]
      }
      hunts: {
        Row: {
          active: boolean
          created_at: string | null
          date: string | null
          id: string
          name: string
        }
        Insert: {
          active?: boolean
          created_at?: string | null
          date?: string | null
          id?: string
          name: string
        }
        Update: {
          active?: boolean
          created_at?: string | null
          date?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      waypoints: {
        Row: {
          created_at: string | null
          found: boolean
          hunt_id: string
          id: string
          latitude: number
          longitude: number
          name: string
          order_number: number
          starting_hint: string | null
        }
        Insert: {
          created_at?: string | null
          found?: boolean
          hunt_id: string
          id?: string
          latitude: number
          longitude: number
          name: string
          order_number: number
          starting_hint?: string | null
        }
        Update: {
          created_at?: string | null
          found?: boolean
          hunt_id?: string
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          order_number?: number
          starting_hint?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "waypoints_hunt_id_fkey"
            columns: ["hunt_id"]
            isOneToOne: false
            referencedRelation: "hunts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_locations: {
        Row: {
          id: string
          user_id: string
          hunt_id: string
          latitude: number
          longitude: number
          accuracy: number
          display_name: string | null
          timestamp: string
          last_waypoint: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          hunt_id: string
          latitude: number
          longitude: number
          accuracy: number
          display_name?: string | null
          timestamp?: string
          last_waypoint?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          hunt_id?: string
          latitude?: number
          longitude?: number
          accuracy?: number
          display_name?: string | null
          timestamp?: string
          last_waypoint?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_locations_hunt_id_fkey"
            columns: ["hunt_id"]
            isOneToOne: false
            referencedRelation: "hunts"
            referencedColumns: ["id"]
          }
        ]
      }
      photo_submissions: {
        Row: {
          id: string
          hunt_id: string
          waypoint_id: string
          photo_url: string
          timestamp: string
          status: string
          created_at: string | null
        }
        Insert: {
          id?: string
          hunt_id: string
          waypoint_id: string
          photo_url: string
          timestamp: string
          status: string
          created_at?: string | null
        }
        Update: {
          id?: string
          hunt_id?: string
          waypoint_id?: string
          photo_url?: string
          timestamp?: string
          status?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "photo_submissions_hunt_id_fkey"
            columns: ["hunt_id"]
            isOneToOne: false
            referencedRelation: "hunts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_submissions_waypoint_id_fkey"
            columns: ["waypoint_id"]
            isOneToOne: false
            referencedRelation: "waypoints"
            referencedColumns: ["id"]
          }
        ]
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
