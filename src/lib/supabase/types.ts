export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          spotify_id: string;
          display_name: string | null;
          email: string | null;
          avatar_url: string | null;
          country: string | null;
          last_synced_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          spotify_id: string;
          display_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          country?: string | null;
          last_synced_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          spotify_id?: string;
          display_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          country?: string | null;
          last_synced_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      listening_history: {
        Row: {
          id: string;
          user_id: string;
          track_id: string;
          track_name: string;
          artist_id: string;
          artist_name: string;
          album_name: string | null;
          album_art_url: string | null;
          played_at: string;
          duration_ms: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          track_id: string;
          track_name: string;
          artist_id: string;
          artist_name: string;
          album_name?: string | null;
          album_art_url?: string | null;
          played_at: string;
          duration_ms: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          track_id?: string;
          track_name?: string;
          artist_id?: string;
          artist_name?: string;
          album_name?: string | null;
          album_art_url?: string | null;
          played_at?: string;
          duration_ms?: number;
          created_at?: string;
        };
      };
      recommendations: {
        Row: {
          id: string;
          user_id: string;
          content: Json;
          generated_at: string;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: Json;
          generated_at?: string;
          expires_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          content?: Json;
          generated_at?: string;
          expires_at?: string;
          created_at?: string;
        };
      };
      waitlist: {
        Row: {
          id: string;
          email: string;
          spotify_id: string | null;
          spotify_name: string | null;
          spotify_image: string | null;
          created_at: string;
          notified_at: string | null;
          converted_at: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          spotify_id?: string | null;
          spotify_name?: string | null;
          spotify_image?: string | null;
          created_at?: string;
          notified_at?: string | null;
          converted_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          spotify_id?: string | null;
          spotify_name?: string | null;
          spotify_image?: string | null;
          created_at?: string;
          notified_at?: string | null;
          converted_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Helper types
export type User = Database['public']['Tables']['users']['Row'];
export type NewUser = Database['public']['Tables']['users']['Insert'];
export type ListeningHistory = Database['public']['Tables']['listening_history']['Row'];
export type NewListeningHistory = Database['public']['Tables']['listening_history']['Insert'];
export type Recommendation = Database['public']['Tables']['recommendations']['Row'];
export type NewRecommendation = Database['public']['Tables']['recommendations']['Insert'];
export type Waitlist = Database['public']['Tables']['waitlist']['Row'];
export type NewWaitlist = Database['public']['Tables']['waitlist']['Insert'];
